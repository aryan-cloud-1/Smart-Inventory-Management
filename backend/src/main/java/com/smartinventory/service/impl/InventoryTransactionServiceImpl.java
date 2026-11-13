package com.smartinventory.service.impl;

import com.smartinventory.dto.InventoryTransactionDTO;
import com.smartinventory.dto.StockMovementRequest;
import com.smartinventory.entity.InventoryTransaction;
import com.smartinventory.entity.Product;
import com.smartinventory.entity.TransactionType;
import com.smartinventory.entity.User;
import com.smartinventory.exception.InsufficientStockException;
import com.smartinventory.exception.ResourceNotFoundException;
import com.smartinventory.repository.InventoryTransactionRepository;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.UserRepository;
import com.smartinventory.service.AlertNotificationService;
import com.smartinventory.service.AuditLogService;
import com.smartinventory.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryTransactionServiceImpl implements InventoryTransactionService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final AuditLogService auditLogService;
    private final AlertNotificationService alertNotificationService;

    @Override
    @Transactional
    public InventoryTransactionDTO processStockMovement(StockMovementRequest request, String operatorUsername) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        User operator = userRepository.findByUsername(operatorUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", operatorUsername));

        int prevBalance = product.getCurrentStock();
        int newBalance;
        int qty = request.getQuantity();

        switch (request.getTransactionType()) {
            case STOCK_IN:
            case RETURN:
                newBalance = prevBalance + qty;
                break;

            case STOCK_OUT:
            case TRANSFER:
                if (prevBalance < qty) {
                    throw new InsufficientStockException(product.getSku(), qty, prevBalance);
                }
                newBalance = prevBalance - qty;
                break;

            case ADJUSTMENT:
                // For ADJUSTMENT, quantity is treated as the target reconciled count
                newBalance = qty;
                qty = Math.abs(newBalance - prevBalance);
                break;

            default:
                throw new IllegalArgumentException("Unknown transaction type: " + request.getTransactionType());
        }

        // Apply new balance to product entity
        product.setCurrentStock(newBalance);
        productRepository.save(product);

        // Record immutable transaction audit movement
        InventoryTransaction transaction = InventoryTransaction.builder()
                .product(product)
                .transactionType(request.getTransactionType())
                .quantity(qty)
                .previousBalance(prevBalance)
                .newBalance(newBalance)
                .referenceNumber(request.getReferenceNumber())
                .remarks(request.getRemarks())
                .operator(operator)
                .build();

        InventoryTransaction savedTransaction = transactionRepository.save(transaction);

        // Trigger low-stock alert if balance fell below or equal to threshold
        if (product.isLowStock()) {
            alertNotificationService.sendLowStockAlert(product, product.calculateEconomicOrderQuantity());
        }

        auditLogService.recordAction("STOCK_MOVEMENT", savedTransaction.getId(), request.getTransactionType().name(),
                operatorUsername, null,
                String.format("SKU: %s | Qty: %d | Prev: %d -> New: %d | Ref: %s",
                        product.getSku(), qty, prevBalance, newBalance, request.getReferenceNumber()));

        return mapToDTO(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryTransactionDTO> getTransactionsByProduct(String productId, Pageable pageable) {
        return transactionRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryTransactionDTO> getTransactionsByType(TransactionType type, Pageable pageable) {
        return transactionRepository.findByTransactionTypeOrderByCreatedAtDesc(type, pageable)
                .map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryTransactionDTO> getRecentTransactions() {
        return transactionRepository.findTop15ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private InventoryTransactionDTO mapToDTO(InventoryTransaction tx) {
        return InventoryTransactionDTO.builder()
                .id(tx.getId())
                .productId(tx.getProduct().getId())
                .productSku(tx.getProduct().getSku())
                .productName(tx.getProduct().getName())
                .transactionType(tx.getTransactionType())
                .quantity(tx.getQuantity())
                .previousBalance(tx.getPreviousBalance())
                .newBalance(tx.getNewBalance())
                .referenceNumber(tx.getReferenceNumber())
                .remarks(tx.getRemarks())
                .operatorUsername(tx.getOperator().getUsername())
                .operatorFullName(tx.getOperator().getFirstName() + " " + tx.getOperator().getLastName())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
