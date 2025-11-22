-- Migration: Add status and updated_at columns to receipts and deliveries tables
-- Date: 2024-11-22

-- Add status column to receipts table
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'completed', 'cancelled'));

-- Add updated_at column to receipts table
ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add status column to deliveries table
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'in_transit', 'completed', 'cancelled'));

-- Add updated_at column to deliveries table
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deliveries_updated_at ON deliveries;
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing records to have a default status if they don't have one
UPDATE receipts SET status = 'completed' WHERE status IS NULL;
UPDATE deliveries SET status = 'completed' WHERE status IS NULL;

-- Success message
SELECT 'Migration completed successfully! Status and updated_at columns added to receipts and deliveries tables.' AS message;
