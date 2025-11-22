import pool from './config/db.js';
import bcrypt from 'bcryptjs';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Test 1: Check users table structure
    console.log('Test 1: Checking users table structure...');
    const tableStructureQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    const structure = await pool.query(tableStructureQuery);
    console.log('✅ Users table columns:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Test 2: Test user registration
    console.log('\nTest 2: Testing user registration...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testUsername = `testuser_${Date.now()}`;
    const testPassword = 'testpass123';
    
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (existingUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      await pool.query(
        'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3)',
        [testUsername, testEmail, hashedPassword]
      );
      
      console.log('✅ Test user created successfully');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Username: ${testUsername}`);
    } else {
      console.log('⚠️  User already exists');
    }

    // Test 3: Test login validation
    console.log('\nTest 3: Testing login validation...');
    const loginQuery = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [testEmail]
    );
    
    if (loginQuery.rows.length > 0) {
      const user = loginQuery.rows[0];
      const isPasswordValid = await bcrypt.compare(testPassword, user.password_hash);
      
      if (isPasswordValid) {
        console.log('✅ Password validation successful');
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
      } else {
        console.log('❌ Password validation failed');
      }
    } else {
      console.log('❌ User not found');
    }

    // Test 4: Check existing users
    console.log('\nTest 4: Listing existing users...');
    const allUsers = await pool.query(
      'SELECT user_id, username, email, role, created_at FROM users ORDER BY user_id'
    );
    
    console.log(`✅ Found ${allUsers.rows.length} users in database:`);
    allUsers.rows.forEach(user => {
      console.log(`   - ID: ${user.user_id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role}`);
    });

    console.log('\n✅ All authentication tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

testAuth();
