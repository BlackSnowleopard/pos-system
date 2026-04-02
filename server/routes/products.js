const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply authentication to all product routes
router.use(authenticateToken);

// GET /api/products - View all products (supports search via query param)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM products ORDER BY product_id DESC';
    let params = [];
    
    if (search) {
      query = 'SELECT * FROM products WHERE product_name ILIKE $1 OR barcode ILIKE $1 ORDER BY product_id DESC';
      params = [`%${search}%`];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// POST /api/products - Add a new product (Admin/Manager only)
router.post('/', authorizeRoles('Administrator', 'Manager'), async (req, res) => {
  const { product_name, category, price, quantity, barcode, low_stock_threshold } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (product_name, category, price, quantity, barcode, low_stock_threshold) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_name, category, price, quantity || 0, barcode, low_stock_threshold || 10]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding product:', error);
    if (error.code === '23505') { // PostgreSQL unique violation error code
        return res.status(400).json({ error: 'Product with this barcode already exists' });
    }
    res.status(500).json({ error: 'Server error adding product' });
  }
});

// PUT /api/products/:id - Update an existing product (Admin/Manager only)
router.put('/:id', authorizeRoles('Administrator', 'Manager'), async (req, res) => {
  const { id } = req.params;
  const { product_name, category, price, quantity, barcode, low_stock_threshold } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE products 
       SET product_name = $1, category = $2, price = $3, quantity = $4, barcode = $5, low_stock_threshold = $6 
       WHERE product_id = $7 RETURNING *`,
      [product_name, category, price, quantity, barcode, low_stock_threshold || 10, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error updating product' });
  }
});

// DELETE /api/products/:id - Delete a product (Admin/Manager only)
router.delete('/:id', authorizeRoles('Administrator', 'Manager'), async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

module.exports = router;
