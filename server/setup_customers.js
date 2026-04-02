const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pos_system',
  password: 'dela.postgres.1805',
  port: 5432
});

const createCustomersTable = `
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(150) UNIQUE,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const alterSalesTable = `
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL;
`;

async function run() {
  try {
    await pool.query(createCustomersTable);
    console.log('Created customers table successfully.');
    
    await pool.query(alterSalesTable);
    console.log('Tied customers table to sales table successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
