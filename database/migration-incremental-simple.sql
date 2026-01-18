--
-- Flow360 Incremental Migration Script (Simple Version)
-- For Replit Production Database Panel
-- Generated: 2026-01-18
--
-- Run each section separately if needed.
-- Tables use IF NOT EXISTS, columns use try/catch approach.
--

-- ============================================================================
-- SECTION 1: NEW TABLES (Safe to run - uses IF NOT EXISTS)
-- ============================================================================

-- 1.1 expense_accounts
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

-- 1.2 shift_expenses
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

-- 1.3 banking_accounts
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

-- 1.4 shift_banking
CREATE TABLE IF NOT EXISTS shift_banking (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    shift_id uuid NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    banking_account_id uuid NOT NULL REFERENCES banking_accounts(id) ON DELETE CASCADE,
    amount numeric(15,2) NOT NULL DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 attendant_collections
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

-- 1.6 credit_payments
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

-- 1.7 customer_branches
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

-- 1.8 bulk_sales
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

-- 1.9 pump_callback_events
CREATE TABLE IF NOT EXISTS pump_callback_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    pts_id varchar(255),
    raw_request jsonb,
    raw_response jsonb,
    created_at timestamp without time zone DEFAULT now()
);

-- 1.10 pump_transactions
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

-- 1.11 pump_fuel_grade_mappings
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

-- 1.12 purchase_order_acceptances
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

-- 1.13 po_acceptance_tank_readings
CREATE TABLE IF NOT EXISTS po_acceptance_tank_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    acceptance_id uuid NOT NULL REFERENCES purchase_order_acceptances(id) ON DELETE CASCADE,
    tank_id uuid NOT NULL REFERENCES tanks(id),
    volume_before numeric(14,3) NOT NULL,
    volume_after numeric(14,3) NOT NULL,
    variance numeric(14,3) GENERATED ALWAYS AS (volume_after - volume_before) STORED
);

-- 1.14 po_acceptance_nozzle_readings
CREATE TABLE IF NOT EXISTS po_acceptance_nozzle_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    acceptance_id uuid NOT NULL REFERENCES purchase_order_acceptances(id) ON DELETE CASCADE,
    nozzle_id uuid NOT NULL REFERENCES nozzles(id),
    meter_reading_before numeric(12,2) NOT NULL DEFAULT 0,
    meter_reading_after numeric(12,2) NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- 1.15 po_acceptance_dispenser_readings
CREATE TABLE IF NOT EXISTS po_acceptance_dispenser_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    acceptance_id uuid NOT NULL REFERENCES purchase_order_acceptances(id) ON DELETE CASCADE,
    dispenser_id uuid NOT NULL REFERENCES dispensers(id),
    meter_reading_before numeric(14,3) NOT NULL,
    meter_reading_after numeric(14,3) NOT NULL,
    variance numeric(14,3) GENERATED ALWAYS AS (meter_reading_after - meter_reading_before) STORED
);

-- 1.16 vendor_po_sequences
CREATE TABLE IF NOT EXISTS vendor_po_sequences (
    vendor_id uuid NOT NULL PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    next_po_number integer DEFAULT 1
);

-- 1.17 device_initialization
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
