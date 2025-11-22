import pool from "./config/db.js";

async function checkTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log("📊 Existing tables in database:");
    console.table(res.rows);
    
    // Check if transfers, receipts, deliveries exist
    const tableNames = res.rows.map(r => r.table_name);
    console.log("\n✓ Checking key tables:");
    console.log("Transfers:", tableNames.includes('transfers') ? '✅' : '❌');
    console.log("Receipts:", tableNames.includes('receipts') ? '✅' : '❌');
    console.log("Deliveries:", tableNames.includes('deliveries') ? '✅' : '❌');
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

checkTables();
