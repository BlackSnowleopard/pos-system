const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pos_system',
  password: 'dela.postgres.1805',
  port: 5432
});

async function run() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    
    // Insert Manager
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING', 
      ['Store Manager', 'manager@pos.com', hash, 'Manager']
    );
    
    // Insert Cashier
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING', 
      ['Front Cashier', 'cashier@pos.com', hash, 'Cashier']
    );
    
    console.log('Successfully seeded Manager and Cashier roles!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
