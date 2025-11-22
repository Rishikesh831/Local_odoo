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
    const result = await pool.query(`
      SELECT 
        p.product_id as id, p.product_name as name, p.sku, p.category, 
        p.unit_price, p.uom, p.reorder_level, p.is_active,
        COALESCE(SUM(s.qty), 0) as total_qty
      FROM products p
      LEFT JOIN stock s ON p.product_id = s.product_id
      GROUP BY p.product_id, p.product_name, p.sku, p.category, p.unit_price, p.uom, p.reorder_level, p.is_active
      ORDER BY p.product_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const productResult = await pool.query(
      `SELECT 
        p.product_id as id, p.product_name as name, p.sku, p.category, 
        p.unit_price, p.uom, p.reorder_level, p.is_active,
        COALESCE(SUM(s.qty), 0) as total_qty
      FROM products p
      LEFT JOIN stock s ON p.product_id = s.product_id
      WHERE p.product_id = $1
      GROUP BY p.product_id, p.product_name, p.sku, p.category, p.unit_price, p.uom, p.reorder_level, p.is_active`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Get stock by warehouse
    const stockResult = await pool.query(
      `SELECT s.id, s.product_id, s.warehouse_id, s.location_id, s.qty,
        w.warehouse_name
      FROM stock s
      JOIN warehouses w ON s.warehouse_id = w.warehouse_id
      WHERE s.product_id = $1`,
      [productId]
    );

    res.json({
      ...productResult.rows[0],
      stock_by_warehouse: stockResult.rows
    });
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
