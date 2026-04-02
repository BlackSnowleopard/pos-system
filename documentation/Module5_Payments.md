# Module 5: Payment Processing System
**Status:** Completed

## Overview
This module expands the basic checkout procedure by strictly managing financial tenders. Before completing a sale, the system calculates exact change for Cash transactions or stores secure Authorization reference codes for Card/Mobile payments without directly interacting with risky external banking gateways (using provisions).

## Core Architecture
- **Financial Validation:** The backend enforces that `amount_tendered` is strictly greater than or equal to the receipt's total. Negative change is rejected.
- **Relational Integrity:** Instead of lumping payment data into the main `sales` log, a dedicated `payments` table was spun up to track how the bill was settled. This allows for complex financial reporting later.
- **UI UX Overhaul:** By removing immediate checkouts from the `ShoppingCart` and instead opening a `PaymentModal`, Cashiers are forced to verify payment amounts, greatly reducing human accounting errors.

## Database Schema
Relies on the `payments` table joining with `sales`:
- `payment_id`
- `sale_id`
- `payment_method` (ENUM: 'CASH', 'CARD', 'MOBILE_MONEY')
- `amount_tendered` (Gross taken from customer)
- `change_returned` (Difference given back)
- `transaction_reference` (Optional string for 3rd party receipts)
