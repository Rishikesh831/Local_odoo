import pool from "../config/db.js";

export const getAllReceipts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.receipt_id as id, r.supplier_name as vendor, r.receipt_date as schedule_date, 
        r.reference_number, r.notes, r.created_at, r.created_by, COALESCE(r.status, 'draft') as status,
        COUNT(ri.id) as item_count 
      FROM receipts r 
      LEFT JOIN receipt_items ri ON r.receipt_id = ri.receipt_id 
      GROUP BY r.receipt_id, r.supplier_name, r.receipt_date, r.reference_number, r.notes, r.created_at, r.created_by, r.status
      ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReceiptById = async (req, res) => {
  try {
    const receiptId = req.params.receiptId;
    
    const receiptResult = await pool.query(
      `SELECT receipt_id as id, supplier_name as vendor, receipt_date as schedule_date, 
        reference_number, notes, created_at, created_by, COALESCE(status, 'draft') as status
      FROM receipts WHERE receipt_id=$1`,
      [receiptId]
    );

    if (receiptResult.rows.length === 0) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const itemsResult = await pool.query(
      `SELECT ri.id, ri.receipt_id, ri.product_id, ri.qty, ri.location_id,
        p.product_name, p.sku 
      FROM receipt_items ri 
      JOIN products p ON ri.product_id = p.product_id 
      WHERE ri.receipt_id=$1`,
      [receiptId]
    );

    res.json({
      ...receiptResult.rows[0],
      items: itemsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createReceipt = async (req, res) => {
  try {
    const { supplier_name, receipt_date, reference_number, notes, product_id, quantity, warehouse_id } = req.body;

    const result = await pool.query(
      "INSERT INTO receipts (supplier_name, receipt_date, reference_number, notes, product_id, quantity, warehouse_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft') RETURNING receipt_id as id, supplier_name, receipt_date, reference_number, notes, product_id, quantity, warehouse_id, status",
      [supplier_name, receipt_date, reference_number, notes || null, product_id, quantity, warehouse_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addReceiptItem = async (req, res) => {
  try {
    const { product_id, qty, warehouse_id } = req.body;

    // receipt_items uses location_id, not warehouse_id
    await pool.query(
      "INSERT INTO receipt_items (receipt_id, product_id, qty, location_id) VALUES ($1, $2, $3, $4)",
      [req.params.receiptId, product_id, qty, warehouse_id || null]
    );

    res.json({ message: "Item added" });
  } catch (err) {
    console.error('Add receipt item error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const validateReceipt = async (req, res) => {
  try {
    const receiptId = req.params.receiptId;

    // Get current status
    const receiptStatus = await pool.query(
      "SELECT status FROM receipts WHERE receipt_id=$1",
      [receiptId]
    );

    if (receiptStatus.rows.length === 0) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const currentStatus = receiptStatus.rows[0].status;
    let newStatus = currentStatus;

    // Status progression: draft -> ready -> done
    if (currentStatus === 'draft') {
      newStatus = 'ready';
    } else if (currentStatus === 'ready') {
      newStatus = 'done';
      
      // Only update stock when moving to done
      const items = await pool.query(
        "SELECT product_id, qty, location_id FROM receipt_items WHERE receipt_id=$1",
        [receiptId]
      );

      for (let item of items.rows) {
        const locationId = item.location_id || 1;
        
        // Get warehouse_id for this location
        const locationInfo = await pool.query(
          "SELECT warehouse_id FROM stock WHERE location_id=$1 LIMIT 1",
          [locationId]
        );
        
        const warehouseId = locationInfo.rows.length > 0 ? locationInfo.rows[0].warehouse_id : 1;
        
        // Use UPSERT: Insert if not exists, otherwise update
        await pool.query(
          `INSERT INTO stock (product_id, warehouse_id, location_id, qty) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (product_id, warehouse_id, location_id) 
           DO UPDATE SET qty = stock.qty + $4`,
          [item.product_id, warehouseId, locationId, item.qty]
        );
      }
    }

    await pool.query("UPDATE receipts SET status=$1 WHERE receipt_id=$2", [
      newStatus,
      receiptId,
    ]);

    res.json({ message: "Receipt status updated", status: newStatus });
  } catch (err) {
    console.error('Validate receipt error:', err);
    res.status(500).json({ error: err.message });
  }
};
