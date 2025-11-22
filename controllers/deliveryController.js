import pool from "../config/db.js";

export const createDelivery = async (req, res) => {
  try {
    const { customer } = req.body;

    const result = await pool.query(
      "INSERT INTO deliveries (customer) VALUES ($1) RETURNING *",
      [customer]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addDeliveryItem = async (req, res) => {
  try {
    const { product_id, qty } = req.body;

    await pool.query(
      "INSERT INTO delivery_items (delivery_id, product_id, qty) VALUES ($1,$2,$3)",
      [req.params.deliveryId, product_id, qty]
    );

    res.json({ message: "Delivery item added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const validateDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;

    const items = await pool.query(
      "SELECT product_id, qty FROM delivery_items WHERE delivery_id=$1",
      [deliveryId]
    );

    for (let item of items.rows) {
      await pool.query(
        "UPDATE stock SET qty = qty - $1 WHERE product_id=$2 AND warehouse_id=1",
        [item.qty, item.product_id]
      );
    }

    await pool.query("UPDATE deliveries SET status='done' WHERE id=$1", [
      deliveryId,
    ]);

    res.json({ message: "Delivery validated & stock reduced" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
