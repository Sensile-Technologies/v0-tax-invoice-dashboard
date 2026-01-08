-- ============================================
-- FLOW360 COMPREHENSIVE MIGRATION SCRIPT
-- Covers all changes from last 50 requests
-- Date: 2026-01-08
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- ============================================
-- 1. NEW TABLES
-- ============================================

-- Bulk Sales table (for shift-based bulk fuel sales)
CREATE TABLE IF NOT EXISTS bulk_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL,
  shift_id UUID,
  nozzle_id UUID,
  item_id UUID,
  fuel_type VARCHAR(100),
  opening_reading NUMERIC DEFAULT 0,
  closing_reading NUMERIC DEFAULT 0,
  meter_difference NUMERIC DEFAULT 0,
  invoiced_quantity NUMERIC DEFAULT 0,
  bulk_quantity NUMERIC DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  generated_invoices INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Branch Items table (single source of truth for pricing)
CREATE TABLE IF NOT EXISTS branch_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL,
  item_id UUID NOT NULL,
  sale_price NUMERIC,
  purchase_price NUMERIC,
  is_available BOOLEAN DEFAULT true,
  kra_status VARCHAR(50),
  kra_response TEXT,
  kra_last_synced_at TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pump Callback Events (controller logs)
CREATE TABLE IF NOT EXISTS pump_callback_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pts_id TEXT,
  branch_id UUID,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pump Fuel Grade Mappings
CREATE TABLE IF NOT EXISTS pump_fuel_grade_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  controller_id TEXT,
  fuel_grade_id TEXT NOT NULL,
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Sales table: item_id, source_system, is_automated
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'item_id') THEN
    ALTER TABLE sales ADD COLUMN item_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'source_system') THEN
    ALTER TABLE sales ADD COLUMN source_system VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'is_automated') THEN
    ALTER TABLE sales ADD COLUMN is_automated BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Items table: color_code column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'color_code') THEN
    ALTER TABLE items ADD COLUMN color_code VARCHAR(10);
  END IF;
END $$;

-- Tanks table: item_id
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tanks' AND column_name = 'item_id') THEN
    ALTER TABLE tanks ADD COLUMN item_id UUID;
  END IF;
END $$;

-- Nozzles table: item_id
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nozzles' AND column_name = 'item_id') THEN
    ALTER TABLE nozzles ADD COLUMN item_id UUID;
  END IF;
END $$;

-- Dispensers table: item_id
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispensers' AND column_name = 'item_id') THEN
    ALTER TABLE dispensers ADD COLUMN item_id UUID;
  END IF;
END $$;

-- Branches table: controller_id for PTS matching
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'controller_id') THEN
    ALTER TABLE branches ADD COLUMN controller_id TEXT;
  END IF;
END $$;

-- ============================================
-- 3. PERFORMANCE INDEXES
-- ============================================

-- Nozzles performance indexes
CREATE INDEX IF NOT EXISTS idx_nozzles_branch_id ON nozzles(branch_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_item_id ON nozzles(item_id);

-- Branch items indexes
CREATE INDEX IF NOT EXISTS idx_branch_items_branch_item ON branch_items(branch_id, item_id);
CREATE INDEX IF NOT EXISTS idx_branch_items_available ON branch_items(branch_id, is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_branch_items_branch ON branch_items(branch_id);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_item_id ON sales(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_source_system ON sales(source_system);
CREATE INDEX IF NOT EXISTS idx_sales_is_automated ON sales(is_automated);

-- Bulk sales indexes
CREATE INDEX IF NOT EXISTS idx_bulk_sales_branch ON bulk_sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_shift ON bulk_sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_item ON bulk_sales(item_id);

-- Pump callback events indexes
CREATE INDEX IF NOT EXISTS idx_pump_callback_branch ON pump_callback_events(branch_id);
CREATE INDEX IF NOT EXISTS idx_pump_callback_pts ON pump_callback_events(pts_id);

-- ============================================
-- 4. UPDATE COLOR CODES FOR FUEL TYPES
-- ============================================

UPDATE items 
SET color_code = '#0D1433' 
WHERE LOWER(item_name) LIKE '%kero%' 
  AND (color_code IS NULL OR color_code = '');

UPDATE items 
SET color_code = '#FF0000' 
WHERE LOWER(item_name) LIKE '%petrol%' 
  AND (color_code IS NULL OR color_code = '');

UPDATE items 
SET color_code = '#FFFF00' 
WHERE LOWER(item_name) LIKE '%diesel%' 
  AND (color_code IS NULL OR color_code = '');

UPDATE items 
SET color_code = '#00FF00' 
WHERE LOWER(item_name) LIKE '%super%' 
  AND (color_code IS NULL OR color_code = '');

-- ============================================
-- 5. MIGRATE LEGACY fuel_type TO item_id
-- ============================================

-- Tanks: Match fuel_type string to item_id
UPDATE tanks t
SET item_id = i.id
FROM items i
WHERE t.item_id IS NULL
  AND t.fuel_type IS NOT NULL
  AND UPPER(TRIM(t.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = t.branch_id);

-- Nozzles: Match fuel_type string to item_id
UPDATE nozzles n
SET item_id = i.id
FROM items i
WHERE n.item_id IS NULL
  AND n.fuel_type IS NOT NULL
  AND UPPER(TRIM(n.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = n.branch_id);

-- Dispensers: Match fuel_type string to item_id
UPDATE dispensers d
SET item_id = i.id
FROM items i
WHERE d.item_id IS NULL
  AND d.fuel_type IS NOT NULL
  AND UPPER(TRIM(d.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = d.branch_id);

-- Sales: Match fuel_type string to item_id
UPDATE sales s
SET item_id = i.id
FROM items i
WHERE s.item_id IS NULL
  AND s.fuel_type IS NOT NULL
  AND UPPER(TRIM(s.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = s.branch_id);

-- Bulk Sales: Match fuel_type string to item_id
UPDATE bulk_sales bs
SET item_id = i.id
FROM items i
WHERE bs.item_id IS NULL
  AND bs.fuel_type IS NOT NULL
  AND UPPER(TRIM(bs.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = bs.branch_id);

-- ============================================
-- 6. CREATE branch_items FOR EXISTING DATA
-- ============================================

-- Auto-create branch_items entries for tanks that have item_id
INSERT INTO branch_items (branch_id, item_id, is_available)
SELECT DISTINCT t.branch_id, t.item_id, true
FROM tanks t
WHERE t.item_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM branch_items bi 
    WHERE bi.branch_id = t.branch_id AND bi.item_id = t.item_id
  );

-- Auto-create branch_items entries for nozzles that have item_id
INSERT INTO branch_items (branch_id, item_id, is_available)
SELECT DISTINCT n.branch_id, n.item_id, true
FROM nozzles n
WHERE n.item_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM branch_items bi 
    WHERE bi.branch_id = n.branch_id AND bi.item_id = n.item_id
  );

-- ============================================
-- 7. UNIQUE CONSTRAINTS
-- ============================================

-- Ensure unique branch_items per branch/item combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_branch_items_branch_item'
  ) THEN
    ALTER TABLE branch_items ADD CONSTRAINT uq_branch_items_branch_item 
      UNIQUE (branch_id, item_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, ignore
END $$;

-- ============================================
-- 8. VERIFICATION QUERIES (Uncomment to run)
-- ============================================

-- Check for tanks without item_id
-- SELECT COUNT(*) as tanks_without_item_id FROM tanks WHERE item_id IS NULL;

-- Check for nozzles without item_id
-- SELECT COUNT(*) as nozzles_without_item_id FROM nozzles WHERE item_id IS NULL;

-- Check for sales without item_id
-- SELECT COUNT(*) as sales_without_item_id FROM sales WHERE item_id IS NULL;

-- Check items with color codes
-- SELECT item_name, color_code FROM items WHERE color_code IS NOT NULL;

-- Check branch_items count
-- SELECT COUNT(*) as branch_items_count FROM branch_items;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 'Comprehensive migration completed successfully!' as status;
