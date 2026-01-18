--
-- Flow360 Column Additions
-- Run these ONE AT A TIME in the Replit Production Database Panel
-- Each statement will succeed or fail with "column already exists" (which is OK)
--

-- ============================================================================
-- STAFF TABLE
-- ============================================================================
ALTER TABLE staff ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id);

-- Backfill vendor_id from branch relationships (run after adding column)
UPDATE staff s SET vendor_id = b.vendor_id
FROM branches b WHERE s.branch_id = b.id AND s.vendor_id IS NULL AND b.vendor_id IS NOT NULL;

-- ============================================================================
-- SALES TABLE
-- ============================================================================
ALTER TABLE sales ADD COLUMN IF NOT EXISTS original_printed boolean DEFAULT false;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS kra_internal_data text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES items(id);

-- ============================================================================
-- BRANCHES TABLE
-- ============================================================================
ALTER TABLE branches ADD COLUMN IF NOT EXISTS bulk_sales_kra_percentage integer DEFAULT 100;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS controller_id varchar;

-- ============================================================================
-- SHIFTS TABLE
-- ============================================================================
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS reconciliation_status text DEFAULT 'pending';

-- Add check constraint separately (may already exist)
-- ALTER TABLE shifts ADD CONSTRAINT shifts_reconciliation_status_check 
--     CHECK (reconciliation_status IN ('pending', 'reconciled'));

-- ============================================================================
-- SHIFT_READINGS TABLE
-- ============================================================================
ALTER TABLE shift_readings ADD COLUMN IF NOT EXISTS incoming_attendant_id uuid REFERENCES staff(id);
ALTER TABLE shift_readings ADD COLUMN IF NOT EXISTS rtt numeric DEFAULT 0;
ALTER TABLE shift_readings ADD COLUMN IF NOT EXISTS self_fueling numeric DEFAULT 0;
ALTER TABLE shift_readings ADD COLUMN IF NOT EXISTS prepaid_sale numeric DEFAULT 0;

-- ============================================================================
-- NOZZLES TABLE
-- ============================================================================
ALTER TABLE nozzles ADD COLUMN IF NOT EXISTS item_id uuid;
ALTER TABLE nozzles ADD COLUMN IF NOT EXISTS tank_id uuid;

-- ============================================================================
-- DISPENSERS TABLE
-- ============================================================================
ALTER TABLE dispensers ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES items(id);
ALTER TABLE dispensers ADD COLUMN IF NOT EXISTS tank_id uuid REFERENCES tanks(id);

-- ============================================================================
-- ITEMS TABLE
-- ============================================================================
ALTER TABLE items ADD COLUMN IF NOT EXISTS color_code varchar(10);

-- ============================================================================
-- LOYALTY_TRANSACTIONS TABLE
-- ============================================================================
ALTER TABLE loyalty_transactions ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES items(id);

-- ============================================================================
-- API_LOGS TABLE
-- ============================================================================
ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS external_endpoint text;
