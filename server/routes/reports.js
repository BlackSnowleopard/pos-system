const express = require('express');
const pool = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply role-based protection to all report routes
router.use(authenticateToken, authorizeRoles('Administrator', 'Manager'));

/**
 * GET /api/reports/summary
 * Returns a high-level sales overview for Today, This Week, and This Month.
 */
router.get('/summary', async (req, res) => {
  try {
    // 1. Sales Today
    const todayRes = await pool.query(
      `SELECT SUM(total_amount) as revenue, COUNT(*) as count 
       FROM sales 
       WHERE DATE(created_at) = CURRENT_DATE`
    );

    // 2. Sales This Week
    const weekRes = await pool.query(
      `SELECT SUM(total_amount) as revenue, COUNT(*) as count 
       FROM sales 
       WHERE created_at >= date_trunc('week', CURRENT_DATE)`
    );

    // 3. Sales This Month
    const monthRes = await pool.query(
      `SELECT SUM(total_amount) as revenue, COUNT(*) as count 
       FROM sales 
       WHERE created_at >= date_trunc('month', CURRENT_DATE)`
    );

    res.json({
      today: {
        revenue: Number(todayRes.rows[0].revenue) || 0,
        count: Number(todayRes.rows[0].count) || 0
      },
      week: {
        revenue: Number(weekRes.rows[0].revenue) || 0,
        count: Number(weekRes.rows[0].count) || 0
      },
      month: {
        revenue: Number(monthRes.rows[0].revenue) || 0,
        count: Number(monthRes.rows[0].count) || 0
      }
    });
  } catch (error) {
    console.error('Summary report error:', error.message);
    res.status(500).json({ error: 'Server error fetching summary data' });
  }
});

/**
 * GET /api/reports/top-products
 * Identifies top 5 best sellers by quantity.
 */
router.get('/top-products', async (req, res) => {
  try {
    const topProductsRes = await pool.query(
      `SELECT pr.product_name, SUM(si.quantity) as total_sold, SUM(si.quantity * si.price_at_sale) as total_revenue
       FROM sales_items si
       JOIN products pr ON si.product_id = pr.product_id
       GROUP BY pr.product_name
       ORDER BY total_revenue DESC
       LIMIT 5`
    );
    res.json(topProductsRes.rows);
  } catch (error) {
    console.error('Top products report error:', error.message);
    res.status(500).json({ error: 'Server error fetching top products' });
  }
});

/**
 * GET /api/reports/inventory-status
 * Calculates current stock value and provides item counts for Requirement #123.
 */
router.get('/inventory-status', async (req, res) => {
  try {
    const statusRes = await pool.query(
      `SELECT 
         SUM(quantity * price) as total_value,
         COUNT(*) as total_products,
         COUNT(*) FILTER (WHERE quantity <= low_stock_threshold) as low_stock_count
       FROM products`
    );
    res.json({
      total_value: Number(statusRes.rows[0].total_value) || 0,
      total_products: Number(statusRes.rows[0].total_products) || 0,
      low_stock_count: Number(statusRes.rows[0].low_stock_count) || 0
    });
  } catch (error) {
    console.error('Inventory status report error:', error.message);
    res.status(500).json({ error: 'Server error fetching inventory status' });
  }
});

/**
 * GET /api/reports/cashier-performance
 * Calculates revenue per employee for Requirement #124.
 */
router.get('/cashier-performance', async (req, res) => {
  try {
    const performanceRes = await pool.query(
      `SELECT u.name as cashier_name, SUM(s.total_amount) as total_revenue, COUNT(s.sale_id) as transaction_count
       FROM sales s
       JOIN users u ON s.user_id = u.user_id
       GROUP BY u.name
       ORDER BY total_revenue DESC`
    );
    res.json(performanceRes.rows);
  } catch (error) {
    console.error('Cashier performance report error:', error.message);
    res.status(500).json({ error: 'Server error fetching cashier performance' });
  }
});

/**
 * GET /api/reports/recent-sales
 * Returns a list of the 10 most recent transactions store-wide.
 */
router.get('/recent-sales', async (req, res) => {
  try {
    const recentRes = await pool.query(
      `SELECT s.sale_id, s.total_amount, s.payment_method, s.created_at, u.name as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.user_id
       ORDER BY s.created_at DESC
       LIMIT 10`
    );
    res.json(recentRes.rows);
  } catch (error) {
    console.error('Recent sales report error:', error.message);
    res.status(500).json({ error: 'Server error fetching recent sales' });
  }
});

module.exports = router;
