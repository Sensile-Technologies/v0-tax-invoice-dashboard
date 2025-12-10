-- =====================================================
-- Flow360 Tax Invoice Dashboard - Database Schema
-- =====================================================
-- Complete database schema with tables, relationships, 
-- indexes, RLS policies, and sample data
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  username TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  bhf_id TEXT UNIQUE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(50),
  role VARCHAR(50) DEFAULT 'attendant',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FUEL MANAGEMENT TABLES
-- =====================================================

-- Tanks table
CREATE TABLE IF NOT EXISTS tanks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tank_name TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  capacity NUMERIC(10, 2) NOT NULL,
  current_stock NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispensers table
CREATE TABLE IF NOT EXISTS dispensers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  dispenser_number INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(branch_id, dispenser_number)
);

-- Nozzles table
CREATE TABLE IF NOT EXISTS nozzles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  dispenser_id UUID REFERENCES dispensers(id) ON DELETE CASCADE,
  nozzle_number INTEGER NOT NULL,
  fuel_type TEXT NOT NULL,
  initial_meter_reading NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fuel Prices table
CREATE TABLE IF NOT EXISTS fuel_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  fuel_type TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SALES AND SHIFT MANAGEMENT
-- =====================================================

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  opening_cash NUMERIC(10, 2) DEFAULT 0,
  closing_cash NUMERIC(10, 2),
  total_sales NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  nozzle_id UUID REFERENCES nozzles(id) ON DELETE SET NULL,
  credit_note_id UUID REFERENCES credit_notes(id) ON DELETE SET NULL,
  invoice_number TEXT,
  receipt_number TEXT,
  sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fuel_type TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  customer_name TEXT,
  customer_pin TEXT,
  vehicle_number TEXT,
  meter_reading_after NUMERIC(10, 2),
  is_loyalty_sale BOOLEAN DEFAULT FALSE,
  loyalty_customer_name TEXT,
  loyalty_customer_pin TEXT,
  loyalty_points_earned NUMERIC(10, 2) DEFAULT 0,
  transmission_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMER AND LOYALTY MANAGEMENT
-- =====================================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty Transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_pin TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_amount NUMERIC(10, 2) NOT NULL,
  points_earned NUMERIC(10, 2) NOT NULL,
  payment_method TEXT,
  fuel_type TEXT,
  quantity NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY AND ITEMS
-- =====================================================

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  item_code TEXT UNIQUE,
  sku TEXT,
  item_name TEXT NOT NULL,
  description TEXT,
  item_type TEXT,
  class_code TEXT,
  tax_type TEXT,
  origin TEXT,
  batch_number TEXT,
  purchase_price NUMERIC(10, 2),
  sale_price NUMERIC(10, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item Compositions table
CREATE TABLE IF NOT EXISTS item_compositions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  composite_item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  percentage NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STOCK MANAGEMENT
-- =====================================================

-- Stock Adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tank_id UUID REFERENCES tanks(id) ON DELETE CASCADE,
  adjustment_type TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  previous_stock NUMERIC(10, 2) NOT NULL,
  new_stock NUMERIC(10, 2) NOT NULL,
  reason TEXT,
  requested_by TEXT,
  approved_by TEXT,
  approval_status TEXT DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Transfers table
CREATE TABLE IF NOT EXISTS stock_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  to_branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  from_tank_id UUID REFERENCES tanks(id) ON DELETE SET NULL,
  to_tank_id UUID REFERENCES tanks(id) ON DELETE SET NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approval_status TEXT DEFAULT 'pending',
  requested_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit Notes table
CREATE TABLE IF NOT EXISTS credit_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  credit_note_number TEXT UNIQUE,
  reason TEXT NOT NULL,
  return_quantity NUMERIC(10, 2),
  refund_amount NUMERIC(10, 2) NOT NULL,
  approval_status TEXT DEFAULT 'pending',
  approved_by TEXT,
  customer_signature TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HARDWARE AND DEVICES
-- =====================================================

-- Hardware table
CREATE TABLE IF NOT EXISTS hardware (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  hardware_type VARCHAR(100) NOT NULL,
  serial_number VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  assigned_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- KRA TIMS INTEGRATION TABLES
-- =====================================================

-- Device Initialization table
CREATE TABLE IF NOT EXISTS device_initialization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code Lists table
CREATE TABLE IF NOT EXISTS code_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cd_cls TEXT NOT NULL,
  cd TEXT NOT NULL,
  cd_nm TEXT,
  cd_desc TEXT,
  use_yn TEXT DEFAULT 'Y',
  user_dfn_cd1 TEXT,
  user_dfn_cd2 TEXT,
  user_dfn_cd3 TEXT,
  last_req_dt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Item Classifications table
CREATE TABLE IF NOT EXISTS item_classifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_cls_cd TEXT UNIQUE NOT NULL,
  item_cls_nm TEXT NOT NULL,
  item_cls_lvl INTEGER,
  tax_ty_cd TEXT,
  mjr_tg_yn TEXT DEFAULT 'N',
  use_yn TEXT DEFAULT 'Y',
  last_req_dt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tin TEXT,
  bhf_id TEXT,
  notce_no INTEGER,
  title TEXT,
  cont TEXT,
  dtl_url TEXT,
  remark TEXT,
  last_req_dt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Insurances table
CREATE TABLE IF NOT EXISTS branch_insurances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  isrcc_cd TEXT,
  isrcc_nm TEXT,
  isrc_rt NUMERIC(5, 2),
  use_yn TEXT DEFAULT 'Y',
  regr_nm TEXT,
  regr_id TEXT,
  modr_nm TEXT,
  modr_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branch Users table (KRA)
CREATE TABLE IF NOT EXISTS branch_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Imported Items table
CREATE TABLE IF NOT EXISTS imported_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
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
  last_req_dt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Master table
CREATE TABLE IF NOT EXISTS stock_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  item_cd TEXT NOT NULL,
  rsd_qty NUMERIC(10, 2),
  regr_nm TEXT,
  regr_id TEXT,
  modr_nm TEXT,
  modr_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRANSACTION TABLES (KRA TIMS)
-- =====================================================

-- Sales Transactions table
CREATE TABLE IF NOT EXISTS sales_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  invc_no INTEGER,
  org_invc_no INTEGER,
  cust_tin TEXT,
  cust_nm TEXT,
  sales_ty_cd TEXT,
  rcpt_ty_cd TEXT,
  pmt_ty_cd TEXT,
  sales_stts_cd TEXT,
  cfm_dt TIMESTAMP WITH TIME ZONE,
  sales_dt DATE,
  stock_rls_dt TIMESTAMP WITH TIME ZONE,
  cncl_req_dt DATE,
  cncl_dt DATE,
  rfd_dt DATE,
  rfd_rsn_cd TEXT,
  tot_item_cnt INTEGER,
  taxbl_amt_a NUMERIC(10, 2),
  taxbl_amt_b NUMERIC(10, 2),
  taxbl_amt_c NUMERIC(10, 2),
  taxbl_amt_d NUMERIC(10, 2),
  taxbl_amt_e NUMERIC(10, 2),
  tax_rt_a NUMERIC(5, 2),
  tax_rt_b NUMERIC(5, 2),
  tax_rt_c NUMERIC(5, 2),
  tax_rt_d NUMERIC(5, 2),
  tax_rt_e NUMERIC(5, 2),
  tax_amt_a NUMERIC(10, 2),
  tax_amt_b NUMERIC(10, 2),
  tax_amt_c NUMERIC(10, 2),
  tax_amt_d NUMERIC(10, 2),
  tax_amt_e NUMERIC(10, 2),
  tot_taxbl_amt NUMERIC(10, 2),
  tot_tax_amt NUMERIC(10, 2),
  tot_amt NUMERIC(10, 2),
  prchr_acptc_yn TEXT,
  remark TEXT,
  regr_id TEXT,
  regr_nm TEXT,
  modr_id TEXT,
  modr_nm TEXT,
  trd_invc_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Transaction Items table
CREATE TABLE IF NOT EXISTS sales_transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_transaction_id UUID REFERENCES sales_transactions(id) ON DELETE CASCADE,
  item_seq INTEGER,
  item_cd TEXT,
  item_cls_cd TEXT,
  item_nm TEXT,
  bcd TEXT,
  pkg_unit_cd TEXT,
  pkg NUMERIC(10, 2),
  qty_unit_cd TEXT,
  qty NUMERIC(10, 2),
  prc NUMERIC(10, 2),
  sply_amt NUMERIC(10, 2),
  dc_rt NUMERIC(5, 2),
  dc_amt NUMERIC(10, 2),
  tax_ty_cd TEXT,
  taxbl_amt NUMERIC(10, 2),
  tax_amt NUMERIC(10, 2),
  tot_amt NUMERIC(10, 2),
  isrcc_cd TEXT,
  isrcc_nm TEXT,
  isrc_rt NUMERIC(5, 2),
  isrc_amt NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Receipts table
CREATE TABLE IF NOT EXISTS sales_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_transaction_id UUID REFERENCES sales_transactions(id) ON DELETE CASCADE,
  cust_tin TEXT,
  cust_mbl_no TEXT,
  rpt_no INTEGER,
  trde_nm TEXT,
  adrs TEXT,
  top_msg TEXT,
  btm_msg TEXT,
  prchr_acptc_yn TEXT,
  rcpt_pbct_dt TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Transactions table
CREATE TABLE IF NOT EXISTS purchase_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  invc_no INTEGER,
  org_invc_no INTEGER,
  spplr_tin TEXT,
  spplr_bhf_id TEXT,
  spplr_nm TEXT,
  spplr_invc_no TEXT,
  reg_ty_cd TEXT,
  pchs_ty_cd TEXT,
  rcpt_ty_cd TEXT,
  pmt_ty_cd TEXT,
  pchs_stts_cd TEXT,
  cfm_dt TIMESTAMP WITH TIME ZONE,
  pchs_dt DATE,
  wrhs_dt DATE,
  cncl_req_dt DATE,
  cncl_dt DATE,
  rfd_dt DATE,
  tot_item_cnt INTEGER,
  taxbl_amt_a NUMERIC(10, 2),
  taxbl_amt_b NUMERIC(10, 2),
  taxbl_amt_c NUMERIC(10, 2),
  taxbl_amt_d NUMERIC(10, 2),
  taxbl_amt_e NUMERIC(10, 2),
  tax_rt_a NUMERIC(5, 2),
  tax_rt_b NUMERIC(5, 2),
  tax_rt_c NUMERIC(5, 2),
  tax_rt_d NUMERIC(5, 2),
  tax_rt_e NUMERIC(5, 2),
  tax_amt_a NUMERIC(10, 2),
  tax_amt_b NUMERIC(10, 2),
  tax_amt_c NUMERIC(10, 2),
  tax_amt_d NUMERIC(10, 2),
  tax_amt_e NUMERIC(10, 2),
  tot_taxbl_amt NUMERIC(10, 2),
  tot_tax_amt NUMERIC(10, 2),
  tot_amt NUMERIC(10, 2),
  remark TEXT,
  regr_id TEXT,
  regr_nm TEXT,
  modr_id TEXT,
  modr_nm TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Transaction Items table
CREATE TABLE IF NOT EXISTS purchase_transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_transaction_id UUID REFERENCES purchase_transactions(id) ON DELETE CASCADE,
  item_seq INTEGER,
  item_cd TEXT,
  item_cls_cd TEXT,
  item_nm TEXT,
  bcd TEXT,
  spplr_item_cls_cd TEXT,
  spplr_item_cd TEXT,
  spplr_item_nm TEXT,
  pkg_unit_cd TEXT,
  pkg NUMERIC(10, 2),
  qty_unit_cd TEXT,
  qty NUMERIC(10, 2),
  prc NUMERIC(10, 2),
  sply_amt NUMERIC(10, 2),
  dc_rt NUMERIC(5, 2),
  dc_amt NUMERIC(10, 2),
  tax_ty_cd TEXT,
  taxbl_amt NUMERIC(10, 2),
  tax_amt NUMERIC(10, 2),
  tot_amt NUMERIC(10, 2),
  item_expr_dt DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  tin TEXT NOT NULL,
  bhf_id TEXT NOT NULL,
  sar_no INTEGER,
  org_sar_no INTEGER,
  reg_ty_cd TEXT,
  cust_tin TEXT,
  cust_bhf_id TEXT,
  cust_nm TEXT,
  sar_ty_cd TEXT,
  ocrn_dt DATE,
  tot_item_cnt INTEGER,
  tot_taxbl_amt NUMERIC(10, 2),
  tot_tax_amt NUMERIC(10, 2),
  tot_amt NUMERIC(10, 2),
  remark TEXT,
  regr_id TEXT,
  regr_nm TEXT,
  modr_id TEXT,
  modr_nm TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movement Items table
CREATE TABLE IF NOT EXISTS stock_movement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stock_movement_id UUID REFERENCES stock_movements(id) ON DELETE CASCADE,
  item_seq INTEGER,
  item_cd TEXT,
  item_cls_cd TEXT,
  item_nm TEXT,
  bcd TEXT,
  pkg_unit_cd TEXT,
  pkg NUMERIC(10, 2),
  qty_unit_cd TEXT,
  qty NUMERIC(10, 2),
  item_expr_dt DATE,
  prc NUMERIC(10, 2),
  sply_amt NUMERIC(10, 2),
  tot_dc_amt NUMERIC(10, 2),
  taxbl_amt NUMERIC(10, 2),
  tax_ty_cd TEXT,
  tax_amt NUMERIC(10, 2),
  tot_amt NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- API LOGGING
-- =====================================================

-- API Logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  payload JSONB,
  response JSONB,
  status_code INTEGER,
  duration_ms INTEGER,
  error TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Branch indexes
CREATE INDEX IF NOT EXISTS idx_branches_bhf_id ON branches(bhf_id);
CREATE INDEX IF NOT EXISTS idx_branches_user_id ON branches(user_id);
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_branch ON staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);

-- Tank indexes
CREATE INDEX IF NOT EXISTS idx_tanks_branch ON tanks(branch_id);
CREATE INDEX IF NOT EXISTS idx_tanks_fuel_type ON tanks(fuel_type);

-- Dispenser indexes
CREATE INDEX IF NOT EXISTS idx_dispensers_branch ON dispensers(branch_id);
CREATE INDEX IF NOT EXISTS idx_dispensers_fuel_type ON dispensers(fuel_type);

-- Nozzle indexes
CREATE INDEX IF NOT EXISTS idx_nozzles_branch ON nozzles(branch_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_dispenser ON nozzles(dispenser_id);

-- Fuel price indexes
CREATE INDEX IF NOT EXISTS idx_fuel_prices_branch ON fuel_prices(branch_id);
CREATE INDEX IF NOT EXISTS idx_fuel_prices_fuel_type ON fuel_prices(fuel_type);
CREATE INDEX IF NOT EXISTS idx_fuel_prices_date ON fuel_prices(effective_date DESC);

-- Shift indexes
CREATE INDEX IF NOT EXISTS idx_shifts_branch ON shifts(branch_id);
CREATE INDEX IF NOT EXISTS idx_shifts_staff ON shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_start_time ON shifts(start_time DESC);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_branch ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_shift ON sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales(staff_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_fuel_type ON sales(fuel_type);
CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_sales_loyalty ON sales(is_loyalty_sale) WHERE is_loyalty_sale = TRUE;

-- Customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_branch ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_tin ON customers(cust_tin);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(cust_nm);

-- Loyalty transaction indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_branch ON loyalty_transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON loyalty_transactions(customer_name);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_date ON loyalty_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_sale ON loyalty_transactions(sale_id);

-- Item indexes
CREATE INDEX IF NOT EXISTS idx_items_branch ON items(branch_id);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(item_code);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(item_type);

-- API log indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_branch ON api_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nozzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_initialization ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_select_own" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_own" ON users FOR DELETE USING (true);

-- Branches policies
CREATE POLICY "Anyone can view branches" ON branches FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on branches" ON branches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on branches" ON branches FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes on branches" ON branches FOR DELETE USING (true);

-- Staff policies
CREATE POLICY "Staff can view their own data" ON staff FOR SELECT USING (true);
CREATE POLICY "Directors can view all staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Directors can insert staff" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Directors can update staff" ON staff FOR UPDATE USING (true);

-- General "Allow all" policies for operational tables
CREATE POLICY "Allow all on tanks" ON tanks FOR ALL USING (true);
CREATE POLICY "Allow all on dispensers" ON dispensers FOR ALL USING (true);
CREATE POLICY "Allow all on nozzles" ON nozzles FOR ALL USING (true);
CREATE POLICY "Allow all on fuel_prices" ON fuel_prices FOR ALL USING (true);
CREATE POLICY "Allow all on shifts" ON shifts FOR ALL USING (true);
CREATE POLICY "Allow all on sales" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all on loyalty_transactions" ON loyalty_transactions FOR ALL USING (true);
CREATE POLICY "Allow all on items" ON items FOR ALL USING (true);
CREATE POLICY "Allow all on item_compositions" ON item_compositions FOR ALL USING (true);
CREATE POLICY "Allow all on stock_adjustments" ON stock_adjustments FOR ALL USING (true);
CREATE POLICY "Allow all on stock_transfers" ON stock_transfers FOR ALL USING (true);
CREATE POLICY "Allow all on credit_notes" ON credit_notes FOR ALL USING (true);
CREATE POLICY "Allow all on hardware" ON hardware FOR ALL USING (true);
CREATE POLICY "Allow all on device_initialization" ON device_initialization FOR ALL USING (true);
CREATE POLICY "Allow all on code_lists" ON code_lists FOR ALL USING (true);
CREATE POLICY "Allow all on item_classifications" ON item_classifications FOR ALL USING (true);
CREATE POLICY "Allow all on notices" ON notices FOR ALL USING (true);
CREATE POLICY "Allow all on branch_insurances" ON branch_insurances FOR ALL USING (true);
CREATE POLICY "Allow all on branch_users" ON branch_users FOR ALL USING (true);
CREATE POLICY "Allow all on imported_items" ON imported_items FOR ALL USING (true);
CREATE POLICY "Allow all on stock_master" ON stock_master FOR ALL USING (true);
CREATE POLICY "Allow all on sales_transactions" ON sales_transactions FOR ALL USING (true);
CREATE POLICY "Allow all on sales_transaction_items" ON sales_transaction_items FOR ALL USING (true);
CREATE POLICY "Allow all on sales_receipts" ON sales_receipts FOR ALL USING (true);
CREATE POLICY "Allow all on purchase_transactions" ON purchase_transactions FOR ALL USING (true);
CREATE POLICY "Allow all on purchase_transaction_items" ON purchase_transaction_items FOR ALL USING (true);
CREATE POLICY "Allow all on stock_movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Allow all on stock_movement_items" ON stock_movement_items FOR ALL USING (true);
CREATE POLICY "Allow all on api_logs" ON api_logs FOR ALL USING (true);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample user
INSERT INTO users (email, username, phone_number)
VALUES 
  ('admin@flow360.com', 'admin', '+254700000000'),
  ('manager@flow360.com', 'manager', '+254700000001')
ON CONFLICT (email) DO NOTHING;

-- Insert sample branches
INSERT INTO branches (name, bhf_id, location, address, county, manager, email, phone, status)
VALUES 
  ('Thika Greens', '00', 'Thika Road', 'Thika, Kenya', 'Kiambu', 'John Doe', 'thika@flow360.com', '+254712345678', 'active'),
  ('Wanag Kisaju', '01', 'Namanga Road', 'Kisaju, Kenya', 'Kajiado', 'Jane Smith', 'kisaju@flow360.com', '+254712345679', 'active'),
  ('Reem Kitengela', '02', 'Namanga Road', 'Kitengela, Kenya', 'Kajiado', 'Bob Johnson', 'kitengela@flow360.com', '+254712345680', 'active')
ON CONFLICT DO NOTHING;

-- Get branch IDs for sample data
DO $$
DECLARE
  thika_id UUID;
  wanag_id UUID;
  reem_id UUID;
BEGIN
  SELECT id INTO thika_id FROM branches WHERE name = 'Thika Greens' LIMIT 1;
  SELECT id INTO wanag_id FROM branches WHERE name = 'Wanag Kisaju' LIMIT 1;
  SELECT id INTO reem_id FROM branches WHERE name = 'Reem Kitengela' LIMIT 1;

  -- Insert sample staff
  INSERT INTO staff (branch_id, username, full_name, email, phone_number, role, status)
  VALUES 
    (thika_id, 'attendant1', 'Michael Omondi', 'michael@flow360.com', '+254722111111', 'attendant', 'active'),
    (thika_id, 'attendant2', 'Sarah Wanjiku', 'sarah@flow360.com', '+254722222222', 'attendant', 'active'),
    (wanag_id, 'attendant3', 'David Kipchoge', 'david@flow360.com', '+254722333333', 'attendant', 'active')
  ON CONFLICT (username) DO NOTHING;

  -- Insert sample tanks
  INSERT INTO tanks (branch_id, tank_name, fuel_type, capacity, current_stock, status)
  VALUES 
    (thika_id, 'Tank 1', 'Diesel', 50000.00, 35000.00, 'active'),
    (thika_id, 'Tank 2', 'Petrol', 40000.00, 28000.00, 'active'),
    (wanag_id, 'Tank 1', 'Diesel', 45000.00, 32000.00, 'active'),
    (wanag_id, 'Tank 2', 'Petrol', 35000.00, 25000.00, 'active')
  ON CONFLICT DO NOTHING;

  -- Insert sample dispensers
  INSERT INTO dispensers (branch_id, dispenser_number, fuel_type, status)
  VALUES 
    (thika_id, 1, 'Diesel', 'active'),
    (thika_id, 2, 'Diesel', 'active'),
    (thika_id, 3, 'Petrol', 'active'),
    (thika_id, 4, 'Petrol', 'active')
  ON CONFLICT DO NOTHING;

  -- Insert sample fuel prices
  INSERT INTO fuel_prices (branch_id, fuel_type, price, effective_date)
  VALUES 
    (thika_id, 'Diesel', 150.50, NOW()),
    (thika_id, 'Petrol', 165.00, NOW()),
    (wanag_id, 'Diesel', 151.00, NOW()),
    (wanag_id, 'Petrol', 166.00, NOW())
  ON CONFLICT DO NOTHING;

  -- Insert sample customers
  INSERT INTO customers (branch_id, tin, bhf_id, cust_tin, cust_nm, tel_no, email)
  VALUES 
    (thika_id, 'P051234567M', '00', 'A001234567Z', 'John Mwangi', '+254700111111', 'john@example.com'),
    (thika_id, 'P051234567M', '00', 'A001234568Z', 'Mary Akinyi', '+254700222222', 'mary@example.com'),
    (wanag_id, 'P051234568M', '01', 'A001234569Z', 'Peter Kamau', '+254700333333', 'peter@example.com')
  ON CONFLICT DO NOTHING;

  -- Insert sample items
  INSERT INTO items (branch_id, item_code, item_name, description, item_type, sale_price, purchase_price, status)
  VALUES 
    (thika_id, 'ITM001', 'Engine Oil 5W-30', '5 Liter Engine Oil', 'product', 2500.00, 2000.00, 'active'),
    (thika_id, 'ITM002', 'Brake Fluid DOT 4', '500ml Brake Fluid', 'product', 800.00, 600.00, 'active'),
    (thika_id, 'ITM003', 'Car Wash Service', 'Full car wash', 'service', 500.00, 300.00, 'active')
  ON CONFLICT DO NOTHING;

END $$;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tanks_updated_at BEFORE UPDATE ON tanks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dispensers_updated_at BEFORE UPDATE ON dispensers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nozzles_updated_at BEFORE UPDATE ON nozzles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fuel_prices_updated_at BEFORE UPDATE ON fuel_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_transactions_updated_at BEFORE UPDATE ON loyalty_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Flow360 Tax Invoice Dashboard schema created successfully!';
  RAISE NOTICE 'Total tables: 34';
  RAISE NOTICE 'Sample data inserted for 3 branches';
END $$;
