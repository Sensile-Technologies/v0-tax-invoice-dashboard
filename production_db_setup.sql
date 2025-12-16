-- Flow360 Production Database Setup Script
-- Run this in your Production database pane

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  username TEXT,
  phone_number TEXT,
  password_hash TEXT,
  role VARCHAR(50) DEFAULT 'vendor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  billing_email VARCHAR(255),
  billing_address TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_status VARCHAR(50) DEFAULT 'active',
  kra_pin VARCHAR(50),
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  vendor_id UUID,
  name TEXT NOT NULL,
  bhf_id TEXT,
  trading_name VARCHAR(255),
  kra_pin VARCHAR(50),
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
  server_address VARCHAR(255),
  server_port VARCHAR(50),
  sr_number INTEGER DEFAULT 0,
  invoice_number INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID,
  user_id UUID,
  username VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(50),
  role VARCHAR(50) DEFAULT 'attendant',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  cust_no VARCHAR(50),
  cust_nm VARCHAR(255),
  cust_tin VARCHAR(50),
  use_yn VARCHAR(5) DEFAULT 'Y',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  item_code VARCHAR(100),
  item_name VARCHAR(255),
  class_code VARCHAR(50),
  item_type VARCHAR(50),
  origin_country VARCHAR(50),
  package_unit VARCHAR(50),
  quantity_unit VARCHAR(50),
  tax_type VARCHAR(50),
  sale_price DECIMAL(15,2),
  purchase_price DECIMAL(15,2),
  stock_quantity DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  kra_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tanks table
CREATE TABLE IF NOT EXISTS tanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  tank_name VARCHAR(100),
  fuel_type VARCHAR(50),
  capacity DECIMAL(15,2),
  current_stock DECIMAL(15,2) DEFAULT 0,
  kra_item_cd VARCHAR(100),
  kra_sync_status VARCHAR(50) DEFAULT 'pending',
  last_kra_synced_stock DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispensers table
CREATE TABLE IF NOT EXISTS dispensers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  name VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nozzles table
CREATE TABLE IF NOT EXISTS nozzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  dispenser_id UUID,
  tank_id UUID,
  name VARCHAR(100),
  fuel_type VARCHAR(50),
  initial_meter_reading DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fuel Prices table
CREATE TABLE IF NOT EXISTS fuel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  fuel_type VARCHAR(50),
  price DECIMAL(15,2),
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  shift_id UUID,
  nozzle_id UUID,
  fuel_type VARCHAR(50),
  quantity DECIMAL(15,2),
  unit_price DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  payment_method VARCHAR(50),
  customer_name VARCHAR(255),
  vehicle_number VARCHAR(50),
  customer_pin VARCHAR(50),
  invoice_number VARCHAR(100),
  receipt_number VARCHAR(100),
  meter_reading_after DECIMAL(15,2),
  transmission_status VARCHAR(50) DEFAULT 'pending',
  is_loyalty_sale BOOLEAN DEFAULT false,
  loyalty_customer_name VARCHAR(255),
  loyalty_customer_pin VARCHAR(50),
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts table
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  user_id UUID,
  shift_name VARCHAR(100),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  opening_cash DECIMAL(15,2) DEFAULT 0,
  closing_cash DECIMAL(15,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  tank_id UUID,
  adjustment_type VARCHAR(50),
  quantity DECIMAL(15,2),
  reason TEXT,
  reference_number VARCHAR(100),
  previous_stock DECIMAL(15,2),
  new_stock DECIMAL(15,2),
  kra_sync_status VARCHAR(50) DEFAULT 'pending',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales People table
CREATE TABLE IF NOT EXISTS sales_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  stage VARCHAR(50) DEFAULT 'new',
  assigned_to UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  branch_id UUID,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  branch_id UUID,
  subtotal DECIMAL(15,2),
  tax_amount DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID,
  product_id UUID,
  product_name VARCHAR(255),
  quantity DECIMAL(15,2),
  unit_price DECIMAL(15,2),
  discount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hardware table
CREATE TABLE IF NOT EXISTS hardware (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  device_type VARCHAR(100),
  serial_number VARCHAR(100),
  model VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  assigned_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID,
  user_id UUID,
  subject VARCHAR(255),
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  category VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KRA Codelists table
CREATE TABLE IF NOT EXISTS kra_codelists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cd_cls VARCHAR(50),
  cd VARCHAR(50),
  cd_nm VARCHAR(255),
  user_dfn_cd1 VARCHAR(100),
  user_dfn_cd2 VARCHAR(100),
  user_dfn_cd3 VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KRA Item Classifications table
CREATE TABLE IF NOT EXISTS kra_item_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_cls_cd VARCHAR(50),
  item_cls_nm VARCHAR(255),
  item_cls_lvl INTEGER,
  tax_ty_cd VARCHAR(50),
  mjr_tg_yn VARCHAR(5),
  use_yn VARCHAR(5) DEFAULT 'Y',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID,
  branch_id UUID,
  amount DECIMAL(15,2),
  payment_method VARCHAR(50),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_branches_vendor_id ON branches(vendor_id);
CREATE INDEX IF NOT EXISTS idx_staff_branch_id ON staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_tanks_branch_id ON tanks(branch_id);
CREATE INDEX IF NOT EXISTS idx_items_branch_id ON items(branch_id);
CREATE INDEX IF NOT EXISTS idx_nozzles_branch_id ON nozzles(branch_id);

-- Success message
SELECT 'Database setup completed successfully!' as status;
