import pool from "./config/db.js";

async function checkAllTables() {
  try {
    console.log("Checking all tables in database...\n");
    
    const client = await pool.connect();
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`Found ${tablesResult.rows.length} tables:\n`);
    
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      
      // Get column information for each table
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      
      // Get row count
      const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      const rowCount = countResult.rows[0].count;
      
      console.log(`📋 ${tableName.toUpperCase()} (${rowCount} records)`);
      console.log('   Columns:');
      columnsResult.rows.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}${col.is_nullable === 'NO' ? ', NOT NULL' : ''})`);
      });
      console.log('');
    }
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkAllTables();
