package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.dto.PurchaseOrderCreateRequest;
import com.smartinventory.dto.PurchaseOrderDTO;
import com.smartinventory.entity.OrderStatus;
import com.smartinventory.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Procurement workflows, vendor orders, and automated receiving")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Create Purchase Order", description = "Generate a new PO with order line items")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderCreateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        PurchaseOrderDTO po = purchaseOrderService.createPurchaseOrder(request, currentUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Purchase Order created successfully", po));
    }

    @GetMapping
    @Operation(summary = "List Purchase Orders", description = "Retrieve paginated purchase orders with optional status filtering")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderDTO>>> getPurchaseOrders(
            @RequestParam(required = false) OrderStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PurchaseOrderDTO> page = purchaseOrderService.getPurchaseOrders(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Purchase Order by ID")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> getPurchaseOrderById(@PathVariable String id) {
        PurchaseOrderDTO po = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(ApiResponse.ok(po));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Update PO Status", description = "Transition status (PENDING, APPROVED, RECEIVED, CANCELLED). Setting to RECEIVED automatically increments inventory!")
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> updateStatus(
            @PathVariable String id,
            @RequestParam OrderStatus status,
            @AuthenticationPrincipal UserDetails currentUser) {
        PurchaseOrderDTO updated = purchaseOrderService.updateOrderStatus(id, status, currentUser.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Order status updated successfully", updated));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get Recent Purchase Orders")
    public ResponseEntity<ApiResponse<List<PurchaseOrderDTO>>> getRecentPurchaseOrders() {
        List<PurchaseOrderDTO> recent = purchaseOrderService.getRecentPurchaseOrders();
        return ResponseEntity.ok(ApiResponse.ok(recent));
    }
}
