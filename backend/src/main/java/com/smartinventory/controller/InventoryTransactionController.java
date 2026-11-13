package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.InventoryTransactionDTO;
import com.smartinventory.dto.StockMovementRequest;
import com.smartinventory.entity.TransactionType;
import com.smartinventory.service.InventoryTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@Tag(name = "Inventory Transactions", description = "Stock movements (In, Out, Adjustment, Transfer, Return) and movement audit trails")
public class InventoryTransactionController {

    private final InventoryTransactionService transactionService;

    @PostMapping("/movement")
    @PreAuthorize("hasAnyRole('STAFF', 'INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Log Stock Movement", description = "Execute atomic stock in/out/adjustment with balance update and audit record")
    public ResponseEntity<ApiResponse<InventoryTransactionDTO>> processStockMovement(
            @Valid @RequestBody StockMovementRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        InventoryTransactionDTO tx = transactionService.processStockMovement(request, currentUser.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Stock movement processed successfully", tx));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get Product Transaction History", description = "Paginated ledger history for a specific product")
    public ResponseEntity<ApiResponse<Page<InventoryTransactionDTO>>> getProductHistory(
            @PathVariable String productId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<InventoryTransactionDTO> history = transactionService.getTransactionsByProduct(productId, pageable);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get Transactions by Movement Type")
    public ResponseEntity<ApiResponse<Page<InventoryTransactionDTO>>> getByType(
            @PathVariable TransactionType type,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<InventoryTransactionDTO> history = transactionService.getTransactionsByType(type, pageable);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get Recent Transactions", description = "Fetch recent stock activities for real-time live feeds")
    public ResponseEntity<ApiResponse<List<InventoryTransactionDTO>>> getRecentTransactions() {
        List<InventoryTransactionDTO> recent = transactionService.getRecentTransactions();
        return ResponseEntity.ok(ApiResponse.ok(recent));
    }
}
