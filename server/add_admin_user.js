const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function addAdminUser() {
  try {
    const email = 'tsegahesmund@gmail.com';
    const name = 'Tsega Hesmund';
    const role = 'Administrator';
    const password = 'admin123'; // You can change this
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Insert the new admin user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
      [name, email, password_hash, role]
    );
    
    console.log('Admin user added successfully:', result.rows[0]);
    console.log(`Login credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      console.log('User with this email already exists. Updating role to Administrator...');
      
      const updateResult = await pool.query(
        'UPDATE users SET role = $1 WHERE email = $2 RETURNING user_id, name, email, role',
        ['Administrator', email]
      );
      
      console.log('User role updated to Administrator:', updateResult.rows[0]);
    } else {
      console.error('Error adding admin user:', error);
    }
    process.exit(1);
  }
}

addAdminUser();
