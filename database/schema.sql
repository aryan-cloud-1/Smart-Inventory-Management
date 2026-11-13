-- ===================================================================
-- SMART INVENTORY MANAGEMENT SYSTEM - DATABASE SCHEMA (MySQL 8.0+)
-- Author: Senior Full-Stack Software Engineer & Architect
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ===================================================================

CREATE DATABASE IF NOT EXISTS `smart_inventory_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `smart_inventory_db`;

-- Set SQL Modes and Timezone
SET foreign_key_checks = 0;
SET NAMES utf8mb4;

-- -------------------------------------------------------------------
-- 1. ROLES TABLE (RBAC)
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'ROLE_ADMIN, ROLE_INVENTORY_MANAGER, ROLE_STAFF',
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 2. USERS TABLE
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL COMMENT 'UUID v4',
    `username` VARCHAR(60) NOT NULL,
    `email` VARCHAR(120) NOT NULL,
    `password` VARCHAR(255) NOT NULL COMMENT 'BCrypt Hashed Password',
    `first_name` VARCHAR(60) NOT NULL,
    `last_name` VARCHAR(60) NOT NULL,
    `phone` VARCHAR(25) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_username` (`username`),
    UNIQUE KEY `uk_users_email` (`email`),
    INDEX `idx_users_email_active` (`email`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 3. USER_ROLES (M-to-M Junction)
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
    `user_id` VARCHAR(36) NOT NULL,
    `role_id` BIGINT NOT NULL,
    PRIMARY KEY (`user_id`, `role_id`),
    CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 4. CATEGORIES TABLE
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_categories_name` (`name`),
    UNIQUE KEY `uk_categories_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 5. SUPPLIERS TABLE
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
    `id` VARCHAR(36) NOT NULL COMMENT 'UUID v4',
    `company_name` VARCHAR(150) NOT NULL,
    `contact_person` VARCHAR(100) NULL,
    `email` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) DEFAULT 'USA',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_suppliers_email` (`email`),
    INDEX `idx_suppliers_company` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 6. PRODUCTS TABLE
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` VARCHAR(36) NOT NULL COMMENT 'UUID v4',
    `sku` VARCHAR(60) NOT NULL COMMENT 'Stock Keeping Unit',
    `barcode` VARCHAR(100) NULL COMMENT 'EAN/UPC/QR identifier',
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `category_id` BIGINT NOT NULL,
    `supplier_id` VARCHAR(36) NULL,
    `unit_cost` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 COMMENT 'Cost price from supplier',
    `selling_price` DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 COMMENT 'Customer retail price',
    `current_stock` INT NOT NULL DEFAULT 0,
    `min_threshold` INT NOT NULL DEFAULT 10 COMMENT 'Safety stock level',
    `reorder_quantity` INT NOT NULL DEFAULT 50 COMMENT 'Default or EOQ suggested reorder amount',
    `annual_demand` INT NOT NULL DEFAULT 600 COMMENT 'Estimated annual demand for EOQ computation',
    `order_cost` DECIMAL(10, 2) NOT NULL DEFAULT 50.00 COMMENT 'Fixed order setup cost (S)',
    `holding_cost_percent` DECIMAL(5, 2) NOT NULL DEFAULT 20.00 COMMENT 'Annual holding cost % of unit cost (H)',
    `storage_location` VARCHAR(100) NOT NULL DEFAULT 'Warehouse-A / Shelf-01',
    `unit_of_measure` VARCHAR(30) NOT NULL DEFAULT 'UNIT' COMMENT 'UNIT, KG, LITER, BOX, PACKET',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_products_sku` (`sku`),
    UNIQUE KEY `uk_products_barcode` (`barcode`),
    INDEX `idx_products_category` (`category_id`),
    INDEX `idx_products_supplier` (`supplier_id`),
    INDEX `idx_products_stock_threshold` (`current_stock`, `min_threshold`),
    INDEX `idx_products_created_at` (`created_at`),
    CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 7. INVENTORY TRANSACTIONS (Stock Movements & Audit Trail)
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `inventory_transactions`;
CREATE TABLE `inventory_transactions` (
    `id` VARCHAR(36) NOT NULL COMMENT 'UUID v4',
    `product_id` VARCHAR(36) NOT NULL,
    `transaction_type` VARCHAR(20) NOT NULL COMMENT 'STOCK_IN, STOCK_OUT, ADJUSTMENT, TRANSFER, RETURN',
    `quantity` INT NOT NULL COMMENT 'Positive integer for movement quantity',
    `previous_balance` INT NOT NULL,
    `new_balance` INT NOT NULL,
    `reference_number` VARCHAR(100) NULL COMMENT 'PO number, Invoice number, or Dispatch ID',
    `remarks` VARCHAR(255) NULL,
    `operator_id` VARCHAR(36) NOT NULL COMMENT 'User ID who performed transaction',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_transactions_product_created` (`product_id`, `created_at`),
    INDEX `idx_transactions_type` (`transaction_type`),
    INDEX `idx_transactions_operator` (`operator_id`),
    INDEX `idx_transactions_created_at` (`created_at`),
    CONSTRAINT `fk_transactions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_transactions_user` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 8. PURCHASE ORDERS (Procurement Management)
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `purchase_orders`;
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(36) NOT NULL COMMENT 'UUID v4',
    `po_number` VARCHAR(50) NOT NULL,
    `supplier_id` VARCHAR(36) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, APPROVED, RECEIVED, CANCELLED',
    `total_amount` DECIMAL(14, 4) NOT NULL DEFAULT 0.0000,
    `expected_delivery_date` DATE NULL,
    `actual_delivery_date` DATE NULL,
    `notes` TEXT NULL,
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_purchase_orders_number` (`po_number`),
    INDEX `idx_po_supplier_status` (`supplier_id`, `status`),
    INDEX `idx_po_created_at` (`created_at`),
    CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `fk_po_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 9. PURCHASE ORDER ITEMS
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `purchase_order_items`;
CREATE TABLE `purchase_order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `purchase_order_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,
    `quantity_ordered` INT NOT NULL,
    `quantity_received` INT NOT NULL DEFAULT 0,
    `unit_price` DECIMAL(12, 4) NOT NULL,
    `subtotal` DECIMAL(14, 4) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_po_items_po` (`purchase_order_id`),
    INDEX `idx_po_items_product` (`product_id`),
    CONSTRAINT `fk_po_items_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_po_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 10. AUDIT LOGS (Security and System Observability)
-- -------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `entity_name` VARCHAR(100) NOT NULL COMMENT 'PRODUCT, ORDER, USER, TRANSACTION',
    `entity_id` VARCHAR(50) NULL,
    `action` VARCHAR(50) NOT NULL COMMENT 'CREATE, UPDATE, DELETE, STOCK_ADJUST, LOGIN_SUCCESS',
    `actor_username` VARCHAR(60) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `details` TEXT NULL COMMENT 'JSON snapshot or textual explanation of change',
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_audit_entity` (`entity_name`, `entity_id`),
    INDEX `idx_audit_timestamp` (`timestamp`),
    INDEX `idx_audit_actor` (`actor_username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- SEED DATA (INITIAL DATA LOAD)
-- -------------------------------------------------------------------

-- 1. Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'ROLE_ADMIN', 'Full system administrator with uninhibited access'),
(2, 'ROLE_INVENTORY_MANAGER', 'Manages products, stocks, orders, and suppliers'),
(3, 'ROLE_STAFF', 'Floor staff / cashier capable of stock lookup and checkout dispatches');

-- 2. Users (Default password: 'Password@123' hashed with BCrypt)
-- Hash: $2a$12$7kPj4aPjQn39Ew1jC3Z35.fV6zNQqI9b0wS1T3MqvV4x2e9UvF6qO
INSERT INTO `users` (`id`, `username`, `email`, `password`, `first_name`, `last_name`, `phone`, `is_active`) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin', 'admin@smartinventory.com', '$2a$12$7kPj4aPjQn39Ew1jC3Z35.fV6zNQqI9b0wS1T3MqvV4x2e9UvF6qO', 'System', 'Admin', '+1 555-0101', 1),
('a0000000-0000-0000-0000-000000000002', 'manager', 'manager@smartinventory.com', '$2a$12$7kPj4aPjQn39Ew1jC3Z35.fV6zNQqI9b0wS1T3MqvV4x2e9UvF6qO', 'Sarah', 'Connor', '+1 555-0102', 1),
('a0000000-0000-0000-0000-000000000003', 'cashier1', 'staff@smartinventory.com', '$2a$12$7kPj4aPjQn39Ew1jC3Z35.fV6zNQqI9b0wS1T3MqvV4x2e9UvF6qO', 'John', 'Doe', '+1 555-0103', 1);

-- 3. User Roles Assignment
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
('a0000000-0000-0000-0000-000000000001', 1), -- Admin gets ROLE_ADMIN
('a0000000-0000-0000-0000-000000000001', 2),
('a0000000-0000-0000-0000-000000000002', 2), -- Manager gets ROLE_INVENTORY_MANAGER
('a0000000-0000-0000-0000-000000000003', 3); -- Cashier gets ROLE_STAFF

-- 4. Categories
INSERT INTO `categories` (`id`, `name`, `code`, `description`) VALUES
(1, 'Industrial Electronics', 'ELEC-IND', 'Industrial control boards, microcontrollers, and sensors'),
(2, 'Computer Hardware', 'COMP-HW', 'Servers, RAM modules, SSDs, and network switches'),
(3, 'Mechanical Tools', 'MECH-TOOL', 'Precision calibrated hand tools and diagnostic instruments'),
(4, 'Packaging & Logistics', 'LOG-PACK', 'Heavy duty boxes, protective bubble wraps, and packing tapes'),
(5, 'Safety & PPE Gear', 'PPE-SAFE', 'Hard hats, anti-static gloves, and high-visibility jackets');

-- 5. Suppliers
INSERT INTO `suppliers` (`id`, `company_name`, `contact_person`, `email`, `phone`, `address`, `city`, `country`) VALUES
('s0000000-0000-0000-0000-000000000001', 'Apex Global Semiconductor', 'David Vance', 'orders@apexsemi.com', '+1 408-555-8900', '100 Silicon Way', 'San Jose', 'USA'),
('s0000000-0000-0000-0000-000000000002', 'Omega Logistics & Tools Corp', 'Elena Rostova', 'supply@omegatools.de', '+49 89 2345 6789', '42 Industriestrasse', 'Munich', 'Germany'),
('s0000000-0000-0000-0000-000000000003', 'Nordic Safety Dynamics', 'Lars Lindqvist', 'b2b@nordicsafety.se', '+46 8 1234 5678', '14 Hamngatan', 'Stockholm', 'Sweden');

-- 6. Products
INSERT INTO `products` (`id`, `sku`, `barcode`, `name`, `description`, `category_id`, `supplier_id`, `unit_cost`, `selling_price`, `current_stock`, `min_threshold`, `reorder_quantity`, `annual_demand`, `order_cost`, `holding_cost_percent`, `storage_location`, `unit_of_measure`) VALUES
('p0000000-0000-0000-0000-000000000001', 'SKU-ELEC-001', '8901234567890', 'STM32 Microcontroller Board v4', 'ARM Cortex-M4 development board for automated plant robotics', 1, 's0000000-0000-0000-0000-000000000001', 18.5000, 32.9900, 142, 25, 100, 1200, 45.00, 20.00, 'Warehouse-A / Shelf-01-A', 'UNIT'),
('p0000000-0000-0000-0000-000000000002', 'SKU-COMP-002', '8901234567891', 'Enterprise NVMe SSD 2TB Gen4', 'High endurance datacenter solid-state drive with power-loss protection', 2, 's0000000-0000-0000-0000-000000000001', 135.0000, 219.0000, 8, 15, 40, 350, 75.00, 18.00, 'Warehouse-A / Vault-02', 'UNIT'),
('p0000000-0000-0000-0000-000000000003', 'SKU-MECH-003', '8901234567892', 'Digital Torque Wrench 1/2-inch', 'Calibrated electronic torque wrench with Bluetooth data logger', 3, 's0000000-0000-0000-0000-000000000002', 88.0000, 145.5000, 4, 10, 25, 180, 50.00, 15.00, 'Warehouse-B / Bin-04', 'UNIT'),
('p0000000-0000-0000-0000-000000000004', 'SKU-LOG-004', '8901234567893', 'Heavy-Duty Corrugated Box 40x40x40cm', 'Double-walled carton box for secure international shipping', 4, 's0000000-0000-0000-0000-000000000002', 1.7500, 3.8000, 480, 100, 500, 4000, 30.00, 25.00, 'Warehouse-C / Pallet-11', 'BOX'),
('p0000000-0000-0000-0000-000000000005', 'SKU-PPE-005', '8901234567894', 'ESD Anti-Static Work Gloves (Size L)', 'Polyurethane coated palm gloves rated for cleanrooms and static safety', 5, 's0000000-0000-0000-0000-000000000003', 3.2000, 7.5000, 12, 50, 200, 1500, 25.00, 20.00, 'Warehouse-B / Rack-08', 'PACKET');

-- 7. Inventory Transactions Initial History
INSERT INTO `inventory_transactions` (`id`, `product_id`, `transaction_type`, `quantity`, `previous_balance`, `new_balance`, `reference_number`, `remarks`, `operator_id`, `created_at`) VALUES
('t0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'STOCK_IN', 150, 0, 150, 'PO-2026-0001', 'Initial consignment delivery', 'a0000000-0000-0000-0000-000000000002', DATE_SUB(NOW(), INTERVAL 14 DAY)),
('t0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'STOCK_OUT', 8, 150, 142, 'DISP-8921', 'Dispatched to Assembly Line A', 'a0000000-0000-0000-0000-000000000003', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('t0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000002', 'STOCK_IN', 20, 0, 20, 'PO-2026-0002', 'Server rack upgrade parts reception', 'a0000000-0000-0000-0000-000000000002', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('t0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000002', 'STOCK_OUT', 12, 20, 8, 'DISP-8940', 'Datacenter SAN deployment - Low Stock Alert Triggered', 'a0000000-0000-0000-0000-000000000003', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('t0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000003', 'STOCK_OUT', 6, 10, 4, 'DISP-8955', 'Field engineer kits dispatch - Critical low stock', 'a0000000-0000-0000-0000-000000000003', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- 8. Purchase Orders Sample
INSERT INTO `purchase_orders` (`id`, `po_number`, `supplier_id`, `status`, `total_amount`, `expected_delivery_date`, `notes`, `created_by`) VALUES
('po000000-0000-0000-0000-000000000001', 'PO-2026-1001', 's0000000-0000-0000-0000-000000000001', 'PENDING', 5400.0000, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 'Urgent restocking for NVMe Gen4 drives', 'a0000000-0000-0000-0000-000000000002'),
('po000000-0000-0000-0000-000000000002', 'PO-2026-1002', 's0000000-0000-0000-0000-000000000003', 'RECEIVED', 640.0000, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'Replenished ESD protective gloves batch', 'a0000000-0000-0000-0000-000000000001');

-- 9. Purchase Order Items
INSERT INTO `purchase_order_items` (`purchase_order_id`, `product_id`, `quantity_ordered`, `quantity_received`, `unit_price`, `subtotal`) VALUES
('po000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000002', 40, 0, 135.0000, 5400.0000),
('po000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000005', 200, 200, 3.2000, 640.0000);

-- 10. Audit Logs
INSERT INTO `audit_logs` (`entity_name`, `entity_id`, `action`, `actor_username`, `ip_address`, `details`) VALUES
('SYSTEM', 'SYS-BOOT', 'BOOTSTRAP', 'system', '127.0.0.1', 'Smart Inventory Management System Database initialized successfully.'),
('PRODUCT', 'p0000000-0000-0000-0000-000000000002', 'STOCK_ALERT', 'system', '127.0.0.1', 'Stock for Enterprise NVMe SSD 2TB Gen4 dropped to 8 units (Threshold: 15). Triggered EOQ suggestion: 40 units.'),
('PURCHASE_ORDER', 'po000000-0000-0000-0000-000000000001', 'CREATE', 'manager', '192.168.1.15', 'PO-2026-1001 created for supplier Apex Global Semiconductor ($5,400.00).');

SET foreign_key_checks = 1;
