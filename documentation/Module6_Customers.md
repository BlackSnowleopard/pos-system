# Module 6: Customer Management System
**Status:** Completed

## Overview
This module completes the checkout flow by introducing a Customer Relationship Management (CRM) system and a foundational Loyalty Points engine. Now, the system can associate specific receipts back to registered buyers.

## Core Architecture
- **Loyalty Point Calculation:** Implemented securely on the backend within the core Database Transaction in `Sales.js`. When a valid `customer_id` is passed during checkout, the server automatically reads the Final Sale Amount, mathematically converts it into an integer (using `Math.floor`), and injects an `UPDATE` command to permanently credit the customer's account.
- **Relational SQL Integrity:** We utilized an `ALTER TABLE` to attach `customer_id` as a Foreign Key onto the existing `sales` table safely. By utilizing `ON DELETE SET NULL`, a manager can delete a customer's profile without accidentally wiping out the financial bookkeeping of the store's sale history.

## Database Schema
Brand new `customers` table created and joined to `sales`.
- `customer_id` (Primary Key)
- `name` 
- `phone`
- `email` (Unique)
- `address`
- `loyalty_points` (Defaulting to 0 and scaling up automatically)
