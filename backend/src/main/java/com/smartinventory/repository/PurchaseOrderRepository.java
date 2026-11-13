package com.smartinventory.repository;

import com.smartinventory.entity.OrderStatus;
import com.smartinventory.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    Boolean existsByPoNumber(String poNumber);

    Page<PurchaseOrder> findByStatus(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    List<PurchaseOrder> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT po FROM PurchaseOrder po LEFT JOIN FETCH po.items WHERE po.id = :id")
    Optional<PurchaseOrder> findByIdWithItems(String id);
}
