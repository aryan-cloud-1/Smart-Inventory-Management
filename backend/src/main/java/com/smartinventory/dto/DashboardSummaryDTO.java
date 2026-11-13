package com.smartinventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private BigDecimal totalInventoryCostValue;
    private BigDecimal totalInventoryRetailValue;
    private long totalProductsCount;
    private long totalUnitsInStock;
    private long lowStockCount;
    private long pendingPurchaseOrdersCount;
    private long totalSuppliersCount;
    private long recentTransactionsCount;
    private List<FastMovingItemDTO> fastMovingItems;
    private List<CategoryDistributionDTO> categoryDistribution;
    private List<ProductDTO> lowStockAlerts;
    private List<InventoryTransactionDTO> recentTransactions;
}
