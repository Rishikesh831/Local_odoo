import pool from "./config/db.js";

async function checkSchema() {
  try {
    console.log("🔍 Checking table structures...\n");
    
    // Check transfers
    console.log("📦 TRANSFERS table:");
    const transfers = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transfers' 
      ORDER BY ordinal_position
    `);
    console.table(transfers.rows);
    
    // Check receipts
    console.log("\n📥 RECEIPTS table:");
    const receipts = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receipts' 
      ORDER BY ordinal_position
    `);
    console.table(receipts.rows);
    
    // Check deliveries
    console.log("\n📤 DELIVERIES table:");
    const deliveries = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'deliveries' 
      ORDER BY ordinal_position
    `);
    console.table(deliveries.rows);
    
    // Check sample data
    console.log("\n📊 Sample data:");
    const sampleTransfers = await pool.query('SELECT * FROM transfers LIMIT 2');
    console.log("\nTransfers:");
    console.table(sampleTransfers.rows);
    
    const sampleReceipts = await pool.query('SELECT * FROM receipts LIMIT 2');
    console.log("\nReceipts:");
    console.table(sampleReceipts.rows);
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

checkSchema();
