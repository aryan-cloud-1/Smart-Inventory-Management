# Smart Inventory Management System (Enterprise Edition)

A high-performance, full-stack **Smart Inventory Management System** built with **Java 17/21 (Spring Boot 3.3.x)**, **MySQL 8.0**, and **React 18** with **Tailwind CSS**.

---

## 🏛️ 1. Architecture & Layer Breakdown

The system implements clean, decoupled **Domain-Driven Layered Architecture**:

```
backend/
├── src/main/java/com/smartinventory/
│   ├── config/                     # Security, OpenAPI/Swagger & JPA Auditing configs
│   ├── controller/                 # RESTful API Endpoints & Request validation
│   ├── dto/                        # Request/Response Data Transfer Objects
│   ├── entity/                     # JPA Hibernate Domain Models with indices
│   ├── exception/                  # Unified Global Exception Handler & Custom Errors
│   ├── repository/                 # Spring Data JPA Repositories with JPQL queries
│   ├── security/                   # Spring Security 6, JWT Filter & UserPrincipal
│   └── service/                    # Business logic interfaces & implementation
│       ├── impl/
│       ├── AlertNotificationService.java # Low-stock alerts (SMTP & System Logs)
│       ├── AnalyticsService.java        # KPIs, Fast-moving item calculation
│       ├── AuthService.java             # BCrypt authentication & JWT dispatch
│       ├── InventoryTransactionService.java # Atomic balance transitions & ledger
│       ├── ProductService.java          # Product catalog & EOQ calculation
│       ├── PurchaseOrderService.java    # PO lifecycle & automated stock-in
│       └── ReportExportService.java     # PDF (OpenPDF) & CSV (Commons CSV) exports
└── src/main/resources/
    └── application.yml             # Datasource, HikariCP, JWT, and mail settings
```

```
frontend/
├── src/
│   ├── components/                 # Modals, Navbar, Sidebar, StatCards
│   ├── context/                    # AuthContext (JWT management & RBAC state)
│   ├── pages/                      # Dashboard, Products, Transactions, Orders, Login
│   └── services/                   # Axios HTTP client with JWT interceptor
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🔐 2. Role-Based Access Control (RBAC) Matrix

| Feature / Endpoint | Admin (`ROLE_ADMIN`) | Inventory Manager (`ROLE_INVENTORY_MANAGER`) | Staff / Cashier (`ROLE_STAFF`) |
| :--- | :---: | :---: | :---: |
| **View Catalog & Stock Lookups** | ✅ | ✅ | ✅ |
| **Log Daily Sales / Dispatches (Stock-Out)** | ✅ | ✅ | ✅ |
| **Log Consignment Receipts (Stock-In)** | ✅ | ✅ | ✅ |
| **Create / Edit / Deactivate Products** | ✅ | ✅ | ❌ |
| **Manage Suppliers & Categories** | ✅ | ✅ | ❌ |
| **Issue & Manage Purchase Orders (PO)** | ✅ | ✅ | ❌ |
| **Approve & Mark PO as Received** | ✅ | ✅ | ❌ |
| **View Analytics & Valuation Dashboard** | ✅ | ✅ | ❌ |
| **Export Reports (PDF / CSV)** | ✅ | ✅ | ❌ |
| **User Administration & Audit Trails** | ✅ | ❌ | ❌ |

---

## 🧮 3. Smart Inventory & EOQ Formula

The system automatically calculates the **Economic Order Quantity (EOQ)** to minimize total annual inventory holding and ordering costs:

$$EOQ = \sqrt{\frac{2 \times D \times S}{H}}$$

Where:
* **$D$ (Annual Demand):** Total estimated units sold or required per year.
* **$S$ (Order Cost):** Fixed administrative and shipping setup cost incurred per purchase order.
* **$H$ (Annual Holding Cost per unit):** Calculated dynamically as:
  $$H = \text{Unit Cost} \times \left(\frac{\text{Holding Cost \%}}{100}\right)$$

When stock levels drop $\le$ safety threshold, the system flags the product with **CRITICAL LOW-STOCK**, calculates the suggested reorder batch, dispatches alerts, and makes it available for 1-click PO generation.

---

## 💾 4. Database Setup (MySQL 8.0)

1. Open your MySQL client (MySQL Workbench, HeidiSQL, or CLI):
   ```bash
   mysql -u root -p
   ```
2. Execute the provided DDL schema script located at `database/schema.sql`:
   ```bash
   source database/schema.sql;
   ```
   *This automatically creates `smart_inventory_db` with optimized indexes, foreign key constraints, and seed data.*

### Pre-seeded Demo Accounts
All pre-seeded accounts use the default password: **`Password@123`**
* **Admin:** `admin` (or `admin@smartinventory.com`)
* **Inventory Manager:** `manager` (or `manager@smartinventory.com`)
* **Staff / Cashier:** `cashier1` (or `staff@smartinventory.com`)

---

## 🚀 5. How to Run the Backend (Spring Boot 3)

### Prerequisites
* JDK 17, 21, or newer
* Apache Maven 3.8+ (or Maven wrapper)
* Running MySQL instance on port `3306`

### Steps
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Check database credentials in `src/main/resources/application.yml` or set environment variables:
   ```bash
   export DB_USERNAME=root
   export DB_PASSWORD=root
   ```
3. Build and launch:
   ```bash
   mvn clean spring-boot:run
   ```
4. The backend starts on **`http://localhost:8080/api`**.
5. Access the interactive **Swagger / OpenAPI Documentation**:
   👉 **`http://localhost:8080/api/swagger-ui.html`**

---

## 💻 6. How to Run the Frontend (React + Vite)

### Prerequisites
* Node.js v18+ or v20+

### Steps
1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at **`http://localhost:5173`**.
5. Use the quick 1-click login buttons on the login screen to sign in as **Admin**, **Manager**, or **Staff**.

---

## 📡 7. Core REST API Endpoints Overview

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer token | Public |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `GET` | `/api/products` | Paginated product search (SKU, barcode, category) | Staff+ |
| `GET` | `/api/products/low-stock` | Products at or below threshold limit | Staff+ |
| `GET` | `/api/products/reorder-suggestions`| Products with EOQ mathematical suggestions | Staff+ |
| `POST` | `/api/products` | Create new catalog item | Manager+ |
| `PUT` | `/api/products/{id}` | Update product & EOQ configuration | Manager+ |
| `POST` | `/api/transactions/movement` | Atomic Stock In/Out/Adjustment movement | Staff+ |
| `GET` | `/api/transactions/recent` | Recent stock movements audit log | Staff+ |
| `GET` | `/api/purchase-orders` | List purchase orders with status filter | Manager+ |
| `POST` | `/api/purchase-orders` | Generate Purchase Order with line items | Manager+ |
| `PATCH`| `/api/purchase-orders/{id}/status` | Transition status (**RECEIVED auto-increments stock**) | Manager+ |
| `GET` | `/api/analytics/dashboard` | Aggregated valuation, counts, fast-moving items | Manager+ |
| `GET` | `/api/reports/inventory/pdf` | Download formatted Inventory Valuation PDF | Manager+ |
| `GET` | `/api/reports/inventory/csv` | Download Inventory CSV sheet | Manager+ |
| `GET` | `/api/reports/transactions/csv` | Download Movement Ledger CSV | Manager+ |
