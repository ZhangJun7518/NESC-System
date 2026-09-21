New Energy Supply Chain Intelligent Control System (NESC)

> An integrated inventory management and intelligent decision-making platform for chain stores in the new energy and manufacturing sectors.
> Author: Zhang Jun | Vitebsk State Technological University (VSTU)

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## 📖 Project Overview

**NESC** is an **intelligent supply chain management and control system** designed for chain stores in the new energy and manufacturing industries. It establishes a complete operational closed-loop—spanning **product management, barcode-based POS checkout, inventory deduction, inter-store transfers, and intelligent replenishment to data dashboards**. By integrating digital-intelligent capabilities such as **carbon emission calculations, dynamic inventory alerts, and intelligent replenishment algorithms**, the system helps enterprises transition from simple "digitization" to "data-driven intelligence."

The system supports **four user roles** (System Administrator, Headquarters Executive, Store Manager, and Stock Clerk) and features demo-friendly functions such as **trilingual switching (Chinese/English/Russian)**, **mobile barcode scanning simulation**, and **one-click test data generation**. It is an ideal portfolio project for those specializing in **Data Product Management** or **Supply Chain Digitalization**. ---

## ✨ Key Features

### 🔐 Multi-Role Access Control
- **System Admin**: Full permissions; ability to switch demo identities
- **HQ Executive**: Global dashboard, inter-store transfers, data export
- **Store Manager**: Store-specific dashboard, product management, stock-in, transfer initiation
- **Stock Clerk**: POS access only; no dashboard or product editing permissions

### 📦 Closed-Loop Inventory Management
- Product management (CRUD operations, barcode generation)
- Stock-in processing (inventory increase, audit logs)
- Barcode-based POS (transactional inventory deduction, carbon reduction tracking)
- Sales record lookup
- Intelligent inter-store transfers (auto-create products at target store, transfer history logging)

### 📊 Data Dashboards & Smart Algorithms
- Key metrics: Total products, today's sales, carbon reduction, low-stock alerts
- 7-day sales trends (line chart)
- Inventory distribution by category (pie chart)
- Smart restocking suggestions (algorithmic calculation)
- One-click restocking list export (Excel)

### 🌍 Internationalization & User Experience
- Seamless switching between Chinese, English, and Russian
- Multi-tab interface (preserves operational state)
- Tech-style dark login page (dynamic video background)
- Main content area features background imagery with a "frosted glass" overlay
- Responsive layout; view full data at 100% zoom

### 🛡️ System Security & Stability
- JWT authentication + dual-layer permission checks (frontend & backend)
- Global exception handling (prevents service crashes)
- Frontend ErrorBoundary (prevents "white screen" errors)
- Action audit logs (traceability)
- One-click generation of 500 test records (for demo purposes)

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Ant Design 5 + ECharts + i18next + Axios |
| Backend | Node.js + Express + MySQL (mysql2) + JWT + bcryptjs + exceljs |
| Database | MySQL | 8.0 (Docker Deployment) |
| Deployment | Docker Compose + Nginx (Optional) |
| Tools | VS Code + Git + Postman / Thunder Client |

---

## 🏗️ System Architecture
┌──────────────────────────────────────────────────────────┐
│ Frontend (React + Vite) │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Login Page │ │ Dashboard │ │ Product Mgmt │ │ POS/Checkout │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ Smart Transfer │ │ System Settings │ │ Audit Logs │ │ Multi-language │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
└──────────────────────────────────────────────────────────┘
│ Axios / JWT
▼
┌──────────────────────────────────────────────────────────┐
│ Backend API (Node.js + Express) │
│ /api/auth Login & Authentication │
│ /api/dashboard Dashboard Stats + Smart Replenishment + Excel Export │
│ /api/product CRUD + Stock-in │
│ /api/sales Checkout + Inventory Deduction + Carbon Reduction │
│ /api/transfer Inter-store Transfer + Transfer Records │
│ /api/system Audit Logs + One-click Test Data Generation │
└──────────────────────────────────────────────────────────┘
│ mysql2 Connection Pool
▼
┌──────────────────────────────────────────────────────────┐
│ MySQL 8.0 (Docker) │
│ users / goods / sales / audit_logs / replenish_requests │
└──────────────────────────────────────────────────────────┘
