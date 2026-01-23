-- Flow360 Full Database Schema Migration
-- Generated: 2026-01-23
-- Run this script to create the complete database schema from scratch

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  trading_name VARCHAR(255),
  kra_pin VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  item_count INTEGER DEFAULT 0,
  whatsapp_directors JSONB DEFAULT '[]'::jsonb
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  vendor_id UUID REFERENCES vendors(id),
  name TEXT NOT NULL,
  bhf_id TEXT,
  location TEXT,
  address TEXT,
  county TEXT,
  local_tax_office TEXT,
  manager TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  device_token TEXT,
  storage_indices JSONB,
  trading_name VARCHAR(255),
  kra_pin VARCHAR(50),
  server_address VARCHAR(255),
  server_port VARCHAR(10),
  sr_number INTEGER DEFAULT 0,
  invoice_number INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  device_serial_number VARCHAR(255),
  controller_id VARCHAR(255),
  bulk_sales_kra_percentage INTEGER DEFAULT 100,
  whatsapp_directors JSONB DEFAULT '[]'::jsonb,
  split_denominations BOOLEAN DEFAULT true,
  loyalty_earn_type VARCHAR(20) DEFAULT 'per_amount',
  loyalty_points_per_litre NUMERIC DEFAULT 1,
  loyalty_points_per_amount NUMERIC DEFAULT 1,
  loyalty_amount_threshold NUMERIC DEFAULT 100,
  redemption_points_per_ksh NUMERIC DEFAULT 1,
  min_redemption_points NUMERIC DEFAULT 100,
  max_redemption_percent NUMERIC DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branches_user_id ON branches(user_id);
CREATE INDEX IF NOT EXISTS idx_branches_vendor_id ON branches(vendor_id);
CREATE INDEX IF NOT EXISTS idx_branches_bhf_id ON branches(bhf_id);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  vendor_id UUID REFERENCES vendors(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(50) DEFAULT 'attendant',
  attendant_code VARCHAR(50) UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  pin VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_branch_id ON staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_vendor_id ON staff(vendor_id);

-- ============================================
-- PRODUCT CATALOG TABLES
-- ============================================

-- Items table (Master catalog)
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  vendor_id UUID REFERENCES vendors(id),
  item_code VARCHAR(100),
  item_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(50),
  category VARCHAR(100),
  unit_of_measure VARCHAR(50),
  sale_price NUMERIC,
  purchase_price NUMERIC,
  tax_rate NUMERIC DEFAULT 0,
  tax_type VARCHAR(20),
  is_fuel BOOLEAN DEFAULT false,
  fuel_type VARCHAR(100),
  color_code VARCHAR(20),
  kra_item_code VARCHAR(100),
  kra_item_class VARCHAR(20),
  kra_tax_type VARCHAR(10),
  kra_packaging_unit VARCHAR(10),
  kra_quantity_unit VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, item_code),
  UNIQUE(vendor_id, item_code)
);

CREATE INDEX IF NOT EXISTS idx_items_branch_id ON items(branch_id);

-- Branch Items table (Branch-specific pricing)
CREATE TABLE IF NOT EXISTS branch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  item_id UUID NOT NULL REFERENCES items(id),
  sale_price NUMERIC NOT NULL,
  purchase_price NUMERIC,
  is_available BOOLEAN DEFAULT true,
  kra_status VARCHAR(20) DEFAULT 'pending',
  kra_response TEXT,
  kra_last_synced_at TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_branch_items_branch_id ON branch_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_items_item_id ON branch_items(item_id);
CREATE INDEX IF NOT EXISTS idx_branch_items_branch_item ON branch_items(branch_id, item_id);
CREATE INDEX IF NOT EXISTS idx_branch_items_available ON branch_items(branch_id, is_available) WHERE is_available = true;

-- ============================================
-- EQUIPMENT TABLES
-- ============================================

-- Tanks table
CREATE TABLE IF NOT EXISTS tanks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  tank_name VARCHAR(100) NOT NULL,
  fuel_type VARCHAR(100),
  item_id UUID REFERENCES items(id),
  capacity NUMERIC,
  current_volume NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tanks_branch_id ON tanks(branch_id);

-- Dispensers table
CREATE TABLE IF NOT EXISTS dispensers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  dispenser_number INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  item_id UUID REFERENCES items(id),
  tank_id UUID REFERENCES tanks(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, dispenser_number)
);

CREATE INDEX IF NOT EXISTS idx_dispensers_branch_id ON dispensers(branch_id);

-- Dispenser-Tank associations
CREATE TABLE IF NOT EXISTS dispenser_tanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispenser_id UUID NOT NULL REFERENCES dispensers(id),
  tank_id UUID NOT NULL REFERENCES tanks(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dispenser_id, tank_id)
);

CREATE INDEX IF NOT EXISTS idx_dispenser_tanks_dispenser_id ON dispenser_tanks(dispenser_id);
CREATE INDEX IF NOT EXISTS idx_dispenser_tanks_tank_id ON dispenser_tanks(tank_id);

-- Nozzles table
CREATE TABLE IF NOT EXISTS nozzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  dispenser_id UUID REFERENCES dispensers(id),
  nozzle_number INTEGER NOT NULL,
  fuel_type VARCHAR(100),
  item_id UUID REFERENCES items(id),
  current_reading NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nozzles_branch_id ON nozzles(branch_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_dispenser_id ON nozzles(dispenser_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_item_id ON nozzles(item_id);

-- Hardware table
CREATE TABLE IF NOT EXISTS hardware (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  hardware_type VARCHAR(100) NOT NULL,
  serial_number VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  assigned_date TIMESTAMPTZ,
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hardware_branch_id ON hardware(branch_id);

-- ============================================
-- SHIFT MANAGEMENT TABLES
-- ============================================

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  staff_id UUID REFERENCES staff(id),
  shift_type VARCHAR(50),
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  opening_cash NUMERIC DEFAULT 0,
  closing_cash NUMERIC,
  reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shifts_branch_id ON shifts(branch_id);
CREATE INDEX IF NOT EXISTS idx_shifts_staff_id ON shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);

-- Shift Readings table
CREATE TABLE IF NOT EXISTS shift_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  nozzle_id UUID REFERENCES nozzles(id),
  tank_id UUID REFERENCES tanks(id),
  outgoing_attendant_id UUID REFERENCES staff(id),
  incoming_attendant_id UUID REFERENCES staff(id),
  reading_type VARCHAR(50),
  opening_reading NUMERIC DEFAULT 0,
  closing_reading NUMERIC DEFAULT 0,
  difference NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shift_readings_shift_id ON shift_readings(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_readings_branch_id ON shift_readings(branch_id);

-- Attendant Collections table
CREATE TABLE IF NOT EXISTS attendant_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  staff_id UUID NOT NULL REFERENCES staff(id),
  payment_method VARCHAR(50) NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  is_app_payment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SALES TABLES
-- ============================================

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  shift_id UUID REFERENCES shifts(id),
  staff_id UUID REFERENCES staff(id),
  nozzle_id UUID REFERENCES nozzles(id),
  item_id UUID REFERENCES items(id),
  credit_note_id UUID,
  sale_date TIMESTAMPTZ DEFAULT now(),
  fuel_type VARCHAR(100),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_pin VARCHAR(50),
  vehicle_number VARCHAR(50),
  is_credit BOOLEAN DEFAULT false,
  is_loyalty_sale BOOLEAN DEFAULT false,
  loyalty_customer_name VARCHAR(255),
  loyalty_customer_pin VARCHAR(50),
  kra_invoice_number VARCHAR(100),
  kra_status VARCHAR(50) DEFAULT 'pending',
  kra_response JSONB,
  is_bulk_sale BOOLEAN DEFAULT false,
  print_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_shift_id ON sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_sales_staff_id ON sales(staff_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_kra_status ON sales(kra_status);

-- Bulk Sales table
CREATE TABLE IF NOT EXISTS bulk_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  nozzle_id UUID REFERENCES nozzles(id),
  item_id UUID REFERENCES items(id),
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
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bulk_sales_branch_id ON bulk_sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_shift_id ON bulk_sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_branch_date ON bulk_sales(branch_id, created_at DESC);

-- Credit Notes table
CREATE TABLE IF NOT EXISTS credit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  sale_id UUID,
  credit_note_number TEXT UNIQUE,
  reason TEXT NOT NULL,
  return_quantity NUMERIC,
  refund_amount NUMERIC NOT NULL,
  approval_status TEXT DEFAULT 'pending',
  approved_by TEXT,
  customer_signature TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_notes_branch_id ON credit_notes(branch_id);

-- ============================================
-- LOYALTY TABLES
-- ============================================

-- Loyalty Transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  sale_id UUID REFERENCES sales(id),
  item_id UUID REFERENCES items(id),
  customer_name VARCHAR(255),
  customer_pin VARCHAR(50),
  transaction_date TIMESTAMPTZ DEFAULT now(),
  transaction_amount NUMERIC,
  points_earned NUMERIC DEFAULT 0,
  points_redeemed NUMERIC DEFAULT 0,
  payment_method VARCHAR(50),
  fuel_type VARCHAR(100),
  quantity NUMERIC,
  transaction_type VARCHAR(20) DEFAULT 'earn',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_branch_id ON loyalty_transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_sale_id ON loyalty_transactions(sale_id);
CREATE UNIQUE INDEX IF NOT EXISTS loyalty_transactions_sale_id_unique ON loyalty_transactions(sale_id) WHERE sale_id IS NOT NULL;

-- ============================================
-- PURCHASE ORDERS TABLES
-- ============================================

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  branch_id UUID REFERENCES branches(id),
  supplier_id UUID,
  transporter_id UUID,
  po_number VARCHAR(100),
  order_date DATE DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  status VARCHAR(50) DEFAULT 'draft',
  total_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(vendor_id, po_number)
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_branch_id ON purchase_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  item_id UUID REFERENCES items(id),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase Order Acceptances table
CREATE TABLE IF NOT EXISTS purchase_order_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  branch_id UUID REFERENCES branches(id),
  accepted_by UUID REFERENCES users(id),
  bowser_volume NUMERIC,
  dips_mm NUMERIC,
  total_variance NUMERIC,
  remarks TEXT,
  acceptance_timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PO Acceptance Tank Readings
CREATE TABLE IF NOT EXISTS po_acceptance_tank_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acceptance_id UUID NOT NULL REFERENCES purchase_order_acceptances(id),
  tank_id UUID REFERENCES tanks(id),
  volume_before NUMERIC DEFAULT 0,
  volume_after NUMERIC DEFAULT 0,
  dip_before NUMERIC,
  dip_after NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PO Acceptance Dispenser Readings
CREATE TABLE IF NOT EXISTS po_acceptance_dispenser_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acceptance_id UUID NOT NULL REFERENCES purchase_order_acceptances(id),
  dispenser_id UUID REFERENCES dispensers(id),
  meter_reading_before NUMERIC DEFAULT 0,
  meter_reading_after NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PO Acceptance Nozzle Readings
CREATE TABLE IF NOT EXISTS po_acceptance_nozzle_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acceptance_id UUID NOT NULL REFERENCES purchase_order_acceptances(id),
  nozzle_id UUID REFERENCES nozzles(id),
  meter_reading_before NUMERIC DEFAULT 0,
  meter_reading_after NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_nozzle_readings_acceptance ON po_acceptance_nozzle_readings(acceptance_id);
CREATE INDEX IF NOT EXISTS idx_po_nozzle_readings_nozzle ON po_acceptance_nozzle_readings(nozzle_id);

-- Vendor PO Sequences
CREATE TABLE IF NOT EXISTS vendor_po_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) UNIQUE,
  next_po_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CUSTOMERS & CRM TABLES
-- ============================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  cust_tin TEXT,
  cust_no TEXT,
  cust_nm TEXT NOT NULL,
  adrs TEXT,
  tel_no TEXT,
  email TEXT,
  fax_no TEXT,
  use_yn TEXT DEFAULT 'Y',
  remark TEXT,
  regr_nm TEXT,
  regr_id TEXT,
  modr_nm TEXT,
  modr_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);

-- Customer Branches (multi-branch customer linking)
CREATE TABLE IF NOT EXISTS customer_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  vendor_id UUID,
  status VARCHAR(50) DEFAULT 'active',
  linked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_branches_customer ON customer_branches(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_branches_branch ON customer_branches(branch_id);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  kra_pin VARCHAR(50),
  address TEXT,
  county VARCHAR(100),
  stage VARCHAR(50) DEFAULT 'contact',
  status VARCHAR(50) DEFAULT 'active',
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  next_follow_up DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACCOUNTING TABLES
-- ============================================

-- Expense Accounts table
CREATE TABLE IF NOT EXISTS expense_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  account_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(vendor_id, account_name)
);

CREATE INDEX IF NOT EXISTS idx_expense_accounts_vendor ON expense_accounts(vendor_id);

-- Banking Accounts table
CREATE TABLE IF NOT EXISTS banking_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  account_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(100),
  bank_name VARCHAR(255),
  branch_name VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banking_accounts_vendor ON banking_accounts(vendor_id);

-- Shift Expenses table
CREATE TABLE IF NOT EXISTS shift_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  expense_account_id UUID REFERENCES expense_accounts(id),
  amount NUMERIC NOT NULL,
  description TEXT,
  receipt_number VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shift Banking table
CREATE TABLE IF NOT EXISTS shift_banking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id),
  banking_account_id UUID REFERENCES banking_accounts(id),
  amount NUMERIC NOT NULL,
  reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Credit Payments table
CREATE TABLE IF NOT EXISTS credit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  vendor_id UUID REFERENCES vendors(id),
  credit_type VARCHAR(50) NOT NULL,
  source_id UUID NOT NULL,
  source_date DATE NOT NULL,
  credit_amount NUMERIC NOT NULL,
  payment_amount NUMERIC NOT NULL,
  payment_reference VARCHAR(255),
  payment_notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- KRA INTEGRATION TABLES
-- ============================================

-- Device Initialization table
CREATE TABLE IF NOT EXISTS device_initialization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  dvc_srl_no TEXT,
  dvc_id TEXT,
  intrl_key TEXT,
  sign_key TEXT,
  cmc_key TEXT,
  mrc_no TEXT,
  sdc_id TEXT,
  taxpr_nm TEXT,
  bsns_actv TEXT,
  bhf_nm TEXT,
  bhf_open_dt TEXT,
  prvnc_nm TEXT,
  dstrt_nm TEXT,
  sctr_nm TEXT,
  loc_desc TEXT,
  hq_yn TEXT,
  mgr_nm TEXT,
  mgr_tel_no TEXT,
  mgr_email TEXT,
  vat_ty_cd TEXT,
  last_invc_no INTEGER DEFAULT 0,
  last_sale_invc_no INTEGER DEFAULT 0,
  last_train_invc_no INTEGER DEFAULT 0,
  last_profrm_invc_no INTEGER DEFAULT 0,
  last_copy_invc_no INTEGER DEFAULT 0,
  last_sale_rcpt_no INTEGER DEFAULT 0,
  last_pchs_invc_no INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_initialization_branch_id ON device_initialization(branch_id);

-- Branch KRA Counters table
CREATE TABLE IF NOT EXISTS branch_kra_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  endpoint TEXT NOT NULL,
  current_sar_no INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(branch_id, endpoint)
);

-- Branch Logs table (KRA request/response logging)
CREATE TABLE IF NOT EXISTS branch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id),
  log_type VARCHAR(50) NOT NULL,
  endpoint TEXT,
  request_payload JSONB,
  response_payload JSONB,
  status VARCHAR(20),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_branch_logs_branch_id ON branch_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_logs_created_at ON branch_logs(created_at DESC);

-- KRA Codelists table
CREATE TABLE IF NOT EXISTS kra_codelists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bhf_id TEXT,
  cd_cls TEXT,
  cd TEXT,
  cd_nm TEXT,
  user_dfn_cd1 TEXT,
  user_dfn_cd2 TEXT,
  user_dfn_cd3 TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bhf_id, cd_cls, cd)
);

CREATE INDEX IF NOT EXISTS idx_kra_codelists_bhf_id ON kra_codelists(bhf_id);

-- KRA Item Classifications table
CREATE TABLE IF NOT EXISTS kra_item_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bhf_id TEXT,
  item_cls_cd TEXT,
  item_cls_nm TEXT,
  item_cls_lvl INTEGER,
  tax_ty_cd TEXT,
  mjr_tg_yn TEXT,
  use_yn TEXT DEFAULT 'Y',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bhf_id, item_cls_cd)
);

CREATE INDEX IF NOT EXISTS idx_kra_item_classifications_bhf_id ON kra_item_classifications(bhf_id);

-- Branch Insurances table
CREATE TABLE IF NOT EXISTS branch_insurances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  isrcc_cd TEXT,
  isrcc_nm TEXT,
  isrc_rt NUMERIC,
  use_yn TEXT DEFAULT 'Y',
  regr_nm TEXT,
  regr_id TEXT,
  modr_nm TEXT,
  modr_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Branch Users table (KRA users)
CREATE TABLE IF NOT EXISTS branch_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  user_id_text TEXT,
  user_nm TEXT,
  pwd TEXT,
  adrs TEXT,
  cntc TEXT,
  auth_cd TEXT,
  remark TEXT,
  use_yn TEXT DEFAULT 'Y',
  regr_nm TEXT,
  regr_id TEXT,
  modr_nm TEXT,
  modr_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Imported Items table
CREATE TABLE IF NOT EXISTS imported_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  task_cd TEXT,
  dcl_de TEXT,
  item_seq INTEGER,
  hs_cd TEXT,
  item_cls_cd TEXT,
  item_cd TEXT,
  impt_item_stts_cd TEXT,
  remark TEXT,
  modr_nm TEXT,
  modr_id TEXT,
  last_req_dt TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PTS INTEGRATION TABLES
-- ============================================

-- Pump Callback Events table
CREATE TABLE IF NOT EXISTS pump_callback_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pts_id VARCHAR(100),
  event_type VARCHAR(50),
  raw_payload JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pump_callback_events_pts ON pump_callback_events(pts_id);
CREATE INDEX IF NOT EXISTS idx_pump_callback_events_created ON pump_callback_events(created_at DESC);

-- Pump Transactions table
CREATE TABLE IF NOT EXISTS pump_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pts_id VARCHAR(100),
  transaction_id VARCHAR(100),
  callback_event_id UUID REFERENCES pump_callback_events(id),
  pump_number INTEGER,
  nozzle_number INTEGER,
  fuel_grade_id VARCHAR(50),
  volume NUMERIC,
  unit_price NUMERIC,
  total_amount NUMERIC,
  transaction_time TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pts_id, transaction_id)
);

-- Pump Fuel Grade Mappings table
CREATE TABLE IF NOT EXISTS pump_fuel_grade_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pts_id VARCHAR(100),
  fuel_grade_id VARCHAR(50),
  item_id UUID REFERENCES items(id),
  fuel_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pts_id, fuel_grade_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS pump_fuel_grade_mappings_global_idx ON pump_fuel_grade_mappings(fuel_grade_id) WHERE pts_id IS NULL;

-- ============================================
-- LOGGING & AUDIT TABLES
-- ============================================

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  branch_id VARCHAR(255),
  branch_name VARCHAR(255),
  vendor_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_branch_id ON activity_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_vendor_id ON activity_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- API Logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  payload JSONB,
  response JSONB,
  status_code INTEGER,
  duration_ms INTEGER,
  error TEXT,
  external_endpoint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_branch_id ON api_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

-- Printer Logs table
CREATE TABLE IF NOT EXISTS printer_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  print_type VARCHAR(50),
  document_id VARCHAR(255),
  status VARCHAR(50),
  error_message TEXT,
  printer_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_printer_logs_branch_id ON printer_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_printer_logs_created_at ON printer_logs(created_at DESC);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  vendor_id UUID,
  branch_id UUID,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  notice_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notices_branch_id ON notices(branch_id);

-- Password Reset Tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INVOICING TABLES
-- ============================================

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  branch_id UUID REFERENCES branches(id),
  created_by UUID REFERENCES users(id),
  parent_invoice_id UUID REFERENCES invoices(id),
  invoice_number VARCHAR(100) UNIQUE,
  invoice_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  subtotal NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_interval VARCHAR(50),
  next_invoice_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_vendor_id ON invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_recurring ON invoices(is_recurring) WHERE is_recurring = true;
CREATE INDEX IF NOT EXISTS idx_invoices_next_date ON invoices(next_invoice_date) WHERE next_invoice_date IS NOT NULL;

-- Invoice Line Items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  description TEXT,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_line_items(invoice_id);

-- Invoice Branches table
CREATE TABLE IF NOT EXISTS invoice_branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(invoice_id, branch_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id),
  created_by UUID REFERENCES users(id),
  amount NUMERIC NOT NULL,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  payment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Payment Transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id),
  vendor_id UUID REFERENCES vendors(id),
  amount NUMERIC NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_reference VARCHAR(255),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- BILLING TABLES
-- ============================================

-- Billing Products table
CREATE TABLE IF NOT EXISTS billing_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  product_type VARCHAR(50) NOT NULL,
  default_amount NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Billing Rates table
CREATE TABLE IF NOT EXISTS billing_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  rate_type VARCHAR(50) NOT NULL,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SUPPORT TABLES
-- ============================================

-- Ticket Categories table
CREATE TABLE IF NOT EXISTS ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  branch_id UUID,
  user_id UUID,
  category_id UUID REFERENCES ticket_categories(id),
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ticket Messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id),
  user_id UUID,
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STOCK MANAGEMENT TABLES
-- ============================================

-- Stock Master table
CREATE TABLE IF NOT EXISTS stock_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  item_id UUID,
  current_quantity NUMERIC DEFAULT 0,
  reorder_level NUMERIC,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stock Movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  movement_type VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  movement_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stock Movement Items table
CREATE TABLE IF NOT EXISTS stock_movement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_movement_id UUID NOT NULL REFERENCES stock_movements(id),
  item_id UUID,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stock Adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  tank_id UUID REFERENCES tanks(id),
  adjustment_type VARCHAR(50),
  quantity NUMERIC NOT NULL,
  reason TEXT,
  adjusted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stock Transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_branch_id UUID,
  to_branch_id UUID REFERENCES branches(id),
  from_tank_id UUID REFERENCES tanks(id),
  to_tank_id UUID REFERENCES tanks(id),
  quantity NUMERIC NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  transfer_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SALES TRANSACTIONS TABLES (Legacy/Alternative)
-- ============================================

-- Sales Transactions table
CREATE TABLE IF NOT EXISTS sales_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  transaction_date TIMESTAMPTZ DEFAULT now(),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  total_amount NUMERIC DEFAULT 0,
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sales Transaction Items table
CREATE TABLE IF NOT EXISTS sales_transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_transaction_id UUID NOT NULL REFERENCES sales_transactions(id),
  item_id UUID,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sales Receipts table
CREATE TABLE IF NOT EXISTS sales_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_transaction_id UUID REFERENCES sales_transactions(id),
  receipt_number VARCHAR(100),
  receipt_data JSONB,
  printed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase Transactions table
CREATE TABLE IF NOT EXISTS purchase_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  supplier_name VARCHAR(255),
  transaction_date DATE DEFAULT CURRENT_DATE,
  total_amount NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase Transaction Items table
CREATE TABLE IF NOT EXISTS purchase_transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_transaction_id UUID NOT NULL REFERENCES purchase_transactions(id),
  item_id UUID,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MISCELLANEOUS TABLES
-- ============================================

-- Sales People table
CREATE TABLE IF NOT EXISTS sales_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Item Compositions table
CREATE TABLE IF NOT EXISTS item_compositions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_item_id UUID REFERENCES items(id),
  composite_item_id UUID REFERENCES items(id),
  quantity NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Onboarding Requests table
CREATE TABLE IF NOT EXISTS onboarding_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id),
  merchant_id UUID,
  status VARCHAR(50) DEFAULT 'pending',
  request_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendor Partners table
CREATE TABLE IF NOT EXISTS vendor_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID,
  partner_type VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FOREIGN KEY ADDITIONS (for self-references)
-- ============================================

ALTER TABLE sales ADD CONSTRAINT fk_sales_credit_note 
  FOREIGN KEY (credit_note_id) REFERENCES credit_notes(id);

ALTER TABLE credit_notes ADD CONSTRAINT fk_credit_notes_sale 
  FOREIGN KEY (sale_id) REFERENCES sales(id);

-- ============================================
-- END OF MIGRATION
-- ============================================
