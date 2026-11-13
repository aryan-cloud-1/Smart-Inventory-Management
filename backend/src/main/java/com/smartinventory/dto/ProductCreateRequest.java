package com.smartinventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    private String barcode;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String supplierId;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal unitCost;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal sellingPrice;

    @NotNull(message = "Current stock is required")
    @Min(value = 0)
    private Integer currentStock;

    @NotNull(message = "Minimum threshold is required")
    @Min(value = 0)
    private Integer minThreshold;

    @Min(value = 1)
    @Builder.Default
    private Integer reorderQuantity = 50;

    @Min(value = 1)
    @Builder.Default
    private Integer annualDemand = 600;

    @DecimalMin(value = "0.0", inclusive = true)
    @Builder.Default
    private BigDecimal orderCost = new BigDecimal("50.00");

    @DecimalMin(value = "0.0", inclusive = true)
    @Builder.Default
    private BigDecimal holdingCostPercent = new BigDecimal("20.00");

    @NotBlank(message = "Storage location is required")
    @Builder.Default
    private String storageLocation = "Warehouse-A / Shelf-01";

    @NotBlank(message = "Unit of measure is required")
    @Builder.Default
    private String unitOfMeasure = "UNIT";
}
