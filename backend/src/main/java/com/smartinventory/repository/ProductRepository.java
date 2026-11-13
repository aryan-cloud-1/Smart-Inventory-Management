package com.smartinventory.repository;

import com.smartinventory.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findByBarcode(String barcode);

    Boolean existsBySku(String sku);

    Boolean existsByBarcode(String barcode);

    List<Product> findByIsActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(p.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(p.barcode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
    Page<Product> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.minThreshold AND p.isActive = true ORDER BY p.currentStock ASC")
    List<Product> findLowStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.currentStock <= p.minThreshold AND p.isActive = true")
    long countLowStockProducts();

    @Query("SELECT COALESCE(SUM(p.currentStock * p.unitCost), 0) FROM Product p WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryCostValuation();

    @Query("SELECT COALESCE(SUM(p.currentStock * p.sellingPrice), 0) FROM Product p WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryRetailValuation();

    @Query("SELECT COALESCE(SUM(p.currentStock), 0) FROM Product p WHERE p.isActive = true")
    long countTotalUnitsInStock();

    @Query("SELECT p.category.name, COUNT(p), COALESCE(SUM(p.currentStock), 0) " +
           "FROM Product p WHERE p.isActive = true GROUP BY p.category.name")
    List<Object[]> getCategoryStockBreakdown();
}
