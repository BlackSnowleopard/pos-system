const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pos_system',
  password: 'dela.postgres.1805',
  port: 5432
});

const createSalesTable = `
CREATE TABLE IF NOT EXISTS sales (
    sale_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'MOBILE_MONEY')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createSalesItemsTable = `
CREATE TABLE IF NOT EXISTS sales_items (
    sale_item_id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(sale_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_sale DECIMAL(10, 2) NOT NULL
);
`;

async function run() {
  try {
    await pool.query(createSalesTable);
    console.log('Created sales table successfully.');
    
    await pool.query(createSalesItemsTable);
    console.log('Created sales_items table successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
