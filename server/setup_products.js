const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pos_system',
  password: 'dela.postgres.1805',
  port: 5432
});

const createProductsTable = `
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    barcode VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const seedDummyProducts = `
INSERT INTO products (product_name, category, price, quantity, barcode) VALUES
('Coca Cola 1L', 'Beverages', 1.50, 100, '049000028206'),
('Lays Classic Chips', 'Snacks', 2.00, 50, '028400000000'),
('Whole Wheat Bread', 'Bakery', 3.20, 20, '123456789012')
ON CONFLICT (barcode) DO NOTHING;
`;

async function run() {
  try {
    await pool.query(createProductsTable);
    console.log('Products table created successfully.');
    await pool.query(seedDummyProducts);
    console.log('Dummy products seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
