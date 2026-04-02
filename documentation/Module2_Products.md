# Module 2: Product Management System
**Status:** Completed

## Overview
The Product Management module is the backbone of the POS system's catalog. It handles creating new items, updating pricing, managing barcodes, and viewing the entire store catalog.

## Core Architecture
- **CRUD Operations:** Employs standard RESTful principles (Create, Read, Update, Delete) on the products table.
- **Role-Based Restrictions:** While cashiers can *view* products, the APIs to add or modify items are hard-restricted at the Express routing level using the `authorizeRoles` middleware. Only Administrators and Managers can execute writes.

## Extracted Components
- `ProductFormModal.jsx`: Instead of writing separate forms for "Add" and "Edit", this Single Component handles both by accepting an optional `initialData` prop. 
- `ProductsPage.jsx`: Renders the data-table by continuously fetching from the backend.

## Database Schema
Relies on the `products` table:
- `product_id`
- `product_name`
- `category`
- `price`
- `quantity` (Current stock level)
- `low_stock_threshold`
- `barcode`
