-- ============================================
-- FLOW360 PRODUCTION DATABASE MIGRATION
-- Run this on your production database
-- Generated: 2024-12-24
-- ============================================

-- 1. Vendor Partners (Suppliers/Transporters)
CREATE TABLE IF NOT EXISTS vendor_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  partner_type VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  tin VARCHAR(50),
  physical_address TEXT,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vendor PO Sequences
CREATE TABLE IF NOT EXISTS vendor_po_sequences (
  vendor_id UUID PRIMARY KEY NOT NULL,
  next_po_number INTEGER DEFAULT 1
);

-- 3. Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  supplier_id UUID,
  po_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  expected_delivery DATE,
  notes TEXT,
  created_by UUID,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  transporter_id UUID,
  transport_cost NUMERIC DEFAULT 0,
  vehicle_registration VARCHAR(50),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  approval_status VARCHAR(50) DEFAULT 'draft',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_comments TEXT
);

-- 4. Purchase Order Items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL,
  item_id UUID,
  item_name VARCHAR(255) NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC,
  total_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Purchase Order Acceptances
CREATE TABLE IF NOT EXISTS purchase_order_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL,
  branch_id UUID NOT NULL,
  accepted_by UUID,
  bowser_volume NUMERIC NOT NULL,
  dips_mm NUMERIC,
  total_variance NUMERIC,
  remarks TEXT,
  acceptance_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tank Readings for PO Acceptance
CREATE TABLE IF NOT EXISTS po_acceptance_tank_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acceptance_id UUID NOT NULL,
  tank_id UUID NOT NULL,
  volume_before NUMERIC NOT NULL,
  volume_after NUMERIC NOT NULL,
  variance NUMERIC
);

-- 7. Dispenser Readings for PO Acceptance
CREATE TABLE IF NOT EXISTS po_acceptance_dispenser_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acceptance_id UUID NOT NULL,
  dispenser_id UUID NOT NULL,
  meter_reading_before NUMERIC NOT NULL,
  meter_reading_after NUMERIC NOT NULL,
  variance NUMERIC
);

-- 8. Add missing columns to dispensers table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispensers' AND column_name = 'item_id') THEN
    ALTER TABLE dispensers ADD COLUMN item_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispensers' AND column_name = 'tank_id') THEN
    ALTER TABLE dispensers ADD COLUMN tank_id UUID;
  END IF;
END $$;

-- 9. Add missing columns to tanks table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tanks' AND column_name = 'item_id') THEN
    ALTER TABLE tanks ADD COLUMN item_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tanks' AND column_name = 'kra_item_cd') THEN
    ALTER TABLE tanks ADD COLUMN kra_item_cd TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tanks' AND column_name = 'last_kra_synced_stock') THEN
    ALTER TABLE tanks ADD COLUMN last_kra_synced_stock NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tanks' AND column_name = 'kra_sync_status') THEN
    ALTER TABLE tanks ADD COLUMN kra_sync_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- 10. Add missing columns to nozzles table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nozzles' AND column_name = 'initial_meter_reading') THEN
    ALTER TABLE nozzles ADD COLUMN initial_meter_reading NUMERIC DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nozzles' AND column_name = 'tank_id') THEN
    ALTER TABLE nozzles ADD COLUMN tank_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nozzles' AND column_name = 'item_id') THEN
    ALTER TABLE nozzles ADD COLUMN item_id UUID;
  END IF;
END $$;

-- 11. Dispenser-Tanks Junction Table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS dispenser_tanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispenser_id UUID NOT NULL REFERENCES dispensers(id) ON DELETE CASCADE,
  tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dispenser_id, tank_id)
);

-- Done!
-- 12. Backfill item_id for legacy dispensers from their linked tanks
UPDATE dispensers d
SET item_id = t.item_id
FROM tanks t
WHERE d.tank_id = t.id 
  AND d.item_id IS NULL 
  AND t.item_id IS NOT NULL;

SELECT 'Migration completed successfully!' as status;
