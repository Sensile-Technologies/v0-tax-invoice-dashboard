--
-- Flow360 Incremental Migration Script
-- Changes since last deployment (commit 68f40b8f - 200 commits ago)
-- Generated: 2026-01-18
-- 
-- This script contains ALL schema changes made since the last deployment.
-- Run this on production BEFORE deploying the new code.
--
-- IMPORTANT: All statements are idempotent (safe to run multiple times).
--

BEGIN;

-- ============================================================================
-- SECTION 1: NEW TABLES
-- ============================================================================

-- 1.1 expense_accounts - Track expense categories per vendor
CREATE TABLE IF NOT EXISTS expense_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    account_name varchar(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT expense_accounts_vendor_id_account_name_key UNIQUE (vendor_id, account_name)
);

CREATE INDEX IF NOT EXISTS idx_expense_accounts_vendor ON expense_accounts(vendor_id);

-- 1.2 shift_expenses - Track expenses per shift
CREATE TABLE IF NOT EXISTS shift_expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    shift_id uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    expense_account_id uuid NOT NULL REFERENCES expense_accounts(id) ON DELETE RESTRICT,
    amount numeric(12,2) NOT NULL,
    description text,
    created_by uuid REFERENCES users(id),
    created_at timestamp without time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shift_expenses_shift ON shift_expenses(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_expenses_branch ON shift_expenses(branch_id);

-- 1.3 banking_accounts - Track bank accounts per vendor
CREATE TABLE IF NOT EXISTS banking_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    vendor_id uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    account_name varchar(255) NOT NULL,
    account_number varchar(100),
    bank_name varchar(255),
    branch_name varchar(255),
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banking_accounts_vendor ON banking_accounts(vendor_id);

-- 1.4 shift_banking - Track banking activities per shift
CREATE TABLE IF NOT EXISTS shift_banking (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    shift_id uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    banking_account_id uuid NOT NULL REFERENCES banking_accounts(id) ON DELETE CASCADE,
    amount numeric(15,2) NOT NULL DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shift_banking_shift ON shift_banking(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_banking_account ON shift_banking(banking_account_id);

-- 1.5 attendant_collections - Track collections per attendant per shift
CREATE TABLE IF NOT EXISTS attendant_collections (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    shift_id uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    payment_method varchar(50) NOT NULL,
    amount numeric(12,2) NOT NULL DEFAULT 0,
    is_app_payment boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 1.6 credit_payments - Track credit transaction payments
CREATE TABLE IF NOT EXISTS credit_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    branch_id uuid NOT NULL REFERENCES branches(id),
    vendor_id uuid REFERENCES vendors(id),
    credit_type varchar(50) NOT NULL,
    source_id uuid NOT NULL,
    source_date date NOT NULL,
    credit_amount numeric(12,2) NOT NULL,
    payment_amount numeric(12,2) NOT NULL,
    payment_reference varchar(255),
    payment_notes text,
    recorded_by uuid REFERENCES users(id),
    created_at timestamp with time zone DEFAULT now()
);

-- 1.7 customer_branches - Link customers to multiple branches
CREATE TABLE IF NOT EXISTS customer_branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    customer_id uuid NOT NULL REFERENCES customers(id),
    branch_id uuid NOT NULL REFERENCES branches(id),
    vendor_id uuid,
    status varchar(50) DEFAULT 'active',
    linked_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT customer_branches_customer_id_branch_id_key UNIQUE (customer_id, branch_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_branches_customer ON customer_branches(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_branches_branch ON customer_branches(branch_id);

-- 1.8 bulk_sales - Track bulk/uninvoiced fuel sales
CREATE TABLE IF NOT EXISTS bulk_sales (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    branch_id uuid NOT NULL REFERENCES branches(id),
    shift_id uuid NOT NULL REFERENCES shifts(id),
    nozzle_id uuid REFERENCES nozzles(id),
    item_id uuid REFERENCES items(id),
    fuel_type varchar(100),
    opening_reading numeric(15,3) DEFAULT 0,
    closing_reading numeric(15,3) DEFAULT 0,
    meter_difference numeric(15,3) DEFAULT 0,
    invoiced_quantity numeric(15,3) DEFAULT 0,
    bulk_quantity numeric(15,3) DEFAULT 0,
    unit_price numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) DEFAULT 0,
    generated_invoices integer DEFAULT 0,
    status varchar(50) DEFAULT 'pending',
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bulk_sales_branch_id ON bulk_sales(branch_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_shift_id ON bulk_sales(shift_id);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_created_at ON bulk_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_bulk_sales_branch_date ON bulk_sales(branch_id, created_at DESC);

-- 1.9 pump_callback_events - Log raw PTS controller callbacks
CREATE TABLE IF NOT EXISTS pump_callback_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    pts_id varchar(255),
    raw_request jsonb,
    raw_response jsonb,
    created_at timestamp without time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pump_callback_events_pts ON pump_callback_events(pts_id);
CREATE INDEX IF NOT EXISTS idx_pump_callback_events_created ON pump_callback_events(created_at DESC);

-- 1.10 pump_transactions - Track individual pump transactions
CREATE TABLE IF NOT EXISTS pump_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    packet_id integer,
    pts_id varchar(255),
    pump_number integer,
    nozzle_number integer,
    fuel_grade_id integer,
    fuel_grade_name varchar(100),
    transaction_id bigint,
    volume numeric(10,4),
    tc_volume numeric(10,4),
    price numeric(10,2),
    amount numeric(10,2),
    total_volume numeric(15,4),
    total_amount numeric(15,2),
    tag varchar(100),
    user_id integer,
    configuration_id varchar(100),
    transaction_start timestamp without time zone,
    transaction_end timestamp without time zone,
    processed boolean DEFAULT false,
    sale_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    callback_event_id uuid REFERENCES pump_callback_events(id),
    raw_packet jsonb,
    CONSTRAINT pump_transactions_pts_id_transaction_id_key UNIQUE (pts_id, transaction_id)
);

-- 1.11 pump_fuel_grade_mappings - Map PTS fuel grades to items
CREATE TABLE IF NOT EXISTS pump_fuel_grade_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    pts_id text,
    fuel_grade_id integer NOT NULL,
    fuel_grade_name text,
    item_id uuid REFERENCES items(id),
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pump_fuel_grade_mappings_pts_fuel_unique UNIQUE (pts_id, fuel_grade_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS pump_fuel_grade_mappings_global_idx 
    ON pump_fuel_grade_mappings(fuel_grade_id) WHERE pts_id IS NULL;

-- 1.12 purchase_order_acceptances - Track PO delivery acceptance
CREATE TABLE IF NOT EXISTS purchase_order_acceptances (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    accepted_by uuid REFERENCES users(id),
    bowser_volume numeric(14,3) NOT NULL,
    dips_mm numeric(10,2),
    total_variance numeric(14,3),
    remarks text,
    acceptance_timestamp timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_acceptances_po_id ON purchase_order_acceptances(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_acceptances_branch_id ON purchase_order_acceptances(branch_id);

-- 1.13 po_acceptance_tank_readings - Tank readings during PO acceptance
CREATE TABLE IF NOT EXISTS po_acceptance_tank_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    acceptance_id uuid NOT NULL REFERENCES purchase_order_acceptances(id) ON DELETE CASCADE,
    tank_id uuid NOT NULL REFERENCES tanks(id),
    volume_before numeric(14,3) NOT NULL,
    volume_after numeric(14,3) NOT NULL,
    variance numeric(14,3) GENERATED ALWAYS AS (volume_after - volume_before) STORED
);

-- 1.14 po_acceptance_nozzle_readings - Nozzle readings during PO acceptance
CREATE TABLE IF NOT EXISTS po_acceptance_nozzle_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    acceptance_id uuid NOT NULL REFERENCES purchase_order_acceptances(id) ON DELETE CASCADE,
    nozzle_id uuid NOT NULL REFERENCES nozzles(id),
    meter_reading_before numeric(12,2) NOT NULL DEFAULT 0,
    meter_reading_after numeric(12,2) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_nozzle_readings_acceptance ON po_acceptance_nozzle_readings(acceptance_id);
CREATE INDEX IF NOT EXISTS idx_po_nozzle_readings_nozzle ON po_acceptance_nozzle_readings(nozzle_id);

-- 1.15 po_acceptance_dispenser_readings - Dispenser readings during PO acceptance
CREATE TABLE IF NOT EXISTS po_acceptance_dispenser_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    acceptance_id uuid NOT NULL REFERENCES purchase_order_acceptances(id) ON DELETE CASCADE,
    dispenser_id uuid NOT NULL REFERENCES dispensers(id),
    meter_reading_before numeric(14,3) NOT NULL,
    meter_reading_after numeric(14,3) NOT NULL,
    variance numeric(14,3) GENERATED ALWAYS AS (meter_reading_after - meter_reading_before) STORED
);

-- 1.16 vendor_po_sequences - Track PO number sequences per vendor
CREATE TABLE IF NOT EXISTS vendor_po_sequences (
    vendor_id uuid NOT NULL PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    next_po_number integer DEFAULT 1
);

-- 1.17 device_initialization - Store KRA device initialization data
CREATE TABLE IF NOT EXISTS device_initialization (
    id uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
    branch_id uuid REFERENCES branches(id) ON DELETE CASCADE,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    dvc_srl_no text,
    dvc_id text,
    intrl_key text,
    sign_key text,
    cmc_key text,
    mrc_no text,
    sdc_id text,
    taxpr_nm text,
    bsns_actv text,
    bhf_nm text,
    bhf_open_dt text,
    prvnc_nm text,
    dstrt_nm text,
    sctr_nm text,
    loc_desc text,
    hq_yn text,
    mgr_nm text,
    mgr_tel_no text,
    mgr_email text,
    vat_ty_cd text,
    last_invc_no integer DEFAULT 0,
    last_sale_invc_no integer DEFAULT 0,
    last_train_invc_no integer DEFAULT 0,
    last_profrm_invc_no integer DEFAULT 0,
    last_copy_invc_no integer DEFAULT 0,
    last_sale_rcpt_no integer DEFAULT 0,
    last_pchs_invc_no integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_initialization_branch_id ON device_initialization(branch_id);


-- ============================================================================
-- SECTION 2: NEW COLUMNS ON EXISTING TABLES
-- ============================================================================

-- 2.1 staff.vendor_id - Direct vendor association for staff
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'vendor_id') THEN
        ALTER TABLE staff ADD COLUMN vendor_id uuid REFERENCES vendors(id);
        RAISE NOTICE 'Added staff.vendor_id';
    END IF;
END $$;

-- Backfill vendor_id from branch relationships
UPDATE staff s SET vendor_id = b.vendor_id
FROM branches b WHERE s.branch_id = b.id AND s.vendor_id IS NULL AND b.vendor_id IS NOT NULL;

-- 2.2 sales.original_printed - Track original invoice print status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'original_printed') THEN
        ALTER TABLE sales ADD COLUMN original_printed boolean DEFAULT false;
        RAISE NOTICE 'Added sales.original_printed';
    END IF;
END $$;

-- 2.3 sales.kra_internal_data - Store KRA intrlData separately
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'kra_internal_data') THEN
        ALTER TABLE sales ADD COLUMN kra_internal_data text;
        RAISE NOTICE 'Added sales.kra_internal_data';
    END IF;
END $$;

-- 2.4 sales.item_id - Link sales to items table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'item_id') THEN
        ALTER TABLE sales ADD COLUMN item_id uuid REFERENCES items(id);
        RAISE NOTICE 'Added sales.item_id';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sales_item_id ON sales(item_id);

-- 2.5 branches.bulk_sales_kra_percentage - KRA transmission rate for bulk sales
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'bulk_sales_kra_percentage') THEN
        ALTER TABLE branches ADD COLUMN bulk_sales_kra_percentage integer DEFAULT 100;
        RAISE NOTICE 'Added branches.bulk_sales_kra_percentage';
    END IF;
END $$;

-- 2.6 branches.controller_id - PTS controller identifier
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'controller_id') THEN
        ALTER TABLE branches ADD COLUMN controller_id varchar;
        RAISE NOTICE 'Added branches.controller_id';
    END IF;
END $$;

-- 2.7 shifts.reconciliation_status - Track shift reconciliation
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'reconciliation_status') THEN
        ALTER TABLE shifts ADD COLUMN reconciliation_status text DEFAULT 'pending' 
            CHECK (reconciliation_status IN ('pending', 'reconciled'));
        RAISE NOTICE 'Added shifts.reconciliation_status';
    END IF;
END $$;

-- 2.8 shift_readings.incoming_attendant_id - Track incoming attendant assignment
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shift_readings' AND column_name = 'incoming_attendant_id') THEN
        ALTER TABLE shift_readings ADD COLUMN incoming_attendant_id uuid REFERENCES staff(id);
        RAISE NOTICE 'Added shift_readings.incoming_attendant_id';
    END IF;
END $$;

-- 2.9 shift_readings.rtt - Return to tank
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shift_readings' AND column_name = 'rtt') THEN
        ALTER TABLE shift_readings ADD COLUMN rtt numeric DEFAULT 0;
        RAISE NOTICE 'Added shift_readings.rtt';
    END IF;
END $$;

-- 2.10 shift_readings.self_fueling
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shift_readings' AND column_name = 'self_fueling') THEN
        ALTER TABLE shift_readings ADD COLUMN self_fueling numeric DEFAULT 0;
        RAISE NOTICE 'Added shift_readings.self_fueling';
    END IF;
END $$;

-- 2.11 shift_readings.prepaid_sale
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shift_readings' AND column_name = 'prepaid_sale') THEN
        ALTER TABLE shift_readings ADD COLUMN prepaid_sale numeric DEFAULT 0;
        RAISE NOTICE 'Added shift_readings.prepaid_sale';
    END IF;
END $$;

-- 2.12 nozzles.item_id - Link nozzles to items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nozzles' AND column_name = 'item_id') THEN
        ALTER TABLE nozzles ADD COLUMN item_id uuid;
        RAISE NOTICE 'Added nozzles.item_id';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_nozzles_item_id ON nozzles(item_id);

-- 2.13 nozzles.tank_id - Link nozzles to tanks
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nozzles' AND column_name = 'tank_id') THEN
        ALTER TABLE nozzles ADD COLUMN tank_id uuid;
        RAISE NOTICE 'Added nozzles.tank_id';
    END IF;
END $$;

-- 2.14 dispensers.item_id - Link dispensers to items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispensers' AND column_name = 'item_id') THEN
        ALTER TABLE dispensers ADD COLUMN item_id uuid REFERENCES items(id);
        RAISE NOTICE 'Added dispensers.item_id';
    END IF;
END $$;

-- 2.15 dispensers.tank_id - Link dispensers to tanks
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dispensers' AND column_name = 'tank_id') THEN
        ALTER TABLE dispensers ADD COLUMN tank_id uuid REFERENCES tanks(id);
        RAISE NOTICE 'Added dispensers.tank_id';
    END IF;
END $$;

-- 2.16 items.color_code - Color for chart visualization
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'color_code') THEN
        ALTER TABLE items ADD COLUMN color_code varchar(10);
        RAISE NOTICE 'Added items.color_code';
    END IF;
END $$;

-- 2.17 loyalty_transactions.item_id - Link loyalty to items
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'loyalty_transactions' AND column_name = 'item_id') THEN
        ALTER TABLE loyalty_transactions ADD COLUMN item_id uuid REFERENCES items(id);
        RAISE NOTICE 'Added loyalty_transactions.item_id';
    END IF;
END $$;

-- 2.18 api_logs.external_endpoint - Track external API calls
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_logs' AND column_name = 'external_endpoint') THEN
        ALTER TABLE api_logs ADD COLUMN external_endpoint text;
        RAISE NOTICE 'Added api_logs.external_endpoint';
    END IF;
END $$;


-- ============================================================================
-- SECTION 3: PERFORMANCE INDEXES
-- ============================================================================

-- Sales table indexes for reporting
CREATE INDEX IF NOT EXISTS idx_sales_branch_created_desc ON sales(branch_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_branch_date_kra ON sales(branch_id, sale_date, kra_status);
CREATE INDEX IF NOT EXISTS idx_sales_branch_fuel_amount ON sales(branch_id, fuel_type, total_amount);
CREATE INDEX IF NOT EXISTS idx_sales_shift_nozzle ON sales(shift_id, nozzle_id);

-- Shifts indexes
CREATE INDEX IF NOT EXISTS idx_shifts_branch_start ON shifts(branch_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_shifts_branch_status ON shifts(branch_id, status);

-- Shift readings indexes
CREATE INDEX IF NOT EXISTS idx_shift_readings_shift_type ON shift_readings(shift_id, reading_type);


-- ============================================================================
-- SECTION 4: VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify migration success:
-- SELECT COUNT(*) FROM expense_accounts;
-- SELECT COUNT(*) FROM banking_accounts;
-- SELECT COUNT(*) FROM attendant_collections;
-- SELECT COUNT(*) FROM bulk_sales;
-- SELECT COUNT(*) FROM pump_transactions;
-- SELECT COUNT(*) FROM credit_payments;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'vendor_id';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'original_printed';


COMMIT;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
--
-- NEW TABLES (17):
--   expense_accounts, shift_expenses, banking_accounts, shift_banking,
--   attendant_collections, credit_payments, customer_branches, bulk_sales,
--   pump_callback_events, pump_transactions, pump_fuel_grade_mappings,
--   purchase_order_acceptances, po_acceptance_tank_readings,
--   po_acceptance_nozzle_readings, po_acceptance_dispenser_readings,
--   vendor_po_sequences, device_initialization
--
-- NEW COLUMNS:
--   staff: vendor_id
--   sales: original_printed, kra_internal_data, item_id
--   branches: bulk_sales_kra_percentage, controller_id
--   shifts: reconciliation_status
--   shift_readings: incoming_attendant_id, rtt, self_fueling, prepaid_sale
--   nozzles: item_id, tank_id
--   dispensers: item_id, tank_id
--   items: color_code
--   loyalty_transactions: item_id
--   api_logs: external_endpoint
--
-- NEW INDEXES: 15+ performance indexes for reporting
--
-- ============================================================================
