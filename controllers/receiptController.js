import pool from "../config/db.js";

export const getAllReceipts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.receipt_id as id, r.supplier_name as vendor, r.receipt_date as schedule_date, 
        r.reference_number, r.notes, r.created_at, r.created_by, 'done' as status,
        COUNT(ri.id) as item_count 
      FROM receipts r 
      LEFT JOIN receipt_items ri ON r.receipt_id = ri.receipt_id 
      GROUP BY r.receipt_id, r.supplier_name, r.receipt_date, r.reference_number, r.notes, r.created_at, r.created_by
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
        reference_number, notes, created_at, created_by, 'done' as status
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
    const { vendor, schedule_date, responsible } = req.body;

    const result = await pool.query(
      "INSERT INTO receipts (vendor, schedule_date, responsible, status) VALUES ($1, $2, $3, 'draft') RETURNING *",
      [vendor, schedule_date, responsible]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addReceiptItem = async (req, res) => {
  try {
    const { product_id, qty } = req.body;

    await pool.query(
      "INSERT INTO receipt_items (receipt_id,product_id,qty) VALUES ($1,$2,$3)",
      [req.params.receiptId, product_id, qty]
    );

    res.json({ message: "Item added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const validateReceipt = async (req, res) => {
  try {
    const receiptId = req.params.receiptId;

    // Get current status
    const receiptStatus = await pool.query(
      "SELECT status FROM receipts WHERE id=$1",
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
        "SELECT product_id, qty FROM receipt_items WHERE receipt_id=$1",
        [receiptId]
      );

      for (let item of items.rows) {
        await pool.query(
          "UPDATE stock SET qty = qty + $1 WHERE product_id=$2 AND warehouse_id=1",
          [item.qty, item.product_id]
        );
      }
    }

    await pool.query("UPDATE receipts SET status=$1 WHERE id=$2", [
      newStatus,
      receiptId,
    ]);

    res.json({ message: "Receipt status updated", status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
