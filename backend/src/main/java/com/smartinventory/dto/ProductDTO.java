package com.smartinventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private String id;
    private String sku;
    private String barcode;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String supplierId;
    private String supplierName;
    private BigDecimal unitCost;
    private BigDecimal sellingPrice;
    private Integer currentStock;
    private Integer minThreshold;
    private Integer reorderQuantity;
    private Integer annualDemand;
    private BigDecimal orderCost;
    private BigDecimal holdingCostPercent;
    private String storageLocation;
    private String unitOfMeasure;
    private Boolean isActive;
    private Boolean isLowStock;
    private Integer suggestedEoq;
    private BigDecimal totalCostValue;
    private BigDecimal totalRetailValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
