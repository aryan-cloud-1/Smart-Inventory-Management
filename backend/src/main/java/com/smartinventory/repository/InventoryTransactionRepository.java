package com.smartinventory.repository;

import com.smartinventory.entity.InventoryTransaction;
import com.smartinventory.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, String> {

    Page<InventoryTransaction> findByProductIdOrderByCreatedAtDesc(String productId, Pageable pageable);

    Page<InventoryTransaction> findByTransactionTypeOrderByCreatedAtDesc(TransactionType type, Pageable pageable);

    List<InventoryTransaction> findTop15ByOrderByCreatedAtDesc();

    /**
     * Fast-moving items analytics: aggregation of STOCK_OUT transactions within date window
     */
    @Query("SELECT t.product.id, t.product.sku, t.product.name, SUM(t.quantity), SUM(t.quantity * t.product.sellingPrice) " +
           "FROM InventoryTransaction t " +
           "WHERE t.transactionType = 'STOCK_OUT' AND t.createdAt >= :since " +
           "GROUP BY t.product.id, t.product.sku, t.product.name " +
           "ORDER BY SUM(t.quantity) DESC")
    List<Object[]> findFastMovingProducts(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT COUNT(t) FROM InventoryTransaction t WHERE t.createdAt >= :since")
    long countTransactionsSince(@Param("since") LocalDateTime since);

    @Query("SELECT FUNCTION('DATE', t.createdAt), t.transactionType, SUM(t.quantity) " +
           "FROM InventoryTransaction t " +
           "WHERE t.createdAt >= :startDate " +
           "GROUP BY FUNCTION('DATE', t.createdAt), t.transactionType " +
           "ORDER BY FUNCTION('DATE', t.createdAt) ASC")
    List<Object[]> getDailyMovementTrends(@Param("startDate") LocalDateTime startDate);
}
