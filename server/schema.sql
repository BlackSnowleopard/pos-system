-- schema.sql
-- Create Users Table for the Authentication System (Module 1)

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Manager', 'Cashier')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed an initial Administrator user (password: 'admin123')
-- The password_hash here is generated using bcrypt for 'admin123'
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Admin User', 
    'admin@pos.com', 
    '$2b$10$EPP7332M1vAInxZ6rL44fOaFjRj3z6p4f.9yB66P0/Z9sZtL1l7aK', 
    'Administrator'
) ON CONFLICT (email) DO NOTHING;

-- Seed a Manager user (password: 'password123')
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Store Manager', 
    'manager@pos.com', 
    '$2b$10$EPP7332M1vAInxZ6rL44fOaFjRj3z6p4f.9yB66P0/Z9sZtL1l7aK', 
    'Manager'
) ON CONFLICT (email) DO NOTHING;

-- Seed a Cashier user (password: 'password123')
INSERT INTO users (name, email, password_hash, role) 
VALUES (
    'Front Cashier', 
    'cashier@pos.com', 
    '$2b$10$EPP7332M1vAInxZ6rL44fOaFjRj3z6p4f.9yB66P0/Z9sZtL1l7aK', 
    'Cashier'
) ON CONFLICT (email) DO NOTHING;

-- Create Products Table for Module 2
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    barcode VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Inventory Logs Table for Module 3
CREATE TABLE IF NOT EXISTS inventory_logs (
    log_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('RESTOCK', 'ADJUSTMENT', 'SALE', 'DAMAGE')),
    quantity_changed INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers Table for Module 6
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(150) UNIQUE,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Sales Tables for Module 4
CREATE TABLE IF NOT EXISTS sales (
    sale_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(10, 2) DEFAULT 0,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'MOBILE_MONEY')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales_items (
    sale_item_id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(sale_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_sale DECIMAL(10, 2) NOT NULL
);

-- Create Payments Table for Module 5
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(sale_id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'MOBILE_MONEY')),
    amount_tendered DECIMAL(10, 2) NOT NULL,
    change_returned DECIMAL(10, 2) DEFAULT 0,
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


