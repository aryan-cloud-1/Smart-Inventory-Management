package com.smartinventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EOQSuggestionDTO {
    private String productId;
    private String sku;
    private String productName;
    private Integer currentStock;
    private Integer minThreshold;
    private Integer suggestedReorderQuantity;
    private Integer annualDemand;
    private BigDecimal unitCost;
    private BigDecimal orderCost;
    private BigDecimal holdingCostPercent;
    private BigDecimal estimatedTotalOrderCost;
    private String supplierName;
    private String supplierEmail;
}
