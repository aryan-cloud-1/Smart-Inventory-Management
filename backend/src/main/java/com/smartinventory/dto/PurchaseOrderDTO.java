package com.smartinventory.dto;

import com.smartinventory.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDTO {
    private String id;
    private String poNumber;
    private String supplierId;
    private String supplierName;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private String notes;
    private String createdByUsername;
    private List<PurchaseOrderItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
