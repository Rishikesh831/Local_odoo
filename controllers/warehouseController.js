import pool from "../config/db.js";

export const createWarehouse = async (req, res) => {
  try {
    const { name } = req.body;

    const result = await pool.query(
      "INSERT INTO warehouses (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM warehouses");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
