-- Migration: Add bulk sales KRA intermittency and related columns
-- Date: 2026-01-19
-- Description: Adds columns needed for bulk sales KRA transmission with configurable intermittency rate

-- Add bulk_sales_kra_percentage to branches (controls % of bulk sales sent to KRA)
-- 100 = full compliance, 0 = no transmission
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS bulk_sales_kra_percentage INTEGER DEFAULT 100;

-- Add controller_id for PTS pump controller integration
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS controller_id VARCHAR(255);

-- Add whatsapp_directors for DSSR notifications
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS whatsapp_directors JSONB DEFAULT '[]'::jsonb;

-- Add kra_status column to sales table for tracking transmission status
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS kra_status VARCHAR(50) DEFAULT 'pending';

-- Add transmission_status column to sales table
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS transmission_status VARCHAR(50) DEFAULT 'pending';

-- Add source_system column to identify where sales originated
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS source_system VARCHAR(50);

-- Create index for efficient bulk sales queries
CREATE INDEX IF NOT EXISTS idx_sales_source_system ON sales(source_system);
CREATE INDEX IF NOT EXISTS idx_sales_kra_status ON sales(kra_status);
CREATE INDEX IF NOT EXISTS idx_sales_shift_source ON sales(shift_id, source_system);

-- Update existing sales to have proper source_system if null
UPDATE sales 
SET source_system = 'manual' 
WHERE source_system IS NULL AND is_automated = false;

UPDATE sales 
SET source_system = 'pos' 
WHERE source_system IS NULL AND is_automated = true;

COMMENT ON COLUMN branches.bulk_sales_kra_percentage IS 'Percentage of bulk sales to transmit to KRA (0-100). 100 = full compliance.';
COMMENT ON COLUMN branches.controller_id IS 'PTS pump controller ID for automated sales capture';
COMMENT ON COLUMN branches.whatsapp_directors IS 'JSON array of director phone numbers for DSSR WhatsApp notifications';
COMMENT ON COLUMN sales.kra_status IS 'KRA transmission status: pending, transmitted, failed';
COMMENT ON COLUMN sales.source_system IS 'Origin of sale: manual, pos, meter_diff_bulk, controller';
