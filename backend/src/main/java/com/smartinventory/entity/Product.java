package com.smartinventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "products",
    indexes = {
        @Index(name = "idx_products_sku", columnList = "sku"),
        @Index(name = "idx_products_category", columnList = "category_id"),
        @Index(name = "idx_products_supplier", columnList = "supplier_id"),
        @Index(name = "idx_products_stock_threshold", columnList = "current_stock, min_threshold")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(nullable = false, unique = true, length = 60)
    private String sku;

    @Column(unique = true, length = 100)
    private String barcode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "unit_cost", nullable = false, precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 12, scale = 4)
    @Builder.Default
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(name = "current_stock", nullable = false)
    @Builder.Default
    private Integer currentStock = 0;

    @Column(name = "min_threshold", nullable = false)
    @Builder.Default
    private Integer minThreshold = 10;

    @Column(name = "reorder_quantity", nullable = false)
    @Builder.Default
    private Integer reorderQuantity = 50;

    @Column(name = "annual_demand", nullable = false)
    @Builder.Default
    private Integer annualDemand = 600;

    @Column(name = "order_cost", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal orderCost = new BigDecimal("50.00");

    @Column(name = "holding_cost_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal holdingCostPercent = new BigDecimal("20.00");

    @Column(name = "storage_location", nullable = false, length = 100)
    @Builder.Default
    private String storageLocation = "Warehouse-A / Shelf-01";

    @Column(name = "unit_of_measure", nullable = false, length = 30)
    @Builder.Default
    private String unitOfMeasure = "UNIT";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.id == null) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }

    /**
     * Checks if stock level is currently below safety threshold
     */
    public boolean isLowStock() {
        return this.currentStock <= this.minThreshold;
    }

    /**
     * Calculates the Economic Order Quantity (EOQ):
     * EOQ = sqrt((2 * D * S) / H)
     * D: Annual Demand
     * S: Order Cost (Fixed per order)
     * H: Annual Holding Cost per unit = Unit Cost * (Holding Cost % / 100)
     */
    public int calculateEconomicOrderQuantity() {
        if (this.annualDemand == null || this.annualDemand <= 0) {
            return this.reorderQuantity;
        }

        BigDecimal hCost = this.unitCost.multiply(this.holdingCostPercent.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        if (hCost.compareTo(BigDecimal.ZERO) <= 0) {
            return this.reorderQuantity;
        }

        double d = this.annualDemand.doubleValue();
        double s = this.orderCost.doubleValue();
        double h = hCost.doubleValue();

        double eoq = Math.sqrt((2.0 * d * s) / h);
        int calculated = (int) Math.round(eoq);
        return Math.max(calculated, 1);
    }
}
