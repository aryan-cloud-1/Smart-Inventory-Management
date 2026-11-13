package com.smartinventory.dto;

import com.smartinventory.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionDTO {
    private String id;
    private String productId;
    private String productSku;
    private String productName;
    private TransactionType transactionType;
    private Integer quantity;
    private Integer previousBalance;
    private Integer newBalance;
    private String referenceNumber;
    private String remarks;
    private String operatorUsername;
    private String operatorFullName;
    private LocalDateTime createdAt;
}
