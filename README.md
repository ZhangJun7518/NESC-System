# Development and Optimisation of a Network Store Inventory Management System

> A web-based inventory management and supply chain decision support system for network stores.
> Author: Zhang Jun | Vitebsk State Technological University (VSTU)

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-20-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## Overview

This project presents the design, implementation, and optimisation of a **Network Store Inventory Management System (NSIMS)**. The system covers the complete business loop from **product management, barcode-based checkout, inventory deduction, cross-store transfer, intelligent replenishment to data dashboard**.

The system supports **four roles** (System Administrator, HQ Leader, Store Manager, Stocker) and features **Chinese/English/Russian multi-language switching**, **mobile barcode scanning simulation**, and **one-click test data generation**.

---

## Key Features

### Multi-Role Access Control

- **System Administrator**: Full permissions, role switching for demonstration
- **HQ Leader**: Global dashboard, cross-store transfer, data export
- **Store Manager**: Store dashboard, product management, stock-in, transfer
- **Stocker**: Checkout only, no dashboard or product editing rights

### Complete Inventory Loop

- Product management (CRUD, barcode generation)
- Stock-in (inventory increase, audit log)
- Barcode checkout (transaction-based inventory deduction)
- Sales record query
- Cross-store intelligent transfer (auto-create target store product, transfer history)

### Dashboard and Intelligent Algorithms

- Total products, today's sales, inventory alerts
- 7-day sales trend (line chart)
- Category inventory distribution (pie chart)
- Intelligent replenishment suggestion (auto-calculated)
- One-click export of replenishment list (Excel)

### Internationalisation and User Experience

- Chinese / English / Russian seamless switching
- Multi-tab navigation, preserving operation state
- Dark tech-style login page (dynamic video background)
- Background image with frosted glass overlay
- Responsive layout, mobile-friendly

### Security and Stability

- JWT authentication with frontend/backend dual permission interception
- Global exception handler, service remains stable
- Frontend ErrorBoundary, page never goes blank
- Audit logs for traceability
- One-click generation of test records for demonstration

---

## Tech Stack

| Layer      | Technology                                                    |
| ---------- | ------------------------------------------------------------- |
| Frontend   | React 18 + Vite + Ant Design 5 + ECharts + i18next + Axios    |
| Backend    | Node.js + Express + MySQL (mysql2) + JWT + bcryptjs + exceljs |
| Database   | MySQL 8.0 (Docker)                                            |
| Deployment | Docker Compose                                                |
| Tools      | VS Code + Git                                                 |

---

## System Architecture
