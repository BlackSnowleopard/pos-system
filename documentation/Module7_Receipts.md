# Module 7: Receipt Generation System
**Status:** Completed

## Overview
This module wraps up the checkout process cleanly by producing a digital, printable representation of the Sale. It heavily utilizes relational SQL querying to pull disparate data (Cashier name, Customer Loyalty Points, Sale Totals, and Items) from the different tables we constructed in Modules 1-6.

## Core Architecture
- **API Construction (`GET /api/sales/:id/receipt`):** Rather than passing complex, unverified data through React state, exactly upon completing a sale, the frontend queries the backend utilizing the raw integer ID of the generated sale. The backend performs a massive relational `JOIN` block (unifying `sales`, `users`, `payments`, `customers`, `sales_items`, and `products`) and serves an immutable, trusted Receipt data object.
- **Frontend Architecture (`ReceiptModal.jsx`):** A custom component designed using a strictly monospaced font family (`Courier New`) to emulate thermal POS printers exactly.
- **Native Browser Printing:** By declaring `@media print` rules in `styles.css`, I instructed the browser so that when the Cashier hits `window.print()`, literally every element on the website becomes mathematically invisible EXCEPT the direct `<div className="receipt-paper">` element. This prevents printing navigation bars or modal overlays.
