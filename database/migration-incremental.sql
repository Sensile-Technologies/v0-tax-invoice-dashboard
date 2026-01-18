--
-- Flow360 Incremental Migration Script
-- Changes since last deployment (commit 68f40b8f)
-- Generated: 2026-01-18
-- 
-- This script contains ONLY the schema changes made since the last deployment.
-- Run this on production BEFORE deploying the new code.
--
-- IMPORTANT: Run these statements in order. Each statement is idempotent (safe to run multiple times).
--

BEGIN;

-- ============================================================================
-- 1. STAFF TABLE: Add vendor_id column
-- ============================================================================
-- Purpose: Allow staff to be directly associated with a vendor, independent of branch
-- This fixes the issue where staff would "disappear" when their branch changed

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff' AND column_name = 'vendor_id'
    ) THEN
        ALTER TABLE staff ADD COLUMN vendor_id uuid;
        RAISE NOTICE 'Added vendor_id column to staff table';
    ELSE
        RAISE NOTICE 'staff.vendor_id already exists, skipping';
    END IF;
END $$;

-- Add foreign key constraint for staff.vendor_id -> vendors.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'staff_vendor_id_fkey' AND table_name = 'staff'
    ) THEN
        ALTER TABLE staff ADD CONSTRAINT staff_vendor_id_fkey 
            FOREIGN KEY (vendor_id) REFERENCES vendors(id);
        RAISE NOTICE 'Added foreign key constraint staff_vendor_id_fkey';
    ELSE
        RAISE NOTICE 'staff_vendor_id_fkey constraint already exists, skipping';
    END IF;
END $$;

-- Backfill vendor_id from existing branch relationships
-- This ensures existing staff records get the correct vendor_id
UPDATE staff s
SET vendor_id = b.vendor_id
FROM branches b
WHERE s.branch_id = b.id 
  AND s.vendor_id IS NULL 
  AND b.vendor_id IS NOT NULL;


-- ============================================================================
-- 2. SALES TABLE: Add original_printed tracking column
-- ============================================================================
-- Purpose: Track whether the original invoice has been printed (prints once only)
-- Copies can be printed unlimited times with watermark

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' AND column_name = 'original_printed'
    ) THEN
        ALTER TABLE sales ADD COLUMN original_printed boolean DEFAULT false;
        RAISE NOTICE 'Added original_printed column to sales table';
    ELSE
        RAISE NOTICE 'sales.original_printed already exists, skipping';
    END IF;
END $$;


-- ============================================================================
-- 3. SALES TABLE: Add kra_internal_data column
-- ============================================================================
-- Purpose: Store KRA internal data (intrlData) separately from CU INV NO
-- Format: KRA returns intrlData which is stored here for verification

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' AND column_name = 'kra_internal_data'
    ) THEN
        ALTER TABLE sales ADD COLUMN kra_internal_data text;
        RAISE NOTICE 'Added kra_internal_data column to sales table';
    ELSE
        RAISE NOTICE 'sales.kra_internal_data already exists, skipping';
    END IF;
END $$;


-- ============================================================================
-- 4. BRANCHES TABLE: Add bulk_sales_kra_percentage column
-- ============================================================================
-- Purpose: Configure what percentage of bulk sales should be transmitted to KRA
-- Default is 100% (all bulk sales transmitted). Directors/Vendors can adjust this.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branches' AND column_name = 'bulk_sales_kra_percentage'
    ) THEN
        ALTER TABLE branches ADD COLUMN bulk_sales_kra_percentage integer DEFAULT 100;
        RAISE NOTICE 'Added bulk_sales_kra_percentage column to branches table';
    ELSE
        RAISE NOTICE 'branches.bulk_sales_kra_percentage already exists, skipping';
    END IF;
END $$;


-- ============================================================================
-- VERIFICATION QUERIES (run after migration to confirm changes)
-- ============================================================================
-- Uncomment these to verify the migration was successful:

-- Check staff.vendor_id column exists and has data:
-- SELECT COUNT(*) as total_staff, COUNT(vendor_id) as with_vendor_id FROM staff;

-- Check sales.original_printed column:
-- SELECT COUNT(*) as total_sales, COUNT(*) FILTER (WHERE original_printed = true) as printed FROM sales;

-- Check sales.kra_internal_data column:
-- SELECT COUNT(*) as total_sales, COUNT(kra_internal_data) as with_internal_data FROM sales;

-- Check branches.bulk_sales_kra_percentage column:
-- SELECT id, name, bulk_sales_kra_percentage FROM branches LIMIT 5;


COMMIT;

-- ============================================================================
-- SUMMARY OF CHANGES
-- ============================================================================
-- 
-- Table: staff
--   + vendor_id (uuid, FK -> vendors.id)
--     - Allows direct vendor association for staff
--     - Fixes staff "disappearing" when branch changes
--     - Auto-backfilled from branch.vendor_id for existing records
--
-- Table: sales  
--   + original_printed (boolean, default false)
--     - Tracks if original invoice was printed
--     - Original prints once, copies print with watermark
--   + kra_internal_data (text)
--     - Stores KRA intrlData separately
--     - CU INV NO format: {sdcId}/{rcptNo}
--
-- Table: branches
--   + bulk_sales_kra_percentage (integer, default 100)
--     - Controls % of bulk sales transmitted to KRA
--     - Configurable by Directors/Vendors only
--
-- ============================================================================
