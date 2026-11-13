package com.smartinventory.service;

import com.smartinventory.dto.InventoryTransactionDTO;
import com.smartinventory.dto.StockMovementRequest;
import com.smartinventory.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InventoryTransactionService {
    InventoryTransactionDTO processStockMovement(StockMovementRequest request, String operatorUsername);
    Page<InventoryTransactionDTO> getTransactionsByProduct(String productId, Pageable pageable);
    Page<InventoryTransactionDTO> getTransactionsByType(TransactionType type, Pageable pageable);
    List<InventoryTransactionDTO> getRecentTransactions();
}
