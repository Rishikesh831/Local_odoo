import pool from "./config/db.js";

async function testMovesQuery() {
  try {
    console.log("Testing moves query...");
    
    const query = `
      SELECT * FROM (
        -- Receipts (IN moves)
        SELECT 
          r.receipt_id as move_id,
          r.reference_number as reference,
          r.receipt_date as date,
          r.supplier_name as contact,
          'vendor' as from_location,
          w.warehouse_name as to_location,
          r.quantity,
          r.status,
          'receipt' as move_type,
          p.product_name,
          p.sku,
          r.created_at
        FROM receipts r
        JOIN warehouses w ON r.warehouse_id = w.warehouse_id
        JOIN products p ON r.product_id = p.product_id
        
        UNION ALL
        
        -- Deliveries (OUT moves)
        SELECT 
          d.delivery_id as move_id,
          d.reference_number as reference,
          d.delivery_date as date,
          d.customer_name as contact,
          w.warehouse_name as from_location,
          'customer' as to_location,
          d.quantity,
          d.status,
          'delivery' as move_type,
          p.product_name,
          p.sku,
          d.created_at
        FROM deliveries d
        JOIN warehouses w ON d.warehouse_id = w.warehouse_id
        JOIN products p ON d.product_id = p.product_id
        
        UNION ALL
        
        -- Internal Transfers
        SELECT 
          t.transfer_id as move_id,
          CONCAT('WH/TR/', LPAD(t.transfer_id::text, 5, '0')) as reference,
          t.transfer_date as date,
          'Internal Transfer' as contact,
          wf.warehouse_name as from_location,
          wt.warehouse_name as to_location,
          t.quantity,
          t.status,
          'transfer' as move_type,
          p.product_name,
          p.sku,
          t.created_at
        FROM transfers t
        JOIN warehouses wf ON t.from_warehouse_id = wf.warehouse_id
        JOIN warehouses wt ON t.to_warehouse_id = wt.warehouse_id
        JOIN products p ON t.product_id = p.product_id
      ) moves
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} moves`);
    console.log(JSON.stringify(result.rows, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error("Error testing moves query:", error.message);
    console.error(error.stack);
    await pool.end();
  }
}

testMovesQuery();
