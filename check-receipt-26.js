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

async function checkReceipt26() {
  try {
    console.log('Checking receipt 26 items...\n');
    
    const items = await pool.query(`
      SELECT ri.*, p.product_name
      FROM receipt_items ri
      LEFT JOIN products p ON ri.product_id = p.product_id
      WHERE ri.receipt_id = 26
    `);

    console.log('Receipt 26 items:');
    console.log(items.rows);

    console.log('\n\nChecking stock records for these products...\n');
    
    for (let item of items.rows) {
      const stock = await pool.query(`
        SELECT * FROM stock 
        WHERE product_id = $1 AND location_id = $2
      `, [item.product_id, item.location_id]);
      
      console.log(`Product ${item.product_id} at location ${item.location_id}:`, stock.rows);
    }

    await pool.end();
    console.log('\n✅ Check completed!');
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkReceipt26();
