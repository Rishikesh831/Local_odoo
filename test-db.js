import pool from "./config/db.js";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Test connection
    const client = await pool.connect();
    console.log("✓ Database connected successfully");
    
    // Check if receipts table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('receipts', 'receipt_items', 'products', 'stock')
    `);
    
    console.log("\nTables found:", tableCheck.rows.map(r => r.table_name));
    
    // Try to query receipts
    const receiptsResult = await client.query("SELECT COUNT(*) FROM receipts");
    console.log(`\n✓ Receipts table has ${receiptsResult.rows[0].count} records`);
    
    // Check receipt_items
    const itemsResult = await client.query("SELECT COUNT(*) FROM receipt_items");
    console.log(`✓ Receipt_items table has ${itemsResult.rows[0].count} records`);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("✗ Database error:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
}

testDatabase();
