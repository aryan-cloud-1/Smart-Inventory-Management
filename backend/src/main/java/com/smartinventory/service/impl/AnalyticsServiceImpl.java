package com.smartinventory.service.impl;

import com.smartinventory.dto.CategoryDistributionDTO;
import com.smartinventory.dto.DailyTrendDTO;
import com.smartinventory.dto.DashboardSummaryDTO;
import com.smartinventory.dto.FastMovingItemDTO;
import com.smartinventory.dto.InventoryTransactionDTO;
import com.smartinventory.dto.ProductDTO;
import com.smartinventory.entity.OrderStatus;
import com.smartinventory.repository.CategoryRepository;
import com.smartinventory.repository.InventoryTransactionRepository;
import com.smartinventory.repository.ProductRepository;
import com.smartinventory.repository.PurchaseOrderRepository;
import com.smartinventory.repository.SupplierRepository;
import com.smartinventory.service.AnalyticsService;
import com.smartinventory.service.InventoryTransactionService;
import com.smartinventory.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductService productService;
    private final InventoryTransactionService transactionService;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {
        BigDecimal costValuation = productRepository.calculateTotalInventoryCostValuation();
        BigDecimal retailValuation = productRepository.calculateTotalInventoryRetailValuation();
        long totalProducts = productRepository.count();
        long totalUnits = productRepository.countTotalUnitsInStock();
        long lowStockCount = productRepository.countLowStockProducts();
        long pendingOrders = purchaseOrderRepository.countByStatus(OrderStatus.PENDING);
        long suppliersCount = supplierRepository.count();
        long recentTxCount = transactionRepository.countTransactionsSince(LocalDateTime.now().minusDays(7));

        List<FastMovingItemDTO> fastMoving = getFastMovingItems(30, 5);
        List<CategoryDistributionDTO> categoryDist = getCategoryDistribution();
        List<ProductDTO> lowStockAlerts = productService.getLowStockProducts();
        List<InventoryTransactionDTO> recentTx = transactionService.getRecentTransactions();

        return DashboardSummaryDTO.builder()
                .totalInventoryCostValue(costValuation)
                .totalInventoryRetailValue(retailValuation)
                .totalProductsCount(totalProducts)
                .totalUnitsInStock(totalUnits)
                .lowStockCount(lowStockCount)
                .pendingPurchaseOrdersCount(pendingOrders)
                .totalSuppliersCount(suppliersCount)
                .recentTransactionsCount(recentTxCount)
                .fastMovingItems(fastMoving)
                .categoryDistribution(categoryDist)
                .lowStockAlerts(lowStockAlerts)
                .recentTransactions(recentTx)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FastMovingItemDTO> getFastMovingItems(int daysLimit, int topCount) {
        LocalDateTime since = LocalDateTime.now().minusDays(daysLimit);
        List<Object[]> rows = transactionRepository.findFastMovingProducts(since, PageRequest.of(0, topCount));

        List<FastMovingItemDTO> results = new ArrayList<>();
        for (Object[] row : rows) {
            String productId = (String) row[0];
            String sku = (String) row[1];
            String productName = (String) row[2];
            Long units = row[3] instanceof Number ? ((Number) row[3]).longValue() : 0L;
            BigDecimal revenue = row[4] instanceof BigDecimal ? (BigDecimal) row[4] :
                    (row[4] instanceof Number ? BigDecimal.valueOf(((Number) row[4]).doubleValue()) : BigDecimal.ZERO);

            results.add(FastMovingItemDTO.builder()
                    .productId(productId)
                    .sku(sku)
                    .productName(productName)
                    .unitsDispatched(units)
                    .revenueGenerated(revenue)
                    .build());
        }
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDistributionDTO> getCategoryDistribution() {
        List<Object[]> rows = productRepository.getCategoryStockBreakdown();
        List<CategoryDistributionDTO> results = new ArrayList<>();
        for (Object[] row : rows) {
            String catName = (String) row[0];
            Long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
            Long units = row[2] instanceof Number ? ((Number) row[2]).longValue() : 0L;

            results.add(CategoryDistributionDTO.builder()
                    .categoryName(catName)
                    .productCount(count)
                    .totalStockUnits(units)
                    .build());
        }
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyTrendDTO> getDailyMovementTrends(int daysLimit) {
        LocalDateTime since = LocalDateTime.now().minusDays(daysLimit);
        List<Object[]> rows = transactionRepository.getDailyMovementTrends(since);

        List<DailyTrendDTO> results = new ArrayList<>();
        for (Object[] row : rows) {
            String date = String.valueOf(row[0]);
            String txType = String.valueOf(row[1]);
            Long totalQty = row[2] instanceof Number ? ((Number) row[2]).longValue() : 0L;

            results.add(DailyTrendDTO.builder()
                    .date(date)
                    .transactionType(txType)
                    .totalQuantity(totalQty)
                    .build());
        }
        return results;
    }
}
