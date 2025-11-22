import pool from "../config/db.js";

export const createAdjustment = async (req, res) => {
  try {
    const { product_id, warehouse_id, counted_qty } = req.body;

    const current = await pool.query(
      "SELECT qty FROM stock WHERE product_id=$1 AND warehouse_id=$2",
      [product_id, warehouse_id]
    );

    const difference = counted_qty - current.rows[0].qty;

    await pool.query(
      "INSERT INTO adjustments (product_id, warehouse_id, counted_qty) VALUES ($1,$2,$3)",
      [product_id, warehouse_id, counted_qty]
    );

    await pool.query(
      "UPDATE stock SET qty=$1 WHERE product_id=$2 AND warehouse_id=$3",
      [counted_qty, product_id, warehouse_id]
    );

    res.json({
      message: "Stock adjusted",
      difference
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
