package com.smartinventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderCreateRequest {

    private String poNumber; // Optional: auto-generated if blank (e.g. PO-YYYYMMDD-XXXX)

    @NotBlank(message = "Supplier ID is required")
    private String supplierId;

    private LocalDate expectedDeliveryDate;

    private String notes;

    @NotEmpty(message = "At least one purchase order item is required")
    @Valid
    private List<PurchaseOrderItemRequest> items;
}
