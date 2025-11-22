-- Inventory Management System Database Schema
-- PostgreSQL Database: odoo-ims

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS adjustments CASCADE;
DROP TABLE IF EXISTS transfers CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10, 2) DEFAULT 0.00,
    uom VARCHAR(20) DEFAULT 'Units', -- Unit of Measure (Units, KG, Liters, etc.)
    reorder_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouses Table
CREATE TABLE warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table (Tracks current stock levels per product per warehouse)
CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER DEFAULT 0 CHECK (reserved_quantity >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, warehouse_id)
);

-- Receipts Table (Incoming stock - purchases, returns, etc.)
CREATE TABLE receipts (
    receipt_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    supplier_name VARCHAR(255),
    reference_number VARCHAR(100),
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'completed', 'cancelled')),
    notes TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries Table (Outgoing stock - sales, shipments, etc.)
CREATE TABLE deliveries (
    delivery_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    customer_name VARCHAR(255),
    reference_number VARCHAR(100),
    delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'in_transit', 'completed', 'cancelled')),
    notes TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfers Table (Inter-warehouse stock movements)
CREATE TABLE transfers (
    transfer_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    from_warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    to_warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
    notes TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CHECK (from_warehouse_id != to_warehouse_id)
);

-- Adjustments Table (Stock corrections, damages, losses, etc.)
CREATE TABLE adjustments (
    adjustment_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL, -- Can be positive or negative
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('damaged', 'lost', 'found', 'expired', 'correction', 'other')),
    notes TEXT,
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_receipts_product ON receipts(product_id);
CREATE INDEX idx_receipts_warehouse ON receipts(warehouse_id);
CREATE INDEX idx_receipts_date ON receipts(receipt_date);
CREATE INDEX idx_deliveries_product ON deliveries(product_id);
CREATE INDEX idx_deliveries_warehouse ON deliveries(warehouse_id);
CREATE INDEX idx_deliveries_date ON deliveries(delivery_date);
CREATE INDEX idx_transfers_product ON transfers(product_id);
CREATE INDEX idx_transfers_from_warehouse ON transfers(from_warehouse_id);
CREATE INDEX idx_transfers_to_warehouse ON transfers(to_warehouse_id);
CREATE INDEX idx_adjustments_product ON adjustments(product_id);
CREATE INDEX idx_adjustments_warehouse ON adjustments(warehouse_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update inventory last_updated
CREATE TRIGGER update_inventory_last_updated BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing

-- Sample Users
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@ims.com', '$2a$10$example_hash', 'admin'),
('manager1', 'manager@ims.com', '$2a$10$example_hash', 'manager'),
('user1', 'user@ims.com', '$2a$10$example_hash', 'user');

-- Sample Warehouses
INSERT INTO warehouses (warehouse_name, location, capacity) VALUES
('Main Warehouse', 'Mumbai, Maharashtra', 10000),
('Regional Warehouse - North', 'Delhi, NCR', 5000),
('Regional Warehouse - South', 'Bangalore, Karnataka', 5000),
('Distribution Center', 'Pune, Maharashtra', 3000);

-- Sample Products
INSERT INTO products (product_name, sku, description, category, unit_price, uom, reorder_level) VALUES
('Widget A Pro', 'WID-A-001', 'High-performance widget for industrial use', 'Electronics', 1250.00, 'Units', 20),
('Component XYZ', 'CMP-XYZ-045', 'Essential component for assembly', 'Components', 450.00, 'Units', 50),
('Raw Material 123', 'RAW-123', 'Base raw material for production', 'Raw Materials', 150.00, 'KG', 100),
('Packaging Box Standard', 'PKG-BOX-STD', 'Standard cardboard packaging box', 'Packaging', 25.00, 'Units', 200),
('Finished Product Alpha', 'FIN-ALPHA-01', 'Complete finished product ready for sale', 'Finished Goods', 3500.00, 'Units', 50),
('Component Beta', 'CMP-BETA-007', 'Secondary component for assembly', 'Components', 680.00, 'Units', 30),
('Spare Parts Kit', 'SPR-KIT-001', 'Complete spare parts kit', 'Components', 1200.00, 'Kits', 30),
('Electronic Board V2', 'PCB-V2-034', 'Advanced electronic circuit board', 'Electronics', 890.00, 'Units', 40);

-- Sample Inventory (Initial stock levels)
INSERT INTO inventory (product_id, warehouse_id, quantity, reserved_quantity) VALUES
-- Main Warehouse
(1, 1, 45, 5),
(2, 1, 120, 0),
(3, 1, 250, 0),
(4, 1, 450, 50),
(5, 1, 85, 15),
(6, 1, 200, 0),
(7, 1, 38, 0),
(8, 1, 67, 0),
-- Regional Warehouse - North
(1, 2, 25, 0),
(2, 2, 0, 0),
(3, 2, 150, 0),
(4, 2, 320, 0),
(5, 2, 55, 10),
(6, 2, 89, 0),
(7, 2, 15, 0),
(8, 2, 42, 0),
-- Regional Warehouse - South
(1, 3, 18, 3),
(2, 3, 75, 0),
(3, 3, 95, 0),
(4, 3, 280, 0),
(5, 3, 35, 5),
(6, 3, 110, 0),
(7, 3, 22, 0),
(8, 3, 58, 0);

-- Sample Receipts
INSERT INTO receipts (product_id, warehouse_id, quantity, supplier_name, reference_number, receipt_date, status, created_by) VALUES
(1, 1, 50, 'Supplier ABC Ltd', 'PO-2024-001', '2024-11-15', 'completed', 1),
(3, 1, 300, 'Raw Materials Corp', 'PO-2024-002', '2024-11-18', 'completed', 1),
(5, 2, 60, 'Finished Goods Inc', 'PO-2024-003', '2024-11-20', 'ready', 2);

-- Sample Deliveries
INSERT INTO deliveries (product_id, warehouse_id, quantity, customer_name, reference_number, delivery_date, status, created_by) VALUES
(5, 1, 15, 'Customer XYZ Pvt Ltd', 'SO-2024-001', '2024-11-16', 'completed', 2),
(1, 2, 10, 'Retail Chain ABC', 'SO-2024-002', '2024-11-19', 'in_transit', 2),
(4, 1, 100, 'Packaging Distributors', 'SO-2024-003', '2024-11-21', 'ready', 3);

-- Sample Transfers
INSERT INTO transfers (product_id, from_warehouse_id, to_warehouse_id, quantity, transfer_date, status, created_by) VALUES
(2, 1, 2, 50, '2024-11-17', 'completed', 1),
(6, 1, 3, 30, '2024-11-20', 'in_transit', 1),
(7, 2, 3, 8, '2024-11-21', 'pending', 2);

-- Sample Adjustments
INSERT INTO adjustments (product_id, warehouse_id, quantity_change, reason, notes, adjustment_date, created_by) VALUES
(2, 2, -5, 'damaged', 'Damaged during handling', '2024-11-18', 2),
(7, 1, 3, 'found', 'Found during inventory audit', '2024-11-19', 1),
(3, 3, -10, 'expired', 'Material expired, removed from stock', '2024-11-20', 2);

-- Views for easier querying

-- View: Current stock levels with product details
CREATE OR REPLACE VIEW v_current_stock AS
SELECT 
    p.product_id,
    p.product_name,
    p.sku,
    p.category,
    p.unit_price,
    p.uom,
    p.reorder_level,
    w.warehouse_id,
    w.warehouse_name,
    w.location,
    i.quantity,
    i.reserved_quantity,
    (i.quantity - i.reserved_quantity) AS available_quantity,
    (i.quantity * p.unit_price) AS stock_value,
    CASE 
        WHEN i.quantity = 0 THEN 'out_of_stock'
        WHEN i.quantity <= p.reorder_level THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status,
    i.last_updated
FROM inventory i
JOIN products p ON i.product_id = p.product_id
JOIN warehouses w ON i.warehouse_id = w.warehouse_id
WHERE p.is_active = TRUE AND w.is_active = TRUE;

-- View: Stock movements (all transactions)
CREATE OR REPLACE VIEW v_stock_movements AS
SELECT 
    'receipt' AS movement_type,
    r.receipt_id AS transaction_id,
    r.product_id,
    p.product_name,
    p.sku,
    r.warehouse_id,
    w.warehouse_name,
    r.quantity AS quantity_change,
    r.supplier_name AS party_name,
    r.reference_number,
    r.receipt_date AS transaction_date,
    r.notes,
    r.created_by,
    r.created_at
FROM receipts r
JOIN products p ON r.product_id = p.product_id
JOIN warehouses w ON r.warehouse_id = w.warehouse_id

UNION ALL

SELECT 
    'delivery' AS movement_type,
    d.delivery_id AS transaction_id,
    d.product_id,
    p.product_name,
    p.sku,
    d.warehouse_id,
    w.warehouse_name,
    -d.quantity AS quantity_change,
    d.customer_name AS party_name,
    d.reference_number,
    d.delivery_date AS transaction_date,
    d.notes,
    d.created_by,
    d.created_at
FROM deliveries d
JOIN products p ON d.product_id = p.product_id
JOIN warehouses w ON d.warehouse_id = w.warehouse_id

UNION ALL

SELECT 
    'adjustment' AS movement_type,
    a.adjustment_id AS transaction_id,
    a.product_id,
    p.product_name,
    p.sku,
    a.warehouse_id,
    w.warehouse_name,
    a.quantity_change,
    a.reason AS party_name,
    NULL AS reference_number,
    a.adjustment_date AS transaction_date,
    a.notes,
    a.created_by,
    a.created_at
FROM adjustments a
JOIN products p ON a.product_id = p.product_id
JOIN warehouses w ON a.warehouse_id = w.warehouse_id

ORDER BY transaction_date DESC, created_at DESC;

-- Completion message
SELECT 'Database schema created successfully!' AS message;
