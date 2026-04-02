const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply base authentication
router.use(authenticateToken);

// GET /api/inventory/low-stock - Get products below their stock threshold
router.get('/low-stock', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE quantity <= low_stock_threshold ORDER BY quantity ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock:', error);
    res.status(500).json({ error: 'Server error fetching low stock' });
  }
});

// GET /api/inventory/logs - View history of stock changes
router.get('/logs', async (req, res) => {
  try {
    const query = `
      SELECT l.*, p.product_name, u.name as user_name
      FROM inventory_logs l
      LEFT JOIN products p ON l.product_id = p.product_id
      LEFT JOIN users u ON l.user_id = u.user_id
      ORDER BY l.created_at DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Server error fetching logs' });
  }
});

// POST /api/inventory/adjust - Change stock and create log
// Restricted to Admin/Manager
router.post('/adjust', authorizeRoles('Administrator', 'Manager'), async (req, res) => {
  const { product_id, change_type, quantity_changed, description } = req.body;
  const user_id = req.user.id;
  
  if (!quantity_changed || quantity_changed === 0) {
    return res.status(400).json({ error: 'Quantity changed cannot be 0' });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Get current product quantity
    const prodRes = await client.query('SELECT quantity FROM products WHERE product_id = $1', [product_id]);
    if (prodRes.rows.length === 0) {
      throw new Error('Product not found');
    }
    
    const newQuantity = Number(prodRes.rows[0].quantity) + Number(quantity_changed);
    if (newQuantity < 0) {
      throw new Error('Stock cannot drop below 0');
    }

    // 2. Update product
    await client.query('UPDATE products SET quantity = $1 WHERE product_id = $2', [newQuantity, product_id]);

    // 3. Insert log
    await client.query(
      `INSERT INTO inventory_logs (product_id, user_id, change_type, quantity_changed, description) 
       VALUES ($1, $2, $3, $4, $5)`,
      [product_id, user_id, change_type, quantity_changed, description]
    );

    await client.query('COMMIT'); // Commit transaction
    res.json({ message: 'Inventory adjusted successfully', newQuantity });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Inventory adjustment error:', error.message);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;
