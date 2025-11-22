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

async function checkStockSchema() {
  try {
    console.log('Checking stock table schema...\n');
    
    const stockSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'stock'
      ORDER BY ordinal_position
    `);

    console.log('stock columns:');
    stockSchema.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    console.log('\n\nSample stock data:');
    const sampleStock = await pool.query('SELECT * FROM stock LIMIT 5');
    console.log(sampleStock.rows);

    await pool.end();
    console.log('\n✅ Schema check completed!');
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkStockSchema();
