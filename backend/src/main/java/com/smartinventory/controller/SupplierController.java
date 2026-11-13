package com.smartinventory.controller;

import com.smartinventory.dto.ApiResponse;
import com.smartinventory.entity.Supplier;
import com.smartinventory.repository.SupplierRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Endpoints for vendor relationship and supplier contact management")
public class SupplierController {

    private final SupplierRepository supplierRepository;

    @GetMapping
    @Operation(summary = "List Active Suppliers")
    public ResponseEntity<ApiResponse<List<Supplier>>> getSuppliers() {
        return ResponseEntity.ok(ApiResponse.ok(supplierRepository.findByIsActiveTrue()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INVENTORY_MANAGER', 'ADMIN')")
    @Operation(summary = "Create Supplier")
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(@Valid @RequestBody Supplier supplier) {
        Supplier saved = supplierRepository.save(supplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Supplier created successfully", saved));
    }
}
