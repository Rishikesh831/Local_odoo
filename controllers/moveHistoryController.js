import pool from "../config/db.js";

// Get all move history (receipts, deliveries, transfers combined)
export const getAllMoves = async (req, res) => {
  try {
    const { reference, contact, status, from_date, to_date, move_type } = req.query;
    
    // Build the unified query combining all move types
    let query = `
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
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Apply filters
    if (reference) {
      query += ` AND reference ILIKE $${paramCount}`;
      params.push(`%${reference}%`);
      paramCount++;
    }
    
    if (contact) {
      query += ` AND contact ILIKE $${paramCount}`;
      params.push(`%${contact}%`);
      paramCount++;
    }
    
    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (from_date) {
      query += ` AND date >= $${paramCount}`;
      params.push(from_date);
      paramCount++;
    }
    
    if (to_date) {
      query += ` AND date <= $${paramCount}`;
      params.push(to_date);
      paramCount++;
    }
    
    if (move_type) {
      query += ` AND move_type = $${paramCount}`;
      params.push(move_type);
      paramCount++;
    }
    
    query += ` ORDER BY date DESC, created_at DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching move history:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get move details by ID and type
export const getMoveDetails = async (req, res) => {
  try {
    const { id, type } = req.params;
    
    let query;
    let tableName;
    let idColumn;
    
    switch(type) {
      case 'receipt':
        tableName = 'receipts';
        idColumn = 'receipt_id';
        query = `
          SELECT 
            r.*,
            p.product_name,
            p.sku,
            w.warehouse_name,
            w.location as warehouse_location
          FROM receipts r
          JOIN products p ON r.product_id = p.product_id
          JOIN warehouses w ON r.warehouse_id = w.warehouse_id
          WHERE r.receipt_id = $1
        `;
        break;
        
      case 'delivery':
        tableName = 'deliveries';
        idColumn = 'delivery_id';
        query = `
          SELECT 
            d.*,
            p.product_name,
            p.sku,
            w.warehouse_name,
            w.location as warehouse_location
          FROM deliveries d
          JOIN products p ON d.product_id = p.product_id
          JOIN warehouses w ON d.warehouse_id = w.warehouse_id
          WHERE d.delivery_id = $1
        `;
        break;
        
      case 'transfer':
        tableName = 'transfers';
        idColumn = 'transfer_id';
        query = `
          SELECT 
            t.*,
            p.product_name,
            p.sku,
            wf.warehouse_name as from_warehouse_name,
            wf.location as from_warehouse_location,
            wt.warehouse_name as to_warehouse_name,
            wt.location as to_warehouse_location
          FROM transfers t
          JOIN products p ON t.product_id = p.product_id
          JOIN warehouses wf ON t.from_warehouse_id = wf.warehouse_id
          JOIN warehouses wt ON t.to_warehouse_id = wt.warehouse_id
          WHERE t.transfer_id = $1
        `;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid move type' });
    }
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching move details:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get move statistics for dashboard
export const getMoveStatistics = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE move_type = 'receipt') as total_receipts,
        COUNT(*) FILTER (WHERE move_type = 'delivery') as total_deliveries,
        COUNT(*) FILTER (WHERE move_type = 'transfer') as total_transfers,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_moves,
        COUNT(*) FILTER (WHERE status = 'ready') as ready_moves,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_moves,
        COUNT(*) FILTER (WHERE status = 'in_transit') as in_transit_moves,
        SUM(quantity) FILTER (WHERE move_type = 'receipt') as total_received_qty,
        SUM(quantity) FILTER (WHERE move_type = 'delivery') as total_delivered_qty
      FROM (
        SELECT quantity, status, 'receipt' as move_type FROM receipts
        UNION ALL
        SELECT quantity, status, 'delivery' as move_type FROM deliveries
        UNION ALL
        SELECT quantity, status, 'transfer' as move_type FROM transfers
      ) all_moves
    `);
    
    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Error fetching move statistics:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update move status
export const updateMoveStatus = async (req, res) => {
  try {
    const { id, type } = req.params;
    const { status } = req.body;
    
    let tableName, idColumn;
    
    switch(type) {
      case 'receipt':
        tableName = 'receipts';
        idColumn = 'receipt_id';
        break;
      case 'delivery':
        tableName = 'deliveries';
        idColumn = 'delivery_id';
        break;
      case 'transfer':
        tableName = 'transfers';
        idColumn = 'transfer_id';
        break;
      default:
        return res.status(400).json({ error: 'Invalid move type' });
    }
    
    const query = `
      UPDATE ${tableName} 
      SET status = $1, 
          ${type === 'transfer' ? 'completed_at' : 'updated_at'} = CURRENT_TIMESTAMP
      WHERE ${idColumn} = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    res.json({ 
      message: 'Move status updated successfully',
      move: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating move status:', err);
    res.status(500).json({ error: err.message });
  }
};
