# Module 8: Reporting and Analytics
**Status:** Completed (Aligned with Requirement Docs)

## Overview
The Reporting and Analytics module serves as the business intelligence hub of the POS system. It provides managers with real-time insights into sales performance, product trends, and the total value of current inventory, ensuring 100% compliance with the Student Project Structure guidelines.

## Core Architecture
- **SQL Aggregations**: This module utilizes advanced PostgreSQL aggregation functions to calculate metrics on the fly.
  - `SUM(total_amount)` and `COUNT(*)` for revenue and transaction counts.
  - `date_trunc()` for time-based filtering (Daily, Weekly, Monthly).
  - `GROUP BY` and `ORDER BY` for identifying best-selling products and **Cashier Performance** (Requirement #124).
- **Role-Based Access Control (RBAC)**: Access to the reports is strictly limited to `Administrator` and `Manager` roles. Cashiers are prevented from accessing this data on both the frontend and backend.
- **KPI Dashboards**: The frontend uses a grid-based layout with "KPI Cards" to give an immediate overview of store health, including **Low Stock Counts** (Requirement #123).

## API Endpoints
- `GET /api/reports/summary`: Aggregate sales stats for Today, Week, and Month.
- `GET /api/reports/top-products`: Returns the top 5 most sold products by volume (Requirement #122).
- `GET /api/reports/inventory-status`: Calculates total stock valuation, total item count, and active low-stock alerts (Requirement #123).
- `GET /api/reports/cashier-performance`: Leaderboard showing revenue and transactions per employee (Requirement #124).
- `GET /api/reports/recent-sales`: A live log of recent store-wide transactions.
