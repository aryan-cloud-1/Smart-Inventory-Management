package com.smartinventory.service;

import com.smartinventory.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.alerts.enabled:false}")
    private boolean alertsEnabled;

    @Value("${app.alerts.low-stock-recipient:inventory-alerts@smartinventory.com}")
    private String alertRecipient;

    @Async
    public void sendLowStockAlert(Product product, int eoqSuggestion) {
        log.warn("⚠️ LOW-STOCK TRIGGERED: Product [{}] '{}' current stock: {} is below threshold: {}. Recommended EOQ Reorder: {} units.",
                product.getSku(), product.getName(), product.getCurrentStock(), product.getMinThreshold(), eoqSuggestion);

        if (!alertsEnabled) {
            log.info("Email alert skipped (app.alerts.enabled is false). Low-stock event logged to system console.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(alertRecipient);
            message.setSubject("URGENT: Low Stock Alert - " + product.getSku() + " (" + product.getName() + ")");
            message.setText(String.format(
                    "Smart Inventory Management System Alert\n\n" +
                    "Product: %s\n" +
                    "SKU: %s\n" +
                    "Storage Location: %s\n" +
                    "Current Stock: %d\n" +
                    "Minimum Safety Threshold: %d\n" +
                    "Recommended EOQ Reorder Quantity: %d\n" +
                    "Supplier: %s\n\n" +
                    "Please review and generate a Purchase Order immediately.",
                    product.getName(),
                    product.getSku(),
                    product.getStorageLocation(),
                    product.getCurrentStock(),
                    product.getMinThreshold(),
                    eoqSuggestion,
                    product.getSupplier() != null ? product.getSupplier().getCompanyName() : "Unassigned"
            ));

            mailSender.send(message);
            log.info("Low stock email notification sent successfully to {}", alertRecipient);
        } catch (Exception e) {
            log.error("Failed to send low-stock email notification: {}", e.getMessage());
        }
    }
}
