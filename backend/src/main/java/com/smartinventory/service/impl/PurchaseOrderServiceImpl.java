package com.smartinventory.service.impl;

import com.smartinventory.dto.PurchaseOrderCreateRequest;
import com.smartinventory.dto.PurchaseOrderDTO;
import com.smartinventory.dto.PurchaseOrderItemDTO;
import com.smartinventory.dto.PurchaseOrderItemRequest;
import com.smartinventory.dto.StockMovementRequest;
import com.smartinventory.entity.OrderStatus;
import com.smartinventory.entity.Product;
import com.smartinventory.entity.PurchaseOrder;
import com.smartinventory.entity.PurchaseOrderItem;
import com.smartinventory.entity.Supplier;
import com.smartinventory.entity.TransactionType;
import com.smartinventory.entity.User;
import com.smartinventory.exception.BadRequestException;
import com.smartinventory.exception.ResourceNotFoundException;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.PurchaseOrderRepository;
import com.smartinventory.repository.SupplierRepository;
import com.smartinventory.repository.UserRepository;
import com.smartinventory.service.AuditLogService;
import com.smartinventory.service.InventoryTransactionService;
import com.smartinventory.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final InventoryTransactionService transactionService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderCreateRequest request, String currentUsername) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUsername));

        String poNumber = request.getPoNumber();
        if (!StringUtils.hasText(poNumber)) {
            String dateCode = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            poNumber = "PO-" + dateCode + "-" + suffix;
        }

        if (purchaseOrderRepository.existsByPoNumber(poNumber)) {
            throw new BadRequestException("Purchase order number " + poNumber + " already exists");
        }

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .supplier(supplier)
                .status(OrderStatus.PENDING)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .notes(request.getNotes())
                .createdBy(user)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            BigDecimal subtotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantityOrdered()));
            total = total.add(subtotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .product(product)
                    .quantityOrdered(itemReq.getQuantityOrdered())
                    .quantityReceived(0)
                    .unitPrice(itemReq.getUnitPrice())
                    .subtotal(subtotal)
                    .build();

            po.addItem(item);
        }

        po.setTotalAmount(total);
        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        auditLogService.recordAction("PURCHASE_ORDER", savedPo.getId(), "CREATE", currentUsername, null,
                "Created Purchase Order: " + savedPo.getPoNumber() + " with Total: $" + total);

        return mapToDTO(savedPo);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderDTO getPurchaseOrderById(String id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        return mapToDTO(po);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderDTO> getPurchaseOrders(OrderStatus status, Pageable pageable) {
        Page<PurchaseOrder> page;
        if (status != null) {
            page = purchaseOrderRepository.findByStatus(status, pageable);
        } else {
            page = purchaseOrderRepository.findAll(pageable);
        }
        return page.map(this::mapToDTO);
    }

    @Override
    @Transactional
    public PurchaseOrderDTO updateOrderStatus(String id, OrderStatus newStatus, String currentUsername) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));

        OrderStatus currentStatus = po.getStatus();
        if (currentStatus == OrderStatus.RECEIVED) {
            throw new BadRequestException("Purchase order is already received and cannot be changed");
        }
        if (currentStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Purchase order has been cancelled and cannot be updated");
        }

        po.setStatus(newStatus);

        // When status moves to RECEIVED, automatically increment inventory balances
        if (newStatus == OrderStatus.RECEIVED) {
            po.setActualDeliveryDate(LocalDate.now());

            for (PurchaseOrderItem item : po.getItems()) {
                item.setQuantityReceived(item.getQuantityOrdered());

                StockMovementRequest movement = StockMovementRequest.builder()
                        .productId(item.getProduct().getId())
                        .transactionType(TransactionType.STOCK_IN)
                        .quantity(item.getQuantityOrdered())
                        .referenceNumber(po.getPoNumber())
                        .remarks("Automated Stock-In upon receiving Purchase Order " + po.getPoNumber())
                        .build();

                transactionService.processStockMovement(movement, currentUsername);
            }
        }

        PurchaseOrder updatedPo = purchaseOrderRepository.save(po);

        auditLogService.recordAction("PURCHASE_ORDER", updatedPo.getId(), "STATUS_CHANGE", currentUsername, null,
                String.format("PO %s status updated from %s to %s", updatedPo.getPoNumber(), currentStatus, newStatus));

        return mapToDTO(updatedPo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOrderDTO> getRecentPurchaseOrders() {
        return purchaseOrderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private PurchaseOrderDTO mapToDTO(PurchaseOrder po) {
        List<PurchaseOrderItemDTO> itemDTOs = po.getItems().stream().map(item ->
                PurchaseOrderItemDTO.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productSku(item.getProduct().getSku())
                        .productName(item.getProduct().getName())
                        .quantityOrdered(item.getQuantityOrdered())
                        .quantityReceived(item.getQuantityReceived())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build()
        ).collect(Collectors.toList());

        return PurchaseOrderDTO.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getCompanyName())
                .status(po.getStatus())
                .totalAmount(po.getTotalAmount())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .actualDeliveryDate(po.getActualDeliveryDate())
                .notes(po.getNotes())
                .createdByUsername(po.getCreatedBy().getUsername())
                .items(itemDTOs)
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .build();
    }
}
