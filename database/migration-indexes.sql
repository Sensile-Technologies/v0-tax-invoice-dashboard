--
-- Flow360 Performance Indexes
-- Run these after tables and columns are created
-- All use IF NOT EXISTS - safe to run multiple times
--

-- Expense accounts
CREATE INDEX IF NOT EXISTS idx_expense_accounts_vendor ON expense_accounts(vendor_id);

-- Shift expenses
CREATE INDEX IF NOT EXISTS idx_shift_expenses_shift ON shift_expenses(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_expenses_branch ON shift_expenses(branch_id);

-- Banking accounts
CREATE INDEX IF NOT EXISTS idx_banking_accounts_vendor ON banking_accounts(vendor_id);

-- Shift banking
CREATE INDEX IF NOT EXISTS idx_shift_banking_shift ON shift_banking(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_banking_account ON shift_banking(banking_account_id);

-- Customer branches
CREATE INDEX IF NOT EXISTS idx_customer_branches_customer ON customer_branches(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_branches_branch ON customer_branches(branch_id);

-- Bulk sales
CREATE INDEX IF NOT EXISTS idx_bulk_sales_branch_id ON bulk_sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_shift_id ON bulk_sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_created_at ON bulk_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_branch_date ON bulk_sales(branch_id, created_at DESC);

-- Pump callback events
CREATE INDEX IF NOT EXISTS idx_pump_callback_events_pts ON pump_callback_events(pts_id);
CREATE INDEX IF NOT EXISTS idx_pump_callback_events_created ON pump_callback_events(created_at DESC);

-- Purchase order acceptances
CREATE INDEX IF NOT EXISTS idx_po_acceptances_po_id ON purchase_order_acceptances(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_acceptances_branch_id ON purchase_order_acceptances(branch_id);

-- PO nozzle readings
CREATE INDEX IF NOT EXISTS idx_po_nozzle_readings_acceptance ON po_acceptance_nozzle_readings(acceptance_id);
CREATE INDEX IF NOT EXISTS idx_po_nozzle_readings_nozzle ON po_acceptance_nozzle_readings(nozzle_id);

-- Device initialization
CREATE INDEX IF NOT EXISTS idx_device_initialization_branch_id ON device_initialization(branch_id);

-- Sales indexes for reporting
CREATE INDEX IF NOT EXISTS idx_sales_item_id ON sales(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_branch_created_desc ON sales(branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_branch_date_kra ON sales(branch_id, sale_date, kra_status);
CREATE INDEX IF NOT EXISTS idx_sales_branch_fuel_amount ON sales(branch_id, fuel_type, total_amount);
CREATE INDEX IF NOT EXISTS idx_sales_shift_nozzle ON sales(shift_id, nozzle_id);

-- Shifts indexes
CREATE INDEX IF NOT EXISTS idx_shifts_branch_start ON shifts(branch_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_branch_status ON shifts(branch_id, status);

-- Shift readings indexes
CREATE INDEX IF NOT EXISTS idx_shift_readings_shift_type ON shift_readings(shift_id, reading_type);

-- Nozzles
CREATE INDEX IF NOT EXISTS idx_nozzles_item_id ON nozzles(item_id);
