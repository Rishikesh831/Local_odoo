import pool from "../config/db.js";

export const createReceipt = async (req, res) => {
  try {
    const { vendor } = req.body;

    const result = await pool.query(
      "INSERT INTO receipts (vendor) VALUES ($1) RETURNING *",
      [vendor]
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

    await pool.query("UPDATE receipts SET status='done' WHERE id=$1", [
      receiptId,
    ]);

    res.json({ message: "Receipt validated and stock updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
