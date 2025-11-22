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

async function checkConstraints() {
  try {
    console.log('Checking stock table constraints...\n');
    
    const constraints = await pool.query(`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'stock'
      ORDER BY tc.constraint_type, tc.constraint_name
    `);

    console.log('Stock table constraints:');
    constraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name} (${constraint.constraint_type}): ${constraint.column_name}`);
    });

    await pool.end();
    console.log('\n✅ Check completed!');
  } catch (err) {
    console.error('Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

checkConstraints();
