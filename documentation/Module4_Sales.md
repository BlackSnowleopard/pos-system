# Module 4: Sales Processing System
**Status:** Completed

## Overview
This is the core functional module of the POS system where daily transactions occur. It introduces a Point-Of-Sale Terminal checkout interface allowing cashiers to scan/search for products, adjust cart quantities, apply discounts, and select payment types.

## Core Architecture
- **Component Delegation:** The frontend terminal was split logically into three layers for maintainability (React best practice `Composition`):
  1. `SalesPage` (The Parent Logic Controller/State Manager)
  2. `ProductScanner` (Child - Responsible only for fetching and selecting products)
  3. `ShoppingCart` (Child - A "dumb" presentational component rendering the cart)
- **Database Transactions & Security:** To prevent hacking or internet dropouts from corrupting data, the checkout process (`POST /api/sales`) re-verifies prices independently of the frontend. It then groups 4 operations into a single SQL `BEGIN...COMMIT` block:
  1. Insert into `sales`
  2. Insert into `sales_items` for every item
  3. Deduct stock from `products.quantity`
  4. Log deduction in `inventory_logs`

## Database Schema
Relies on two new linked tables:
- `sales` (Tracks transaction level details like Total, Discount, Cashier, and Payment Method)
- `sales_items` (Linking table recording precisely which products were bought, what the price was *at the exact time of sale*, and the quantity).
