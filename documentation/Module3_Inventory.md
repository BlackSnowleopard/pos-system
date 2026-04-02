# Module 3: Inventory Management System
**Status:** Completed

## Overview
This module is responsible for keeping the store's stock levels perfectly synchronized with the real world while providing undeniable audit trails of every stock modification.

## Core Architecture
- **Audit Logging:** Every time stock is added or removed, it is not just updated in the `products` table. An immutable log is written to the `inventory_logs` table detailing the exact time, user, and reason for the change.
- **Dynamic Thresholds:** The system allows each item to have a customized `low_stock_threshold`. The `InventoryPage` dashboard filters down items where `quantity <= threshold` to trigger visual warnings.
- **Database Transactions:** The `POST /api/inventory/adjust` endpoint is protected by a SQL `BEGIN` and `COMMIT` transaction block. This means if logging the history fails, the stock isn't changed, preventing phantom inventory changes.

## Database Schema
Relies on the `inventory_logs` table linking to `products`:
- `log_id`
- `product_id` (Foreign Key referencing Products)
- `user_id` (Foreign Key referencing Users)
- `change_type` ('RESTOCK', 'ADJUSTMENT', 'SALE', 'DAMAGE')
- `quantity_changed`
- `description`
