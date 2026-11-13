package com.smartinventory.service;

import com.smartinventory.dto.PurchaseOrderCreateRequest;
import com.smartinventory.dto.PurchaseOrderDTO;
import com.smartinventory.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PurchaseOrderService {
    PurchaseOrderDTO createPurchaseOrder(PurchaseOrderCreateRequest request, String currentUsername);
    PurchaseOrderDTO getPurchaseOrderById(String id);
    Page<PurchaseOrderDTO> getPurchaseOrders(OrderStatus status, Pageable pageable);
    PurchaseOrderDTO updateOrderStatus(String id, OrderStatus newStatus, String currentUsername);
    List<PurchaseOrderDTO> getRecentPurchaseOrders();
}
