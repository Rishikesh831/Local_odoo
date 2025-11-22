import pool from "../config/db.js";

export const getAllDeliveries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.delivery_id as id, d.customer_name as customer, d.delivery_date as schedule_date,
        d.reference_number, d.notes, d.created_at, d.created_by, 'done' as status,
        COUNT(di.id) as item_count 
      FROM deliveries d 
      LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id 
      GROUP BY d.delivery_id, d.customer_name, d.delivery_date, d.reference_number, d.notes, d.created_at, d.created_by
      ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;
    
    const deliveryResult = await pool.query(
      `SELECT delivery_id as id, customer_name as customer, delivery_date as schedule_date,
        reference_number, notes, created_at, created_by, 'done' as status
      FROM deliveries WHERE delivery_id=$1`,
      [deliveryId]
    );

    if (deliveryResult.rows.length === 0) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    const itemsResult = await pool.query(
      `SELECT di.id, di.delivery_id, di.product_id, di.qty, di.location_id,
        p.product_name, p.sku 
      FROM delivery_items di 
      JOIN products p ON di.product_id = p.product_id 
      WHERE di.delivery_id=$1`,
      [deliveryId]
    );

    res.json({
      ...deliveryResult.rows[0],
      items: itemsResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createDelivery = async (req, res) => {
  try {
    const { customer, schedule_date, responsible } = req.body;

    const result = await pool.query(
      "INSERT INTO deliveries (customer, schedule_date, responsible, status) VALUES ($1, $2, $3, 'draft') RETURNING *",
      [customer, schedule_date, responsible]
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

    // Get current status
    const deliveryStatus = await pool.query(
      "SELECT status FROM deliveries WHERE id=$1",
      [deliveryId]
    );

    if (deliveryStatus.rows.length === 0) {
      return res.status(404).json({ error: "Delivery not found" });
    }

    const currentStatus = deliveryStatus.rows[0].status;
    let newStatus = currentStatus;

    // Status progression: draft -> ready -> done
    if (currentStatus === 'draft') {
      newStatus = 'ready';
    } else if (currentStatus === 'ready') {
      newStatus = 'done';
      
      // Only reduce stock when moving to done
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
    }

    await pool.query("UPDATE deliveries SET status=$1 WHERE id=$2", [
      newStatus,
      deliveryId,
    ]);

    res.json({ message: "Delivery status updated", status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
