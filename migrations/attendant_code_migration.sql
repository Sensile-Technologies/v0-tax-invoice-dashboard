-- ============================================
-- ATTENDANT CODE MIGRATION
-- Adds 4-digit branch-specific login codes for mobile APK
-- Safe to run multiple times
-- ============================================

-- Add attendant_code column to staff table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'attendant_code') THEN
    ALTER TABLE staff ADD COLUMN attendant_code VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'code_generated_at') THEN
    ALTER TABLE staff ADD COLUMN code_generated_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'failed_code_attempts') THEN
    ALTER TABLE staff ADD COLUMN failed_code_attempts INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'locked_until') THEN
    ALTER TABLE staff ADD COLUMN locked_until TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for faster code lookups (globally unique codes)
CREATE INDEX IF NOT EXISTS idx_staff_attendant_code ON staff(attendant_code) WHERE attendant_code IS NOT NULL;

-- Add unique constraint for global uniqueness (ignore if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'staff_attendant_code_unique'
  ) THEN
    ALTER TABLE staff ADD CONSTRAINT staff_attendant_code_unique UNIQUE (attendant_code);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Constraint may fail if there are existing duplicates - log and continue
  RAISE NOTICE 'Could not add unique constraint on attendant_code - duplicates may exist';
END $$;

-- Auto-generate 4-digit codes for existing staff (cashiers, supervisors, managers)
-- Codes are GLOBALLY unique (not just per-branch) to prevent cross-branch collision
DO $$
DECLARE
  staff_row RECORD;
  new_code VARCHAR(4);
  code_exists BOOLEAN;
BEGIN
  FOR staff_row IN 
    SELECT id, branch_id, role 
    FROM staff 
    WHERE role IN ('Cashier', 'Supervisor', 'Manager', 'cashier', 'supervisor', 'manager')
    AND (attendant_code IS NULL OR attendant_code = '')
    AND branch_id IS NOT NULL
  LOOP
    -- Generate GLOBALLY unique 4-digit code
    LOOP
      new_code := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      
      SELECT EXISTS(
        SELECT 1 FROM staff 
        WHERE attendant_code = new_code
      ) INTO code_exists;
      
      EXIT WHEN NOT code_exists;
    END LOOP;
    
    UPDATE staff 
    SET attendant_code = new_code, 
        code_generated_at = NOW()
    WHERE id = staff_row.id;
  END LOOP;
END $$;

SELECT 'Attendant code migration completed successfully!' as status;
