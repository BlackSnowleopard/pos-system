const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// All customer routes require authentication
router.use(authenticateToken);

/**
 * GET /api/customers
 * Accessible by Cashiers, Managers, and Admins.
 * Returns a list of all customers, with optional search query.
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM customers ORDER BY name ASC';
    let values = [];

    if (search) {
      query = `SELECT * FROM customers WHERE name ILIKE $1 OR phone ILIKE $1 ORDER BY name ASC`;
      values = [`%${search}%`];
    }

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/customers
 * Accessible by Cashiers, Managers, Admins. (Cashiers need to sign people up at the register)
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    // Check if email already exists if provided
    if (email) {
      const emailCheck = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email is already registered to a customer.' });
      }
    }

    const newCustomer = await pool.query(
      'INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone || null, email || null, address || null]
    );

    res.status(201).json(newCustomer.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/customers/:id
 * Accessible by Cashiers, Managers, Admins.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const updateCustomer = await pool.query(
      'UPDATE customers SET name = $1, phone = $2, email = $3, address = $4 WHERE customer_id = $5 RETURNING *',
      [name, phone || null, email || null, address || null, id]
    );

    if (updateCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(updateCustomer.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/customers/:id
 * Strictly restricted to Administrators and Managers. Cashiers shouldn't delete accounts.
 */
router.delete('/:id', authorizeRoles('Administrator', 'Manager'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Note: Because of ON DELETE SET NULL in our schema, deleting a customer
    // won't delete their past sales, it will just un-link them.
    const deleteCustomer = await pool.query('DELETE FROM customers WHERE customer_id = $1 RETURNING *', [id]);

    if (deleteCustomer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/customers/:id/history
 * Fetch the purchase history for a specific customer.
 */
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch all sales tied to this customer, ordered newest first
    const historyQuery = await pool.query(
      `SELECT sale_id, total_amount, discount_applied, payment_method, created_at 
       FROM sales 
       WHERE customer_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    res.json(historyQuery.rows);
  } catch (error) {
    console.error('Error fetching customer history:', error.message);
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

module.exports = router;
