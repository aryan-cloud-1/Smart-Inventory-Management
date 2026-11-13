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
public class PurchaseOrderItemDTO {
    private Long id;
    private String productId;
    private String productSku;
    private String productName;
    private Integer quantityOrdered;
    private Integer quantityReceived;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
