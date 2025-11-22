import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

async function checkItemsSchema() {
  try {
    console.log('Checking receipt_items table schema...\n');
    
    const receiptItemsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'receipt_items'
      ORDER BY ordinal_position
    `);

    console.log('receipt_items columns:');
    receiptItemsSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    console.log('\n\nChecking delivery_items table schema...\n');
    
    const deliveryItemsSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'delivery_items'
      ORDER BY ordinal_position
    `);

    console.log('delivery_items columns:');
    deliveryItemsSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Check sample data
    console.log('\n\nSample receipt_items data:');
    const sampleReceipt = await pool.query('SELECT * FROM receipt_items LIMIT 2');
    console.log(sampleReceipt.rows);

    console.log('\n\nSample delivery_items data:');
    const sampleDelivery = await pool.query('SELECT * FROM delivery_items LIMIT 2');
    console.log(sampleDelivery.rows);

    await pool.end();
    console.log('\n✅ Schema check completed!');
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkItemsSchema();
