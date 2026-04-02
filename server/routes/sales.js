const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * All sales routes require the user to be logged in.
 * Note: We don't restrict to Admin/Manager here, because Cashiers are the primary 
 * users making sales!
 */
router.use(authenticateToken);

/**
 * POST /api/sales
 * Processes a completed checkout.
 * Expects a body containing: { cartItems: [{product_id, quantity}], discount, paymentDetails: {method, amountTendered, referenceId} }
 */
router.post('/', async (req, res) => {
  const { cartItems, discount, paymentDetails } = req.body;
  const user_id = req.user.id; // The cashier processing the sale

  // 1. Initial Validation
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  if (!paymentDetails || !paymentDetails.method || !paymentDetails.amountTendered) {
    return res.status(400).json({ error: 'Incomplete payment details' });
  }

  // 2. We use a Database Transaction (BEGIN ... COMMIT). 
  // This ensures that if any single step fails (e.g. inventory log fails), 
  // the entire sale is cancelled and nothing is saved to prevent corrupted data.
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start Transaction

    let calculatedTotal = 0;
    const finalItems = [];

    // 3. Security Verification: Re-calculate the prices on the backend
    // We never trust prices sent from the React frontend in case they were modified.
    for (const item of cartItems) {
      // Fetch the actual, current price and stock level from the database
      const productRes = await client.query('SELECT price, quantity FROM products WHERE product_id = $1', [item.product_id]);
      
      if (productRes.rows.length === 0) {
        throw new Error(`Product ID ${item.product_id} not found.`);
      }

      const product = productRes.rows[0];

      // Check if we have enough stock before finalizing sale
      if (item.quantity > product.quantity) {
        throw new Error(`Insufficient stock for Product ID ${item.product_id}`);
      }

      // Calculate the true backend cost
      const itemCost = Number(product.price) * Number(item.quantity);
      calculatedTotal += itemCost;

      // Store verified item data for step 5
      finalItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_sale: product.price
      });
    }

    // Apply the discount to our internally calculated total
    let finalAmount = calculatedTotal - (Number(discount) || 0);
    if (finalAmount < 0) finalAmount = 0; // Prevent negative totals

    // Change calculation
    const amountTendered = Number(paymentDetails.amountTendered);
    if (amountTendered < finalAmount) {
      throw new Error(`Insufficient payment. Total is ${finalAmount}, but only ${amountTendered} tendered.`);
    }
    const changeReturned = amountTendered - finalAmount;

    // 4. Create the main Sale record
    const saleInsert = await client.query(
      `INSERT INTO sales (user_id, total_amount, discount_applied, payment_method) 
       VALUES ($1, $2, $3, $4) RETURNING sale_id`,
      [user_id, finalAmount, discount || 0, paymentDetails.method]
    );
    const newSaleId = saleInsert.rows[0].sale_id;

    // 5. Create Payment record (Module 5)
    await client.query(
      `INSERT INTO payments (sale_id, payment_method, amount_tendered, change_returned, transaction_reference) 
       VALUES ($1, $2, $3, $4, $5)`,
      [newSaleId, paymentDetails.method, amountTendered, changeReturned, paymentDetails.referenceId || null]
    );

    // 6. Create the Sales Items, Deduct Stock, and Log Inventory!
    for (const item of finalItems) {
      // 5a. Link the item to the receipt
      await client.query(
        `INSERT INTO sales_items (sale_id, product_id, quantity, price_at_sale) 
         VALUES ($1, $2, $3, $4)`,
        [newSaleId, item.product_id, item.quantity, item.price_at_sale]
      );

      // 5b. Deduct from the main products catalog
      await client.query(
        `UPDATE products SET quantity = quantity - $1 WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );

      // 5c. Log the stock removal in the immutable history table
      await client.query(
        `INSERT INTO inventory_logs (product_id, user_id, change_type, quantity_changed, description) 
         VALUES ($1, $2, $3, $4, $5)`,
        [item.product_id, user_id, 'SALE', -item.quantity, `Sold during checkout`]
      );
    }

    await client.query('COMMIT'); // Transaction Success! Save everything.
    
    // Return the successful sale ID to the frontend
    res.status(201).json({ message: 'Sale completed successfully', sale_id: newSaleId });

  } catch (error) {
    await client.query('ROLLBACK'); // Transaction Failed! Cancel everything.
    console.error('Sale transaction error:', error.message);
    res.status(400).json({ error: error.message });
  } finally {
    client.release(); // Always release the database connection back to the pool
  }
});

module.exports = router;
