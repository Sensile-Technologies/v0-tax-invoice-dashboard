-- ============================================
-- FLOW360 PRODUCTION DATABASE MIGRATION
-- Run this on your production database
-- Safe to run multiple times (uses IF NOT EXISTS)
-- Updated: 2026-01-02
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Branch Logs (KRA API logging)
CREATE TABLE IF NOT EXISTS branch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL,
  log_type VARCHAR(50) NOT NULL,
  endpoint TEXT,
  request_payload JSONB,
  response_payload JSONB,
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Movements (KRA stock sync records)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL,
  tin TEXT,
  bhf_id TEXT,
  sar_no INTEGER,
  org_sar_no INTEGER DEFAULT 0,
  reg_ty_cd TEXT DEFAULT 'M',
  cust_tin TEXT,
  cust_bhf_id TEXT,
  cust_nm TEXT,
  sar_ty_cd TEXT,
  ocrn_dt TEXT,
  tot_item_cnt INTEGER DEFAULT 1,
  tot_taxbl_amt NUMERIC DEFAULT 0,
  tot_tax_amt NUMERIC DEFAULT 0,
  tot_amt NUMERIC DEFAULT 0,
  remark TEXT,
  regr_id TEXT DEFAULT 'Admin',
  regr_nm TEXT DEFAULT 'Admin',
  modr_id TEXT DEFAULT 'Admin',
  modr_nm TEXT DEFAULT 'Admin',
  kra_status TEXT DEFAULT 'pending',
  kra_response JSONB,
  kra_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Adjustments
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL,
  tank_id UUID,
  adjustment_type VARCHAR(50) NOT NULL,
  quantity NUMERIC NOT NULL,
  previous_stock NUMERIC DEFAULT 0,
  new_stock NUMERIC DEFAULT 0,
  reason TEXT,
  approved_by TEXT,
  approval_status VARCHAR(20) DEFAULT 'pending',
  kra_sync_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branch KRA Counters
CREATE TABLE IF NOT EXISTS branch_kra_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  endpoint TEXT NOT NULL,
  current_sar_no INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Partners (Suppliers/Transporters)
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

-- Vendor PO Sequences
CREATE TABLE IF NOT EXISTS vendor_po_sequences (
  vendor_id UUID PRIMARY KEY NOT NULL,
  next_po_number INTEGER DEFAULT 1
);

-- Purchase Orders
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

-- Purchase Order Items
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

-- Purchase Order Acceptances
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

-- Tank Readings for PO Acceptance
CREATE TABLE IF NOT EXISTS po_acceptance_tank_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acceptance_id UUID NOT NULL,
  tank_id UUID NOT NULL,
  volume_before NUMERIC NOT NULL,
  volume_after NUMERIC NOT NULL,
  variance NUMERIC
);

-- Dispenser Readings for PO Acceptance
CREATE TABLE IF NOT EXISTS po_acceptance_dispenser_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acceptance_id UUID NOT NULL,
  dispenser_id UUID NOT NULL,
  meter_reading_before NUMERIC NOT NULL,
  meter_reading_after NUMERIC NOT NULL,
  variance NUMERIC
);

-- ============================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Branches table columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'sr_number') THEN
    ALTER TABLE branches ADD COLUMN sr_number INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'server_address') THEN
    ALTER TABLE branches ADD COLUMN server_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'server_port') THEN
    ALTER TABLE branches ADD COLUMN server_port TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'controller_id') THEN
    ALTER TABLE branches ADD COLUMN controller_id TEXT;
  END IF;
END $$;

-- Tanks table columns
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

-- Dispensers table columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispensers' AND column_name = 'item_id') THEN
    ALTER TABLE dispensers ADD COLUMN item_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispensers' AND column_name = 'tank_id') THEN
    ALTER TABLE dispensers ADD COLUMN tank_id UUID;
  END IF;
END $$;

-- Nozzles table columns
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

-- Sales table columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'shift_id') THEN
    ALTER TABLE sales ADD COLUMN shift_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'kra_status') THEN
    ALTER TABLE sales ADD COLUMN kra_status TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'kra_rcpt_sign') THEN
    ALTER TABLE sales ADD COLUMN kra_rcpt_sign TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'kra_scu_id') THEN
    ALTER TABLE sales ADD COLUMN kra_scu_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'kra_cu_inv') THEN
    ALTER TABLE sales ADD COLUMN kra_cu_inv TEXT;
  END IF;
END $$;

-- Items table columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'vendor_id') THEN
    ALTER TABLE items ADD COLUMN vendor_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'class_code') THEN
    ALTER TABLE items ADD COLUMN class_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'package_unit') THEN
    ALTER TABLE items ADD COLUMN package_unit TEXT DEFAULT 'NT';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'quantity_unit') THEN
    ALTER TABLE items ADD COLUMN quantity_unit TEXT DEFAULT 'U';
  END IF;
END $$;

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sales_branch_shift ON sales(branch_id, shift_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_adjustments_branch ON stock_adjustments(branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created ON stock_adjustments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_branch ON stock_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_sar ON stock_movements(branch_id, sar_no);

CREATE INDEX IF NOT EXISTS idx_branch_logs_branch ON branch_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_logs_created ON branch_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_branch_logs_type ON branch_logs(branch_id, log_type);

CREATE INDEX IF NOT EXISTS idx_shifts_branch_status ON shifts(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_shifts_branch_date ON shifts(branch_id, start_time);

CREATE INDEX IF NOT EXISTS idx_tanks_branch ON tanks(branch_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_branch ON nozzles(branch_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_dispenser ON nozzles(dispenser_id);

CREATE INDEX IF NOT EXISTS idx_items_vendor ON items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_items_branch ON items(branch_id);

-- ============================================
-- DONE
-- ============================================

SELECT 'Production migration completed successfully!' as status;
