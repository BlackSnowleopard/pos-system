const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pos_system',
  password: 'dela.postgres.1805',
  port: 5432
});

const alterProductsTable = `
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
`;

const createInventoryLogsTable = `
CREATE TABLE IF NOT EXISTS inventory_logs (
    log_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('RESTOCK', 'ADJUSTMENT', 'SALE', 'DAMAGE')),
    quantity_changed INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function run() {
  try {
    await pool.query(alterProductsTable);
    console.log('Added low_stock_threshold to products table.');
    
    await pool.query(createInventoryLogsTable);
    console.log('Created inventory_logs table successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
