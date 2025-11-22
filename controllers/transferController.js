import pool from "../config/db.js";

export const createTransfer = async (req, res) => {
  try {
    const { from_warehouse, to_warehouse } = req.body;

    const result = await pool.query(
      "INSERT INTO transfers (from_warehouse, to_warehouse) VALUES ($1,$2) RETURNING *",
      [from_warehouse, to_warehouse]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addTransferItem = async (req, res) => {
  try {
    const { product_id, qty } = req.body;

    await pool.query(
      "INSERT INTO transfer_items (transfer_id, product_id, qty) VALUES ($1,$2,$3)",
      [req.params.transferId, product_id, qty]
    );

    res.json({ message: "Transfer item added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const validateTransfer = async (req, res) => {
  try {
    const transferId = req.params.transferId;

    const items = await pool.query(
      "SELECT product_id, qty FROM transfer_items WHERE transfer_id=$1",
      [transferId]
    );

    const transfer = await pool.query(
      "SELECT * FROM transfers WHERE id=$1",
      [transferId]
    );

    const from = transfer.rows[0].from_warehouse;
    const to = transfer.rows[0].to_warehouse;

    for (let item of items.rows) {
      await pool.query(
        "UPDATE stock SET qty = qty - $1 WHERE product_id=$2 AND warehouse_id=$3",
        [item.qty, item.product_id, from]
      );

      await pool.query(
        "UPDATE stock SET qty = qty + $1 WHERE product_id=$2 AND warehouse_id=$3",
        [item.qty, item.product_id, to]
      );
    }

    await pool.query("UPDATE transfers SET status='done' WHERE id=$1", [
      transferId,
    ]);

    res.json({ message: "Transfer validated & stock moved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
