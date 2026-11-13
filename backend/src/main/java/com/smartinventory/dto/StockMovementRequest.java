package com.smartinventory.dto;

import com.smartinventory.entity.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementRequest {

    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType; // STOCK_IN, STOCK_OUT, ADJUSTMENT, TRANSFER, RETURN

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than zero")
    private Integer quantity;

    private String referenceNumber; // e.g. PO-1002, DISP-8921

    private String remarks;
}
