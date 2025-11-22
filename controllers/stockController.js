import pool from "../config/db.js";

export const getDetailedStock = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        s.id,
        s.product_id,
        s.warehouse_id,
        s.location_id,
        s.qty,
        p.product_name,
        p.sku,
        p.category,
        p.uom,
        p.unit_price,
        w.warehouse_name,
        w.location as warehouse_location
      FROM stock s
      JOIN products p ON s.product_id = p.product_id
      JOIN warehouses w ON s.warehouse_id = w.warehouse_id
      ORDER BY p.product_name, w.warehouse_name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLocationsByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    
    // For now, return a basic location structure
    // In a full implementation, you'd have a locations table
    const result = await pool.query(
      `SELECT DISTINCT 
        location_id as id,
        location_id as code,
        CONCAT('Location ', location_id) as name
      FROM stock
      WHERE warehouse_id = $1
      ORDER BY location_id`,
      [warehouseId]
    );
    
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createStock = async (req, res) => {
  try {
    const { product_id, warehouse_id, location_id, qty } = req.body;

    // Validate inputs
    if (!product_id || !warehouse_id || !location_id || !qty) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    // Check if stock record already exists
    const existing = await pool.query(
      'SELECT * FROM stock WHERE product_id=$1 AND warehouse_id=$2 AND location_id=$3',
      [product_id, warehouse_id, location_id]
    );

    if (existing.rows.length > 0) {
      // Update existing stock
      const result = await pool.query(
        'UPDATE stock SET qty = qty + $1 WHERE product_id=$2 AND warehouse_id=$3 AND location_id=$4 RETURNING *',
        [qty, product_id, warehouse_id, location_id]
      );
      res.json({ message: 'Stock updated successfully', stock: result.rows[0] });
    } else {
      // Insert new stock record
      const result = await pool.query(
        'INSERT INTO stock (product_id, warehouse_id, location_id, qty) VALUES ($1, $2, $3, $4) RETURNING *',
        [product_id, warehouse_id, location_id, qty]
      );
      res.json({ message: 'Stock created successfully', stock: result.rows[0] });
    }
  } catch (err) {
    console.error('Create stock error:', err);
    res.status(500).json({ error: err.message });
  }
};
