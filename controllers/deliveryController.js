import pool from "../config/db.js";

export const getAllDeliveries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.delivery_id as id, d.customer_name as customer, d.delivery_date as schedule_date,
        d.reference_number, d.notes, d.created_at, d.created_by, 
        COALESCE(d.status, 'draft') as status,
        COUNT(di.id) as item_count 
      FROM deliveries d 
      LEFT JOIN delivery_items di ON d.delivery_id = di.delivery_id 
      GROUP BY d.delivery_id, d.customer_name, d.delivery_date, d.reference_number, d.notes, d.created_at, d.created_by, d.status
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
        reference_number, notes, created_at, created_by, COALESCE(status, 'draft') as status
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
    const { customer_name, delivery_date, reference_number, notes, product_id, quantity, warehouse_id } = req.body;

    const result = await pool.query(
      "INSERT INTO deliveries (customer_name, delivery_date, reference_number, notes, product_id, quantity, warehouse_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft') RETURNING delivery_id as id, customer_name, delivery_date, reference_number, notes, product_id, quantity, warehouse_id, status",
      [customer_name, delivery_date, reference_number, notes || null, product_id, quantity, warehouse_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addDeliveryItem = async (req, res) => {
  try {
    const { product_id, qty, warehouse_id } = req.body;

    // delivery_items uses location_id, not warehouse_id
    await pool.query(
      "INSERT INTO delivery_items (delivery_id, product_id, qty, location_id) VALUES ($1, $2, $3, $4)",
      [req.params.deliveryId, product_id, qty, warehouse_id || null]
    );

    res.json({ message: "Delivery item added" });
  } catch (err) {
    console.error('Add delivery item error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const validateDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.deliveryId;

    // Get current status
    const deliveryStatus = await pool.query(
      "SELECT status FROM deliveries WHERE delivery_id=$1",
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
      // Get items to validate
      const items = await pool.query(
        "SELECT di.product_id, di.qty, di.location_id, p.product_name FROM delivery_items di JOIN products p ON di.product_id = p.product_id WHERE di.delivery_id=$1",
        [deliveryId]
      );

      // Check stock availability for all items BEFORE making any changes
      const stockIssues = [];
      for (let item of items.rows) {
        const locationId = item.location_id || 1;
        
        // Check current stock at this location
        const stockCheck = await pool.query(
          "SELECT qty, warehouse_id FROM stock WHERE product_id=$1 AND location_id=$2",
          [item.product_id, locationId]
        );

        if (stockCheck.rows.length === 0) {
          stockIssues.push(`Product '${item.product_name}' not available at location ${locationId}`);
        } else {
          const currentStock = parseFloat(stockCheck.rows[0].qty);
          const requiredQty = parseFloat(item.qty);
          
          if (currentStock < requiredQty) {
            stockIssues.push(`Insufficient stock for '${item.product_name}': Available ${currentStock}, Required ${requiredQty}`);
          }
        }
      }

      // If there are stock issues, return error and don't change status
      if (stockIssues.length > 0) {
        return res.status(400).json({ 
          error: "Cannot complete delivery due to insufficient stock",
          details: stockIssues
        });
      }

      // All stock checks passed, proceed with delivery
      newStatus = 'done';
      
      // Reduce stock for all items
      for (let item of items.rows) {
        const locationId = item.location_id || 1;
        
        // Get warehouse_id for this location
        const locationInfo = await pool.query(
          "SELECT warehouse_id FROM stock WHERE location_id=$1 LIMIT 1",
          [locationId]
        );
        
        const warehouseId = locationInfo.rows.length > 0 ? locationInfo.rows[0].warehouse_id : 1;
        
        // Reduce stock quantity
        await pool.query(
          "UPDATE stock SET qty = qty - $1 WHERE product_id=$2 AND warehouse_id=$3 AND location_id=$4",
          [item.qty, item.product_id, warehouseId, locationId]
        );
      }
    }

    await pool.query("UPDATE deliveries SET status=$1 WHERE delivery_id=$2", [
      newStatus,
      deliveryId,
    ]);

    res.json({ message: "Delivery status updated", status: newStatus });
  } catch (err) {
    console.error('Validate delivery error:', err);
    res.status(500).json({ error: err.message });
  }
};
