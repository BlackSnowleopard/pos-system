# Implementation Plans Archive

This document serves as the historical record of the exact implementation plans we used to architect the POS modules.

## Module 1: Authentication System
* Established `bcrypt` for password hashing and `JWT` for session storage based on the `users` table. Supported Admin, Manager, and Cashier roles.

## Module 2: Products System
* Implemented `products` table with barcode tracking.
* Designed restrictive APIs protecting CRUD endpoints to Managers/Admins only via `authorizeRoles()`.
* Setup `ProductFormModal` for reusability.

## Module 3: Inventory System
* Separated active total from historical logs by creating `inventory_logs`.
* Setup triggers to automatically mark rows in red on the table if `quantity <= low_stock_threshold` dynamically.

## Module 4: Sales Processing System
* Broken into `sale_id` and `sales_items` for normalization.
* Extracted components to `ShoppingCart.jsx` and `ProductScanner.jsx` to maintain clean React architecture.
* Utilized raw SQL logic to calculate true costs on the backend (defending against tampered frontend arrays) under a unified Database Transaction (`BEGIN...COMMIT`).

## Module 5: Payment Processing System
* Designed to strictly use Mock/Provisions instead of real API gateways for safety.
* Separated abstract payment details into the `payments` table to calculate `change_given` and track `auth_codes`.
