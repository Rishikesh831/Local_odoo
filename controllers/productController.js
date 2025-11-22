import pool from "../config/db.js";

export const createProduct = async (req, res) => {
  try {
    const { name, sku, category, uom, reorder_level } = req.body;

    const result = await pool.query(
      "INSERT INTO products (name, sku, category, uom, reorder_level) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, sku, category, uom, reorder_level]
    );

    res.json({ message: "Product created", product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category, uom, reorder_level } = req.body;

    await pool.query(
      "UPDATE products SET name=$1, category=$2, uom=$3, reorder_level=$4 WHERE id=$5",
      [name, category, uom, reorder_level, req.params.id]
    );

    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
