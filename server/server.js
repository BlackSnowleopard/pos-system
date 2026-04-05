const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const customerRoutes = require('./routes/customers');
const reportRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payments');

// Initialize Express application
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON bodies

// --- ROUTE REGISTRATION ---
// We split our APIs into separate modules to keep server.js clean.
app.use('/api/auth', authRoutes);         // Module 1: Authentication and Login
app.use('/api/products', productRoutes);  // Module 2: Products Catalog
app.use('/api/inventory', inventoryRoutes); // Module 3: Inventory adjustments and logging
app.use('/api/sales', salesRoutes);       // Module 4: Shopping Cart and Checkout
app.use('/api/customers', customerRoutes); // Module 6: Customers & Loyalty Points
app.use('/api/reports', reportRoutes);     // Module 8: Reporting & Analytics
app.use('/api/payments', paymentRoutes); // Module 5: Payment Processing (Paystack)

// Basic route for testing
app.get('/', (req, res) => {
  res.send('POS System API is running.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
