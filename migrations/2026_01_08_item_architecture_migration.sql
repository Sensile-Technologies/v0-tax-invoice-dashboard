-- Migration Script for Item Architecture Updates
-- Date: 2026-01-08
-- Run this BEFORE deploying the new code to production

-- ============================================
-- 1. ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Nozzles performance indexes
CREATE INDEX IF NOT EXISTS idx_nozzles_branch_id ON nozzles(branch_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_item_id ON nozzles(item_id);

-- Branch items indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_branch_items_branch_item ON branch_items(branch_id, item_id);
CREATE INDEX IF NOT EXISTS idx_branch_items_available ON branch_items(branch_id, is_available) WHERE is_available = true;

-- Sales item_id index
CREATE INDEX IF NOT EXISTS idx_sales_item_id ON sales(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);

-- ============================================
-- 2. UPDATE KEROSENE COLOR CODES
-- ============================================

UPDATE items 
SET color_code = '#0D1433' 
WHERE LOWER(item_name) LIKE '%kero%' 
  AND (color_code IS NULL OR color_code = '');

-- Ensure all fuel types have color codes
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
-- 3. ENSURE item_id COLUMNS EXIST
-- ============================================

-- Add item_id to sales if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' AND column_name = 'item_id'
  ) THEN 
    ALTER TABLE sales ADD COLUMN item_id UUID REFERENCES items(id);
  END IF;
END $$;

-- Add item_id to tanks if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tanks' AND column_name = 'item_id'
  ) THEN 
    ALTER TABLE tanks ADD COLUMN item_id UUID REFERENCES items(id);
  END IF;
END $$;

-- Add item_id to nozzles if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'nozzles' AND column_name = 'item_id'
  ) THEN 
    ALTER TABLE nozzles ADD COLUMN item_id UUID REFERENCES items(id);
  END IF;
END $$;

-- Add item_id to dispensers if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dispensers' AND column_name = 'item_id'
  ) THEN 
    ALTER TABLE dispensers ADD COLUMN item_id UUID REFERENCES items(id);
  END IF;
END $$;

-- ============================================
-- 4. MIGRATE LEGACY DATA (fuel_type -> item_id)
-- ============================================

-- Update tanks with matching items based on fuel_type name
UPDATE tanks t
SET item_id = i.id
FROM items i
WHERE t.item_id IS NULL
  AND t.fuel_type IS NOT NULL
  AND UPPER(TRIM(t.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = t.branch_id);

-- Update nozzles with matching items based on fuel_type name  
UPDATE nozzles n
SET item_id = i.id
FROM items i
WHERE n.item_id IS NULL
  AND n.fuel_type IS NOT NULL
  AND UPPER(TRIM(n.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = n.branch_id);

-- Update dispensers with matching items based on fuel_type name
UPDATE dispensers d
SET item_id = i.id
FROM items i
WHERE d.item_id IS NULL
  AND d.fuel_type IS NOT NULL
  AND UPPER(TRIM(d.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = d.branch_id);

-- Update sales with matching items based on fuel_type name
UPDATE sales s
SET item_id = i.id
FROM items i
WHERE s.item_id IS NULL
  AND s.fuel_type IS NOT NULL
  AND UPPER(TRIM(s.fuel_type)) = UPPER(TRIM(i.item_name))
  AND i.vendor_id = (SELECT vendor_id FROM branches WHERE id = s.branch_id);

-- ============================================
-- 5. VERIFICATION QUERIES (Run to check status)
-- ============================================

-- Check for tanks without item_id (should be 0 after migration)
-- SELECT COUNT(*) as tanks_without_item_id FROM tanks WHERE item_id IS NULL;

-- Check for nozzles without item_id (should be 0 after migration)
-- SELECT COUNT(*) as nozzles_without_item_id FROM nozzles WHERE item_id IS NULL;

-- Check for sales without item_id (may have some legacy records)
-- SELECT COUNT(*) as sales_without_item_id FROM sales WHERE item_id IS NULL;

-- Check items with color codes
-- SELECT item_name, color_code FROM items WHERE color_code IS NOT NULL;

-- ============================================
-- 6. OPTIONAL: Add constraints after migration
-- ============================================

-- Only run these AFTER verifying all data has been migrated:
-- ALTER TABLE tanks ALTER COLUMN item_id SET NOT NULL;
-- ALTER TABLE nozzles ALTER COLUMN item_id SET NOT NULL;

-- ============================================
-- END OF MIGRATION
-- ============================================
