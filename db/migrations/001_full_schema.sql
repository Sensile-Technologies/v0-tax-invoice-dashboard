--
-- PostgreSQL database dump
--


-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    user_id character varying(255),
    user_email character varying(255),
    user_name character varying(255),
    branch_id character varying(255),
    branch_name character varying(255),
    vendor_id character varying(255),
    action character varying(100) NOT NULL,
    resource_type character varying(100),
    resource_id character varying(255),
    details jsonb,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: api_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    endpoint text NOT NULL,
    method text NOT NULL,
    payload jsonb,
    response jsonb,
    status_code integer,
    duration_ms integer,
    error text,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    external_endpoint text
);


--
-- Name: billing_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    product_type character varying(50) NOT NULL,
    default_amount numeric(12,2) DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT billing_products_product_type_check CHECK (((product_type)::text = ANY ((ARRAY['setup'::character varying, 'one_off_manual'::character varying, 'one_off_automated'::character varying, 'subscription_monthly_manual'::character varying, 'subscription_monthly_automated'::character varying])::text[])))
);


--
-- Name: billing_rates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    rate_type character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'KES'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: branch_insurances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_insurances (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    isrcc_cd text,
    isrcc_nm text,
    isrc_rt numeric(5,2),
    use_yn text DEFAULT 'Y'::text,
    regr_nm text,
    regr_id text,
    modr_nm text,
    modr_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: branch_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid NOT NULL,
    item_id uuid NOT NULL,
    sale_price numeric(10,2) NOT NULL,
    purchase_price numeric(10,2),
    is_available boolean DEFAULT true,
    kra_status character varying(20) DEFAULT 'pending'::character varying,
    kra_response text,
    kra_last_synced_at timestamp without time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: branch_kra_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_kra_counters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid,
    endpoint text NOT NULL,
    current_sar_no integer DEFAULT 0,
    last_reset_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: branch_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    log_type character varying(50) NOT NULL,
    endpoint text,
    request_payload jsonb,
    response_payload jsonb,
    status character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid
);


--
-- Name: branch_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branch_users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    user_id_text text,
    user_nm text,
    pwd text,
    adrs text,
    cntc text,
    auth_cd text,
    remark text,
    use_yn text DEFAULT 'Y'::text,
    regr_nm text,
    regr_id text,
    modr_nm text,
    modr_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    bhf_id text,
    location text,
    address text,
    county text,
    local_tax_office text,
    manager text,
    email text,
    phone text,
    status text DEFAULT 'active'::text,
    device_token text,
    storage_indices jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    vendor_id uuid,
    trading_name character varying(255),
    kra_pin character varying(50),
    server_address character varying(255),
    server_port character varying(10),
    sr_number integer DEFAULT 0,
    invoice_number integer DEFAULT 0,
    is_main boolean DEFAULT false,
    device_serial_number character varying(255),
    controller_id character varying(255)
);


--
-- Name: credit_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.credit_notes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    sale_id uuid,
    credit_note_number text,
    reason text NOT NULL,
    return_quantity numeric(10,2),
    refund_amount numeric(10,2) NOT NULL,
    approval_status text DEFAULT 'pending'::text,
    approved_by text,
    customer_signature text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: customer_branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    vendor_id uuid,
    status character varying(50) DEFAULT 'active'::character varying,
    linked_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    cust_tin text,
    cust_no text,
    cust_nm text NOT NULL,
    adrs text,
    tel_no text,
    email text,
    fax_no text,
    use_yn text DEFAULT 'Y'::text,
    remark text,
    regr_nm text,
    regr_id text,
    modr_nm text,
    modr_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: device_initialization; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_initialization (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
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


--
-- Name: dispenser_tanks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispenser_tanks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dispenser_id uuid NOT NULL,
    tank_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: dispensers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dispensers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    dispenser_number integer NOT NULL,
    fuel_type text NOT NULL,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    item_id uuid,
    tank_id uuid
);


--
-- Name: hardware; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hardware (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    hardware_type character varying(100) NOT NULL,
    serial_number character varying(255),
    status character varying(50) DEFAULT 'active'::character varying,
    assigned_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    assigned_to uuid
);


--
-- Name: imported_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.imported_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    task_cd text,
    dcl_de text,
    item_seq integer,
    hs_cd text,
    item_cls_cd text,
    item_cd text,
    impt_item_stts_cd text,
    remark text,
    modr_nm text,
    modr_id text,
    last_req_dt timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoice_branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid,
    branch_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: invoice_line_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_line_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid,
    description character varying(255) NOT NULL,
    quantity numeric(10,2) DEFAULT 1,
    unit_price numeric(12,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT 0,
    amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    discount numeric(5,2) DEFAULT 0
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number character varying(50) NOT NULL,
    vendor_id uuid,
    branch_id uuid,
    status character varying(20) DEFAULT 'draft'::character varying,
    issue_date date NOT NULL,
    due_date date NOT NULL,
    subtotal numeric(12,2) DEFAULT 0,
    tax_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) DEFAULT 0,
    paid_amount numeric(12,2) DEFAULT 0,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_recurring boolean DEFAULT false,
    recurring_interval character varying(20),
    next_invoice_date date,
    parent_invoice_id uuid,
    billed_to_contact text
);


--
-- Name: item_compositions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.item_compositions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    parent_item_id uuid,
    composite_item_id uuid,
    percentage numeric(5,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    item_code text,
    sku text,
    item_name text NOT NULL,
    description text,
    item_type text,
    class_code text,
    tax_type text,
    origin text,
    batch_number text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    vendor_id uuid,
    quantity_unit text,
    package_unit text,
    kra_status character varying(20) DEFAULT 'pending'::character varying,
    kra_response text,
    kra_last_synced_at timestamp without time zone
);


--
-- Name: kra_codelists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kra_codelists (
    id integer NOT NULL,
    bhf_id character varying(10) NOT NULL,
    cd_cls character varying(50) NOT NULL,
    cd character varying(50) NOT NULL,
    cd_nm character varying(255),
    cd_desc text,
    use_yn character varying(1) DEFAULT 'Y'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: kra_codelists_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kra_codelists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kra_codelists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kra_codelists_id_seq OWNED BY public.kra_codelists.id;


--
-- Name: kra_item_classifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kra_item_classifications (
    id integer NOT NULL,
    bhf_id character varying(10) NOT NULL,
    item_cls_cd character varying(50) NOT NULL,
    item_cls_nm text,
    item_cls_lvl integer,
    tax_ty_cd character varying(10),
    mjr_tg_yn character varying(1),
    use_yn character varying(1) DEFAULT 'Y'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: kra_item_classifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kra_item_classifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kra_item_classifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kra_item_classifications_id_seq OWNED BY public.kra_item_classifications.id;


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name character varying(255) NOT NULL,
    contact_name character varying(255),
    contact_email character varying(255),
    contact_phone character varying(50),
    stage character varying(50) DEFAULT 'contact'::character varying,
    assigned_to uuid,
    notes text,
    expected_value numeric(12,2),
    expected_close_date date,
    source character varying(100),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    kra_pin character varying(50),
    trading_name character varying(255),
    is_archived boolean DEFAULT false,
    contract_url text,
    device_serial_number character varying(255),
    sr_number integer,
    location character varying(255),
    county character varying(255),
    address text
);


--
-- Name: loyalty_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    sale_id uuid,
    customer_name text NOT NULL,
    customer_pin text,
    transaction_date timestamp with time zone DEFAULT now(),
    transaction_amount numeric(10,2) NOT NULL,
    points_earned numeric(10,2) NOT NULL,
    payment_method text,
    fuel_type text,
    quantity numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: notices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text,
    bhf_id text,
    notce_no integer,
    title text,
    cont text,
    dtl_url text,
    remark text,
    last_req_dt timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying(255),
    type character varying(50) DEFAULT 'info'::character varying NOT NULL,
    title character varying(255) NOT NULL,
    message text,
    reference_id character varying(255),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: nozzles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nozzles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    dispenser_id uuid,
    nozzle_number integer NOT NULL,
    fuel_type text NOT NULL,
    initial_meter_reading numeric(10,2) DEFAULT 0,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tank_id uuid,
    item_id uuid
);


--
-- Name: onboarding_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type character varying(50) NOT NULL,
    merchant_id uuid,
    branch_id uuid,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    consumed_at timestamp with time zone
);


--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid,
    vendor_id uuid,
    amount numeric(12,2) NOT NULL,
    payment_method character varying(50),
    payment_reference character varying(100),
    status character varying(20) DEFAULT 'pending'::character varying,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_date date NOT NULL,
    payment_method character varying(50),
    reference_number character varying(100),
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: po_acceptance_dispenser_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_acceptance_dispenser_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acceptance_id uuid NOT NULL,
    dispenser_id uuid NOT NULL,
    meter_reading_before numeric(14,3) NOT NULL,
    meter_reading_after numeric(14,3) NOT NULL,
    variance numeric(14,3) GENERATED ALWAYS AS ((meter_reading_after - meter_reading_before)) STORED
);


--
-- Name: po_acceptance_nozzle_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_acceptance_nozzle_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acceptance_id uuid NOT NULL,
    nozzle_id uuid NOT NULL,
    meter_reading_before numeric(12,2) DEFAULT 0 NOT NULL,
    meter_reading_after numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: po_acceptance_tank_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.po_acceptance_tank_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acceptance_id uuid NOT NULL,
    tank_id uuid NOT NULL,
    volume_before numeric(14,3) NOT NULL,
    volume_after numeric(14,3) NOT NULL,
    variance numeric(14,3) GENERATED ALWAYS AS ((volume_after - volume_before)) STORED
);


--
-- Name: printer_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.printer_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid,
    vendor_id uuid,
    user_id uuid,
    username character varying(100),
    step character varying(50),
    status character varying(20),
    message text,
    invoice_number character varying(100),
    error_details jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pump_callback_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pump_callback_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pts_id character varying(255),
    raw_request jsonb,
    raw_response jsonb,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: pump_fuel_grade_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pump_fuel_grade_mappings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pts_id text,
    fuel_grade_id integer NOT NULL,
    fuel_grade_name text,
    item_id uuid,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pump_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pump_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    packet_id integer,
    pts_id character varying(255),
    pump_number integer,
    nozzle_number integer,
    fuel_grade_id integer,
    fuel_grade_name character varying(100),
    transaction_id bigint,
    volume numeric(10,4),
    tc_volume numeric(10,4),
    price numeric(10,2),
    amount numeric(10,2),
    total_volume numeric(15,4),
    total_amount numeric(15,2),
    tag character varying(100),
    user_id integer,
    configuration_id character varying(100),
    transaction_start timestamp without time zone,
    transaction_end timestamp without time zone,
    processed boolean DEFAULT false,
    sale_id uuid,
    created_at timestamp without time zone DEFAULT now(),
    callback_event_id uuid,
    raw_packet jsonb
);


--
-- Name: purchase_order_acceptances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_acceptances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    accepted_by uuid,
    bowser_volume numeric(14,3) NOT NULL,
    dips_mm numeric(10,2),
    total_variance numeric(14,3),
    remarks text,
    acceptance_timestamp timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    purchase_order_id uuid NOT NULL,
    item_id uuid,
    item_name character varying(255) NOT NULL,
    quantity numeric(12,3) NOT NULL,
    unit_price numeric(12,2),
    total_amount numeric(14,2),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    supplier_id uuid,
    po_number character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    expected_delivery date,
    notes text,
    created_by uuid,
    issued_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    transporter_id uuid,
    transport_cost numeric(15,2) DEFAULT 0,
    vehicle_registration character varying(50),
    driver_name character varying(255),
    driver_phone character varying(50),
    approval_status character varying(50) DEFAULT 'draft'::character varying,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejection_comments text,
    CONSTRAINT purchase_orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'cancelled'::character varying, 'completed'::character varying])::text[])))
);


--
-- Name: purchase_transaction_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_transaction_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_transaction_id uuid,
    item_seq integer,
    item_cd text,
    item_cls_cd text,
    item_nm text,
    bcd text,
    spplr_item_cls_cd text,
    spplr_item_cd text,
    spplr_item_nm text,
    pkg_unit_cd text,
    pkg numeric(10,2),
    qty_unit_cd text,
    qty numeric(10,2),
    prc numeric(10,2),
    sply_amt numeric(10,2),
    dc_rt numeric(5,2),
    dc_amt numeric(10,2),
    tax_ty_cd text,
    taxbl_amt numeric(10,2),
    tax_amt numeric(10,2),
    tot_amt numeric(10,2),
    item_expr_dt date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: purchase_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    invc_no integer,
    org_invc_no integer,
    spplr_tin text,
    spplr_bhf_id text,
    spplr_nm text,
    spplr_invc_no text,
    reg_ty_cd text,
    pchs_ty_cd text,
    rcpt_ty_cd text,
    pmt_ty_cd text,
    pchs_stts_cd text,
    cfm_dt timestamp with time zone,
    pchs_dt date,
    wrhs_dt date,
    cncl_req_dt date,
    cncl_dt date,
    rfd_dt date,
    tot_item_cnt integer,
    taxbl_amt_a numeric(10,2),
    taxbl_amt_b numeric(10,2),
    taxbl_amt_c numeric(10,2),
    taxbl_amt_d numeric(10,2),
    taxbl_amt_e numeric(10,2),
    tax_rt_a numeric(5,2),
    tax_rt_b numeric(5,2),
    tax_rt_c numeric(5,2),
    tax_rt_d numeric(5,2),
    tax_rt_e numeric(5,2),
    tax_amt_a numeric(10,2),
    tax_amt_b numeric(10,2),
    tax_amt_c numeric(10,2),
    tax_amt_d numeric(10,2),
    tax_amt_e numeric(10,2),
    tot_taxbl_amt numeric(10,2),
    tot_tax_amt numeric(10,2),
    tot_amt numeric(10,2),
    remark text,
    regr_id text,
    regr_nm text,
    modr_id text,
    modr_nm text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    shift_id uuid,
    staff_id uuid,
    nozzle_id uuid,
    credit_note_id uuid,
    invoice_number text,
    receipt_number text,
    sale_date timestamp with time zone DEFAULT now(),
    fuel_type text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    payment_method text,
    customer_name text,
    customer_pin text,
    vehicle_number text,
    meter_reading_after numeric(10,2),
    is_loyalty_sale boolean DEFAULT false,
    loyalty_customer_name text,
    loyalty_customer_pin text,
    loyalty_points_earned numeric(10,2) DEFAULT 0,
    transmission_status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    kra_status text DEFAULT 'pending'::text,
    kra_rcpt_sign text,
    kra_scu_id text,
    kra_cu_inv text,
    kra_internal_data text,
    is_credit_note boolean DEFAULT false,
    original_sale_id uuid,
    has_credit_note boolean DEFAULT false,
    kra_error text,
    is_automated boolean DEFAULT false,
    source_system text
);


--
-- Name: sales_people; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_people (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: sales_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_receipts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sales_transaction_id uuid,
    cust_tin text,
    cust_mbl_no text,
    rpt_no integer,
    trde_nm text,
    adrs text,
    top_msg text,
    btm_msg text,
    prchr_acptc_yn text,
    rcpt_pbct_dt timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sales_transaction_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_transaction_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sales_transaction_id uuid,
    item_seq integer,
    item_cd text,
    item_cls_cd text,
    item_nm text,
    bcd text,
    pkg_unit_cd text,
    pkg numeric(10,2),
    qty_unit_cd text,
    qty numeric(10,2),
    prc numeric(10,2),
    sply_amt numeric(10,2),
    dc_rt numeric(5,2),
    dc_amt numeric(10,2),
    tax_ty_cd text,
    taxbl_amt numeric(10,2),
    tax_amt numeric(10,2),
    tot_amt numeric(10,2),
    isrcc_cd text,
    isrcc_nm text,
    isrc_rt numeric(5,2),
    isrc_amt numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sales_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    invc_no integer,
    org_invc_no integer,
    cust_tin text,
    cust_nm text,
    sales_ty_cd text,
    rcpt_ty_cd text,
    pmt_ty_cd text,
    sales_stts_cd text,
    cfm_dt timestamp with time zone,
    sales_dt date,
    stock_rls_dt timestamp with time zone,
    cncl_req_dt date,
    cncl_dt date,
    rfd_dt date,
    rfd_rsn_cd text,
    tot_item_cnt integer,
    taxbl_amt_a numeric(10,2),
    taxbl_amt_b numeric(10,2),
    taxbl_amt_c numeric(10,2),
    taxbl_amt_d numeric(10,2),
    taxbl_amt_e numeric(10,2),
    tax_rt_a numeric(5,2),
    tax_rt_b numeric(5,2),
    tax_rt_c numeric(5,2),
    tax_rt_d numeric(5,2),
    tax_rt_e numeric(5,2),
    tax_amt_a numeric(10,2),
    tax_amt_b numeric(10,2),
    tax_amt_c numeric(10,2),
    tax_amt_d numeric(10,2),
    tax_amt_e numeric(10,2),
    tot_taxbl_amt numeric(10,2),
    tot_tax_amt numeric(10,2),
    tot_amt numeric(10,2),
    prchr_acptc_yn text,
    remark text,
    regr_id text,
    regr_nm text,
    modr_id text,
    modr_nm text,
    trd_invc_no text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: shift_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shift_readings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shift_id uuid,
    branch_id uuid,
    reading_type text NOT NULL,
    nozzle_id uuid,
    tank_id uuid,
    closing_reading numeric,
    opening_reading numeric,
    created_at timestamp with time zone DEFAULT now(),
    stock_received numeric DEFAULT 0,
    CONSTRAINT shift_readings_reading_type_check CHECK ((reading_type = ANY (ARRAY['nozzle'::text, 'tank'::text])))
);


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shifts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    staff_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    opening_cash numeric(10,2) DEFAULT 0,
    closing_cash numeric(10,2),
    total_sales numeric(10,2) DEFAULT 0,
    status text DEFAULT 'open'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    user_id uuid,
    username character varying(255),
    full_name character varying(255) NOT NULL,
    email character varying(255),
    phone_number character varying(50),
    role character varying(50) DEFAULT 'attendant'::character varying,
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    attendant_code character varying(10),
    code_generated_at timestamp with time zone,
    failed_code_attempts integer DEFAULT 0,
    locked_until timestamp with time zone
);


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_adjustments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tank_id uuid,
    adjustment_type text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    previous_stock numeric(10,2) NOT NULL,
    new_stock numeric(10,2) NOT NULL,
    reason text,
    requested_by text,
    approved_by text,
    approval_status text DEFAULT 'pending'::text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    kra_sync_status character varying(50) DEFAULT 'pending'::character varying
);


--
-- Name: stock_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_master (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    item_cd text NOT NULL,
    rsd_qty numeric(10,2),
    regr_nm text,
    regr_id text,
    modr_nm text,
    modr_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: stock_movement_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movement_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    stock_movement_id uuid,
    item_seq integer,
    item_cd text,
    item_cls_cd text,
    item_nm text,
    bcd text,
    pkg_unit_cd text,
    pkg numeric(10,2),
    qty_unit_cd text,
    qty numeric(10,2),
    item_expr_dt date,
    prc numeric(10,2),
    sply_amt numeric(10,2),
    tot_dc_amt numeric(10,2),
    taxbl_amt numeric(10,2),
    tax_ty_cd text,
    tax_amt numeric(10,2),
    tot_amt numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tin text NOT NULL,
    bhf_id text NOT NULL,
    sar_no integer,
    org_sar_no integer,
    reg_ty_cd text,
    cust_tin text,
    cust_bhf_id text,
    cust_nm text,
    sar_ty_cd text,
    ocrn_dt date,
    tot_item_cnt integer,
    tot_taxbl_amt numeric(10,2),
    tot_tax_amt numeric(10,2),
    tot_amt numeric(10,2),
    remark text,
    regr_id text,
    regr_nm text,
    modr_id text,
    modr_nm text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    kra_status text DEFAULT 'pending'::text,
    kra_response jsonb,
    kra_synced_at timestamp with time zone
);


--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transfers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    from_branch_id uuid,
    to_branch_id uuid,
    from_tank_id uuid,
    to_tank_id uuid,
    quantity numeric(10,2) NOT NULL,
    transfer_date timestamp with time zone DEFAULT now(),
    approval_status text DEFAULT 'pending'::text,
    requested_by text,
    approved_by text,
    approved_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    from_previous_stock numeric,
    from_new_stock numeric,
    to_previous_stock numeric,
    to_new_stock numeric,
    status text DEFAULT 'pending'::text
);


--
-- Name: support_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_tickets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_number character varying(20) NOT NULL,
    vendor_id uuid,
    branch_id uuid,
    category_id uuid,
    subject character varying(255) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'open'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    assigned_to uuid,
    created_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: tanks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tanks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    branch_id uuid,
    tank_name text NOT NULL,
    fuel_type text NOT NULL,
    capacity numeric(10,2) NOT NULL,
    current_stock numeric(10,2) DEFAULT 0,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    kra_item_cd text,
    last_kra_synced_stock numeric DEFAULT 0,
    kra_sync_status text DEFAULT 'pending'::text,
    item_id uuid
);


--
-- Name: ticket_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(20) DEFAULT '#3B82F6'::character varying,
    priority_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ticket_id uuid,
    sender_id uuid,
    message text NOT NULL,
    is_internal boolean DEFAULT false,
    attachments jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email text,
    username text,
    phone_number text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    password_hash text,
    role character varying(20) DEFAULT 'vendor'::character varying
);


--
-- Name: vendor_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_partners (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid NOT NULL,
    partner_type character varying(20) NOT NULL,
    name character varying(255) NOT NULL,
    tin character varying(50),
    physical_address text,
    contact_person character varying(255),
    phone character varying(50),
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT vendor_partners_partner_type_check CHECK (((partner_type)::text = ANY ((ARRAY['supplier'::character varying, 'transporter'::character varying])::text[]))),
    CONSTRAINT vendor_partners_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


--
-- Name: vendor_po_sequences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_po_sequences (
    vendor_id uuid NOT NULL,
    next_po_number integer DEFAULT 1
);


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(50),
    address text,
    logo_url text,
    status character varying(20) DEFAULT 'active'::character varying,
    billing_email character varying(255),
    billing_address text,
    subscription_plan character varying(50) DEFAULT 'basic'::character varying,
    subscription_status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    kra_pin character varying(20),
    item_count integer DEFAULT 0
);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: kra_codelists id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kra_codelists ALTER COLUMN id SET DEFAULT nextval('public.kra_codelists_id_seq'::regclass);


--
-- Name: kra_item_classifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kra_item_classifications ALTER COLUMN id SET DEFAULT nextval('public.kra_item_classifications_id_seq'::regclass);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: api_logs api_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_pkey PRIMARY KEY (id);


--
-- Name: billing_products billing_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_products
    ADD CONSTRAINT billing_products_pkey PRIMARY KEY (id);


--
-- Name: billing_rates billing_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_rates
    ADD CONSTRAINT billing_rates_pkey PRIMARY KEY (id);


--
-- Name: branch_insurances branch_insurances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_insurances
    ADD CONSTRAINT branch_insurances_pkey PRIMARY KEY (id);


--
-- Name: branch_items branch_items_branch_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_items
    ADD CONSTRAINT branch_items_branch_id_item_id_key UNIQUE (branch_id, item_id);


--
-- Name: branch_items branch_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_items
    ADD CONSTRAINT branch_items_pkey PRIMARY KEY (id);


--
-- Name: branch_kra_counters branch_kra_counters_branch_id_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_kra_counters
    ADD CONSTRAINT branch_kra_counters_branch_id_endpoint_key UNIQUE (branch_id, endpoint);


--
-- Name: branch_kra_counters branch_kra_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_kra_counters
    ADD CONSTRAINT branch_kra_counters_pkey PRIMARY KEY (id);


--
-- Name: branch_logs branch_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_logs
    ADD CONSTRAINT branch_logs_pkey PRIMARY KEY (id);


--
-- Name: branch_users branch_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_users
    ADD CONSTRAINT branch_users_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: credit_notes credit_notes_credit_note_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT credit_notes_credit_note_number_key UNIQUE (credit_note_number);


--
-- Name: credit_notes credit_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT credit_notes_pkey PRIMARY KEY (id);


--
-- Name: customer_branches customer_branches_customer_id_branch_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_branches
    ADD CONSTRAINT customer_branches_customer_id_branch_id_key UNIQUE (customer_id, branch_id);


--
-- Name: customer_branches customer_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_branches
    ADD CONSTRAINT customer_branches_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: device_initialization device_initialization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_initialization
    ADD CONSTRAINT device_initialization_pkey PRIMARY KEY (id);


--
-- Name: dispenser_tanks dispenser_tanks_dispenser_id_tank_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispenser_tanks
    ADD CONSTRAINT dispenser_tanks_dispenser_id_tank_id_key UNIQUE (dispenser_id, tank_id);


--
-- Name: dispenser_tanks dispenser_tanks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispenser_tanks
    ADD CONSTRAINT dispenser_tanks_pkey PRIMARY KEY (id);


--
-- Name: dispensers dispensers_branch_id_dispenser_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispensers
    ADD CONSTRAINT dispensers_branch_id_dispenser_number_key UNIQUE (branch_id, dispenser_number);


--
-- Name: dispensers dispensers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispensers
    ADD CONSTRAINT dispensers_pkey PRIMARY KEY (id);


--
-- Name: hardware hardware_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_pkey PRIMARY KEY (id);


--
-- Name: hardware hardware_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_serial_number_key UNIQUE (serial_number);


--
-- Name: imported_items imported_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imported_items
    ADD CONSTRAINT imported_items_pkey PRIMARY KEY (id);


--
-- Name: invoice_branches invoice_branches_invoice_id_branch_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_branches
    ADD CONSTRAINT invoice_branches_invoice_id_branch_id_key UNIQUE (invoice_id, branch_id);


--
-- Name: invoice_branches invoice_branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_branches
    ADD CONSTRAINT invoice_branches_pkey PRIMARY KEY (id);


--
-- Name: invoice_line_items invoice_line_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: item_compositions item_compositions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_compositions
    ADD CONSTRAINT item_compositions_pkey PRIMARY KEY (id);


--
-- Name: items items_branch_item_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_branch_item_code_unique UNIQUE (branch_id, item_code);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: items items_vendor_id_item_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_vendor_id_item_code_unique UNIQUE (vendor_id, item_code);


--
-- Name: kra_codelists kra_codelists_bhf_id_cd_cls_cd_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kra_codelists
    ADD CONSTRAINT kra_codelists_bhf_id_cd_cls_cd_key UNIQUE (bhf_id, cd_cls, cd);


--
-- Name: kra_codelists kra_codelists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kra_codelists
    ADD CONSTRAINT kra_codelists_pkey PRIMARY KEY (id);


--
-- Name: kra_item_classifications kra_item_classifications_bhf_id_item_cls_cd_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kra_item_classifications
    ADD CONSTRAINT kra_item_classifications_bhf_id_item_cls_cd_key UNIQUE (bhf_id, item_cls_cd);


--
-- Name: kra_item_classifications kra_item_classifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kra_item_classifications
    ADD CONSTRAINT kra_item_classifications_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: loyalty_transactions loyalty_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id);


--
-- Name: notices notices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: nozzles nozzles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nozzles
    ADD CONSTRAINT nozzles_pkey PRIMARY KEY (id);


--
-- Name: onboarding_requests onboarding_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_requests
    ADD CONSTRAINT onboarding_requests_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: po_acceptance_dispenser_readings po_acceptance_dispenser_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_dispenser_readings
    ADD CONSTRAINT po_acceptance_dispenser_readings_pkey PRIMARY KEY (id);


--
-- Name: po_acceptance_nozzle_readings po_acceptance_nozzle_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_nozzle_readings
    ADD CONSTRAINT po_acceptance_nozzle_readings_pkey PRIMARY KEY (id);


--
-- Name: po_acceptance_tank_readings po_acceptance_tank_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_tank_readings
    ADD CONSTRAINT po_acceptance_tank_readings_pkey PRIMARY KEY (id);


--
-- Name: printer_logs printer_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printer_logs
    ADD CONSTRAINT printer_logs_pkey PRIMARY KEY (id);


--
-- Name: pump_callback_events pump_callback_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pump_callback_events
    ADD CONSTRAINT pump_callback_events_pkey PRIMARY KEY (id);


--
-- Name: pump_fuel_grade_mappings pump_fuel_grade_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pump_fuel_grade_mappings
    ADD CONSTRAINT pump_fuel_grade_mappings_pkey PRIMARY KEY (id);


--
-- Name: pump_fuel_grade_mappings pump_fuel_grade_mappings_pts_fuel_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pump_fuel_grade_mappings
    ADD CONSTRAINT pump_fuel_grade_mappings_pts_fuel_unique UNIQUE (pts_id, fuel_grade_id);


--
-- Name: pump_transactions pump_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pump_transactions
    ADD CONSTRAINT pump_transactions_pkey PRIMARY KEY (id);


--
-- Name: pump_transactions pump_transactions_pts_id_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pump_transactions
    ADD CONSTRAINT pump_transactions_pts_id_transaction_id_key UNIQUE (pts_id, transaction_id);


--
-- Name: purchase_order_acceptances purchase_order_acceptances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_acceptances
    ADD CONSTRAINT purchase_order_acceptances_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_vendor_id_po_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_po_number_key UNIQUE (vendor_id, po_number);


--
-- Name: purchase_transaction_items purchase_transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_transaction_items
    ADD CONSTRAINT purchase_transaction_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_transactions purchase_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_transactions
    ADD CONSTRAINT purchase_transactions_pkey PRIMARY KEY (id);


--
-- Name: sales_people sales_people_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_people
    ADD CONSTRAINT sales_people_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sales_receipts sales_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_receipts
    ADD CONSTRAINT sales_receipts_pkey PRIMARY KEY (id);


--
-- Name: sales_transaction_items sales_transaction_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_transaction_items
    ADD CONSTRAINT sales_transaction_items_pkey PRIMARY KEY (id);


--
-- Name: sales_transactions sales_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_transactions
    ADD CONSTRAINT sales_transactions_pkey PRIMARY KEY (id);


--
-- Name: shift_readings shift_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_readings
    ADD CONSTRAINT shift_readings_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: staff staff_attendant_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_attendant_code_unique UNIQUE (attendant_code);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff staff_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_username_key UNIQUE (username);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_master stock_master_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_master
    ADD CONSTRAINT stock_master_pkey PRIMARY KEY (id);


--
-- Name: stock_movement_items stock_movement_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movement_items
    ADD CONSTRAINT stock_movement_items_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Name: support_tickets support_tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: tanks tanks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tanks
    ADD CONSTRAINT tanks_pkey PRIMARY KEY (id);


--
-- Name: ticket_categories ticket_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_categories
    ADD CONSTRAINT ticket_categories_pkey PRIMARY KEY (id);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendor_partners vendor_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_partners
    ADD CONSTRAINT vendor_partners_pkey PRIMARY KEY (id);


--
-- Name: vendor_partners vendor_partners_vendor_id_partner_type_tin_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_partners
    ADD CONSTRAINT vendor_partners_vendor_id_partner_type_tin_key UNIQUE (vendor_id, partner_type, tin);


--
-- Name: vendor_po_sequences vendor_po_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_po_sequences
    ADD CONSTRAINT vendor_po_sequences_pkey PRIMARY KEY (vendor_id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: branches_user_bhf_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX branches_user_bhf_unique ON public.branches USING btree (user_id, bhf_id);


--
-- Name: idx_activity_logs_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_branch_id ON public.activity_logs USING btree (branch_id);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_activity_logs_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_vendor_id ON public.activity_logs USING btree (vendor_id);


--
-- Name: idx_api_logs_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_logs_branch_id ON public.api_logs USING btree (branch_id);


--
-- Name: idx_api_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_api_logs_created_at ON public.api_logs USING btree (created_at);


--
-- Name: idx_branch_items_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_items_branch_id ON public.branch_items USING btree (branch_id);


--
-- Name: idx_branch_items_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_items_item_id ON public.branch_items USING btree (item_id);


--
-- Name: idx_branch_logs_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_logs_branch_id ON public.branch_logs USING btree (branch_id);


--
-- Name: idx_branch_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branch_logs_created_at ON public.branch_logs USING btree (created_at DESC);


--
-- Name: idx_branches_bhf_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_bhf_id ON public.branches USING btree (bhf_id);


--
-- Name: idx_branches_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_user_id ON public.branches USING btree (user_id);


--
-- Name: idx_branches_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_branches_vendor_id ON public.branches USING btree (vendor_id);


--
-- Name: idx_credit_notes_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_credit_notes_branch_id ON public.credit_notes USING btree (branch_id);


--
-- Name: idx_customer_branches_branch; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_branches_branch ON public.customer_branches USING btree (branch_id);


--
-- Name: idx_customer_branches_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_branches_customer ON public.customer_branches USING btree (customer_id);


--
-- Name: idx_customers_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customers_branch_id ON public.customers USING btree (branch_id);


--
-- Name: idx_device_initialization_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_initialization_branch_id ON public.device_initialization USING btree (branch_id);


--
-- Name: idx_dispensers_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dispensers_branch_id ON public.dispensers USING btree (branch_id);


--
-- Name: idx_hardware_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_hardware_branch_id ON public.hardware USING btree (branch_id);


--
-- Name: idx_invoice_items_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_line_items USING btree (invoice_id);


--
-- Name: idx_invoices_next_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_next_date ON public.invoices USING btree (next_invoice_date) WHERE (next_invoice_date IS NOT NULL);


--
-- Name: idx_invoices_recurring; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_recurring ON public.invoices USING btree (is_recurring) WHERE (is_recurring = true);


--
-- Name: idx_invoices_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);


--
-- Name: idx_invoices_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_invoices_vendor_id ON public.invoices USING btree (vendor_id);


--
-- Name: idx_items_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_items_branch_id ON public.items USING btree (branch_id);


--
-- Name: idx_kra_codelists_bhf_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kra_codelists_bhf_id ON public.kra_codelists USING btree (bhf_id);


--
-- Name: idx_kra_item_classifications_bhf_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kra_item_classifications_bhf_id ON public.kra_item_classifications USING btree (bhf_id);


--
-- Name: idx_loyalty_transactions_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_transactions_branch_id ON public.loyalty_transactions USING btree (branch_id);


--
-- Name: idx_loyalty_transactions_sale_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loyalty_transactions_sale_id ON public.loyalty_transactions USING btree (sale_id);


--
-- Name: idx_notices_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notices_branch_id ON public.notices USING btree (branch_id);


--
-- Name: idx_nozzles_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nozzles_branch_id ON public.nozzles USING btree (branch_id);


--
-- Name: idx_nozzles_dispenser_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nozzles_dispenser_id ON public.nozzles USING btree (dispenser_id);


--
-- Name: idx_payments_invoice_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payments_invoice_id ON public.payments USING btree (invoice_id);


--
-- Name: idx_po_acceptances_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_acceptances_branch_id ON public.purchase_order_acceptances USING btree (branch_id);


--
-- Name: idx_po_acceptances_po_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_acceptances_po_id ON public.purchase_order_acceptances USING btree (purchase_order_id);


--
-- Name: idx_po_items_po_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_items_po_id ON public.purchase_order_items USING btree (purchase_order_id);


--
-- Name: idx_po_nozzle_readings_acceptance; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_nozzle_readings_acceptance ON public.po_acceptance_nozzle_readings USING btree (acceptance_id);


--
-- Name: idx_po_nozzle_readings_nozzle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_po_nozzle_readings_nozzle ON public.po_acceptance_nozzle_readings USING btree (nozzle_id);


--
-- Name: idx_printer_logs_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_printer_logs_branch_id ON public.printer_logs USING btree (branch_id);


--
-- Name: idx_printer_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_printer_logs_created_at ON public.printer_logs USING btree (created_at DESC);


--
-- Name: idx_pump_callback_events_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pump_callback_events_created ON public.pump_callback_events USING btree (created_at DESC);


--
-- Name: idx_pump_callback_events_pts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pump_callback_events_pts ON public.pump_callback_events USING btree (pts_id);


--
-- Name: idx_purchase_orders_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_branch_id ON public.purchase_orders USING btree (branch_id);


--
-- Name: idx_purchase_orders_issued_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_issued_at ON public.purchase_orders USING btree (issued_at);


--
-- Name: idx_purchase_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_status ON public.purchase_orders USING btree (status);


--
-- Name: idx_purchase_orders_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_orders_vendor_id ON public.purchase_orders USING btree (vendor_id);


--
-- Name: idx_purchase_transactions_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_transactions_branch_id ON public.purchase_transactions USING btree (branch_id);


--
-- Name: idx_sales_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_branch_id ON public.sales USING btree (branch_id);


--
-- Name: idx_sales_sale_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_sale_date ON public.sales USING btree (sale_date);


--
-- Name: idx_sales_shift_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_shift_id ON public.sales USING btree (shift_id);


--
-- Name: idx_sales_staff_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_staff_id ON public.sales USING btree (staff_id);


--
-- Name: idx_sales_transactions_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_transactions_branch_id ON public.sales_transactions USING btree (branch_id);


--
-- Name: idx_shifts_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shifts_branch_id ON public.shifts USING btree (branch_id);


--
-- Name: idx_shifts_staff_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shifts_staff_id ON public.shifts USING btree (staff_id);


--
-- Name: idx_staff_attendant_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_attendant_code ON public.staff USING btree (branch_id, attendant_code) WHERE (attendant_code IS NOT NULL);


--
-- Name: idx_staff_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_branch_id ON public.staff USING btree (branch_id);


--
-- Name: idx_staff_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_staff_user_id ON public.staff USING btree (user_id);


--
-- Name: idx_stock_adjustments_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_adjustments_branch_id ON public.stock_adjustments USING btree (branch_id);


--
-- Name: idx_stock_movements_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_movements_branch_id ON public.stock_movements USING btree (branch_id);


--
-- Name: idx_stock_transfers_from_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_transfers_from_branch_id ON public.stock_transfers USING btree (from_branch_id);


--
-- Name: idx_stock_transfers_to_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_transfers_to_branch_id ON public.stock_transfers USING btree (to_branch_id);


--
-- Name: idx_tanks_branch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tanks_branch_id ON public.tanks USING btree (branch_id);


--
-- Name: idx_ticket_messages_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages USING btree (ticket_id);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_status ON public.support_tickets USING btree (status);


--
-- Name: idx_tickets_vendor_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_vendor_id ON public.support_tickets USING btree (vendor_id);


--
-- Name: pump_fuel_grade_mappings_global_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX pump_fuel_grade_mappings_global_idx ON public.pump_fuel_grade_mappings USING btree (fuel_grade_id) WHERE (pts_id IS NULL);


--
-- Name: branches update_branches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dispensers update_dispensers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_dispensers_updated_at BEFORE UPDATE ON public.dispensers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: items update_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: loyalty_transactions update_loyalty_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_loyalty_transactions_updated_at BEFORE UPDATE ON public.loyalty_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nozzles update_nozzles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nozzles_updated_at BEFORE UPDATE ON public.nozzles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sales update_sales_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shifts update_shifts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: staff update_staff_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tanks update_tanks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tanks_updated_at BEFORE UPDATE ON public.tanks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: api_logs api_logs_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branch_insurances branch_insurances_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_insurances
    ADD CONSTRAINT branch_insurances_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branch_items branch_items_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_items
    ADD CONSTRAINT branch_items_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branch_items branch_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_items
    ADD CONSTRAINT branch_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: branch_kra_counters branch_kra_counters_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_kra_counters
    ADD CONSTRAINT branch_kra_counters_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branch_logs branch_logs_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_logs
    ADD CONSTRAINT branch_logs_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branch_logs branch_logs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_logs
    ADD CONSTRAINT branch_logs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: branch_users branch_users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branch_users
    ADD CONSTRAINT branch_users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: branches branches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: branches branches_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: credit_notes credit_notes_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT credit_notes_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: customer_branches customer_branches_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_branches
    ADD CONSTRAINT customer_branches_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: customer_branches customer_branches_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_branches
    ADD CONSTRAINT customer_branches_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customers customers_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: device_initialization device_initialization_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_initialization
    ADD CONSTRAINT device_initialization_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: dispenser_tanks dispenser_tanks_dispenser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispenser_tanks
    ADD CONSTRAINT dispenser_tanks_dispenser_id_fkey FOREIGN KEY (dispenser_id) REFERENCES public.dispensers(id) ON DELETE CASCADE;


--
-- Name: dispenser_tanks dispenser_tanks_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispenser_tanks
    ADD CONSTRAINT dispenser_tanks_tank_id_fkey FOREIGN KEY (tank_id) REFERENCES public.tanks(id) ON DELETE CASCADE;


--
-- Name: dispensers dispensers_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispensers
    ADD CONSTRAINT dispensers_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: dispensers dispensers_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispensers
    ADD CONSTRAINT dispensers_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: dispensers dispensers_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dispensers
    ADD CONSTRAINT dispensers_tank_id_fkey FOREIGN KEY (tank_id) REFERENCES public.tanks(id);


--
-- Name: credit_notes fk_credit_notes_sale; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.credit_notes
    ADD CONSTRAINT fk_credit_notes_sale FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: sales fk_sales_credit_note; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fk_sales_credit_note FOREIGN KEY (credit_note_id) REFERENCES public.credit_notes(id) ON DELETE SET NULL;


--
-- Name: hardware hardware_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hardware
    ADD CONSTRAINT hardware_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: imported_items imported_items_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.imported_items
    ADD CONSTRAINT imported_items_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: invoice_branches invoice_branches_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_branches
    ADD CONSTRAINT invoice_branches_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: invoice_branches invoice_branches_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_branches
    ADD CONSTRAINT invoice_branches_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_line_items invoice_line_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_line_items
    ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: invoices invoices_parent_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_parent_invoice_id_fkey FOREIGN KEY (parent_invoice_id) REFERENCES public.invoices(id);


--
-- Name: invoices invoices_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: item_compositions item_compositions_composite_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_compositions
    ADD CONSTRAINT item_compositions_composite_item_id_fkey FOREIGN KEY (composite_item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: item_compositions item_compositions_parent_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_compositions
    ADD CONSTRAINT item_compositions_parent_item_id_fkey FOREIGN KEY (parent_item_id) REFERENCES public.items(id) ON DELETE CASCADE;


--
-- Name: items items_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: items items_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: leads leads_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.sales_people(id);


--
-- Name: loyalty_transactions loyalty_transactions_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: loyalty_transactions loyalty_transactions_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- Name: notices notices_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notices
    ADD CONSTRAINT notices_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: nozzles nozzles_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nozzles
    ADD CONSTRAINT nozzles_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: nozzles nozzles_dispenser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nozzles
    ADD CONSTRAINT nozzles_dispenser_id_fkey FOREIGN KEY (dispenser_id) REFERENCES public.dispensers(id) ON DELETE CASCADE;


--
-- Name: onboarding_requests onboarding_requests_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_requests
    ADD CONSTRAINT onboarding_requests_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: onboarding_requests onboarding_requests_merchant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_requests
    ADD CONSTRAINT onboarding_requests_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.vendors(id);


--
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: payment_transactions payment_transactions_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: po_acceptance_dispenser_readings po_acceptance_dispenser_readings_acceptance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_dispenser_readings
    ADD CONSTRAINT po_acceptance_dispenser_readings_acceptance_id_fkey FOREIGN KEY (acceptance_id) REFERENCES public.purchase_order_acceptances(id) ON DELETE CASCADE;


--
-- Name: po_acceptance_dispenser_readings po_acceptance_dispenser_readings_dispenser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_dispenser_readings
    ADD CONSTRAINT po_acceptance_dispenser_readings_dispenser_id_fkey FOREIGN KEY (dispenser_id) REFERENCES public.dispensers(id);


--
-- Name: po_acceptance_nozzle_readings po_acceptance_nozzle_readings_acceptance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_nozzle_readings
    ADD CONSTRAINT po_acceptance_nozzle_readings_acceptance_id_fkey FOREIGN KEY (acceptance_id) REFERENCES public.purchase_order_acceptances(id) ON DELETE CASCADE;


--
-- Name: po_acceptance_nozzle_readings po_acceptance_nozzle_readings_nozzle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_nozzle_readings
    ADD CONSTRAINT po_acceptance_nozzle_readings_nozzle_id_fkey FOREIGN KEY (nozzle_id) REFERENCES public.nozzles(id);


--
-- Name: po_acceptance_tank_readings po_acceptance_tank_readings_acceptance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_tank_readings
    ADD CONSTRAINT po_acceptance_tank_readings_acceptance_id_fkey FOREIGN KEY (acceptance_id) REFERENCES public.purchase_order_acceptances(id) ON DELETE CASCADE;


--
-- Name: po_acceptance_tank_readings po_acceptance_tank_readings_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.po_acceptance_tank_readings
    ADD CONSTRAINT po_acceptance_tank_readings_tank_id_fkey FOREIGN KEY (tank_id) REFERENCES public.tanks(id);


--
-- Name: printer_logs printer_logs_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.printer_logs
    ADD CONSTRAINT printer_logs_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: pump_fuel_grade_mappings pump_fuel_grade_mappings_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pump_fuel_grade_mappings
    ADD CONSTRAINT pump_fuel_grade_mappings_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: pump_transactions pump_transactions_callback_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pump_transactions
    ADD CONSTRAINT pump_transactions_callback_event_id_fkey FOREIGN KEY (callback_event_id) REFERENCES public.pump_callback_events(id);


--
-- Name: purchase_order_acceptances purchase_order_acceptances_accepted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_acceptances
    ADD CONSTRAINT purchase_order_acceptances_accepted_by_fkey FOREIGN KEY (accepted_by) REFERENCES public.users(id);


--
-- Name: purchase_order_acceptances purchase_order_acceptances_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_acceptances
    ADD CONSTRAINT purchase_order_acceptances_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: purchase_order_acceptances purchase_order_acceptances_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_acceptances
    ADD CONSTRAINT purchase_order_acceptances_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.vendor_partners(id);


--
-- Name: purchase_orders purchase_orders_transporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_transporter_id_fkey FOREIGN KEY (transporter_id) REFERENCES public.vendor_partners(id);


--
-- Name: purchase_orders purchase_orders_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: purchase_transaction_items purchase_transaction_items_purchase_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_transaction_items
    ADD CONSTRAINT purchase_transaction_items_purchase_transaction_id_fkey FOREIGN KEY (purchase_transaction_id) REFERENCES public.purchase_transactions(id) ON DELETE CASCADE;


--
-- Name: purchase_transactions purchase_transactions_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_transactions
    ADD CONSTRAINT purchase_transactions_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: sales sales_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: sales sales_nozzle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_nozzle_id_fkey FOREIGN KEY (nozzle_id) REFERENCES public.nozzles(id) ON DELETE SET NULL;


--
-- Name: sales_receipts sales_receipts_sales_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_receipts
    ADD CONSTRAINT sales_receipts_sales_transaction_id_fkey FOREIGN KEY (sales_transaction_id) REFERENCES public.sales_transactions(id) ON DELETE CASCADE;


--
-- Name: sales sales_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE SET NULL;


--
-- Name: sales sales_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: sales_transaction_items sales_transaction_items_sales_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_transaction_items
    ADD CONSTRAINT sales_transaction_items_sales_transaction_id_fkey FOREIGN KEY (sales_transaction_id) REFERENCES public.sales_transactions(id) ON DELETE CASCADE;


--
-- Name: sales_transactions sales_transactions_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_transactions
    ADD CONSTRAINT sales_transactions_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: shift_readings shift_readings_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_readings
    ADD CONSTRAINT shift_readings_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: shift_readings shift_readings_nozzle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_readings
    ADD CONSTRAINT shift_readings_nozzle_id_fkey FOREIGN KEY (nozzle_id) REFERENCES public.nozzles(id);


--
-- Name: shift_readings shift_readings_shift_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_readings
    ADD CONSTRAINT shift_readings_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE CASCADE;


--
-- Name: shift_readings shift_readings_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shift_readings
    ADD CONSTRAINT shift_readings_tank_id_fkey FOREIGN KEY (tank_id) REFERENCES public.tanks(id);


--
-- Name: shifts shifts_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: shifts shifts_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: staff staff_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: staff staff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: stock_adjustments stock_adjustments_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: stock_adjustments stock_adjustments_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_tank_id_fkey FOREIGN KEY (tank_id) REFERENCES public.tanks(id) ON DELETE CASCADE;


--
-- Name: stock_master stock_master_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_master
    ADD CONSTRAINT stock_master_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: stock_movement_items stock_movement_items_stock_movement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movement_items
    ADD CONSTRAINT stock_movement_items_stock_movement_id_fkey FOREIGN KEY (stock_movement_id) REFERENCES public.stock_movements(id) ON DELETE CASCADE;


--
-- Name: stock_movements stock_movements_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: stock_transfers stock_transfers_from_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: stock_transfers stock_transfers_from_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_from_tank_id_fkey FOREIGN KEY (from_tank_id) REFERENCES public.tanks(id) ON DELETE SET NULL;


--
-- Name: stock_transfers stock_transfers_to_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: stock_transfers stock_transfers_to_tank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_to_tank_id_fkey FOREIGN KEY (to_tank_id) REFERENCES public.tanks(id) ON DELETE SET NULL;


--
-- Name: support_tickets support_tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: support_tickets support_tickets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.ticket_categories(id);


--
-- Name: support_tickets support_tickets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: support_tickets support_tickets_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: tanks tanks_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tanks
    ADD CONSTRAINT tanks_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: tanks tanks_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tanks
    ADD CONSTRAINT tanks_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: ticket_messages ticket_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE;


--
-- Name: vendor_partners vendor_partners_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_partners
    ADD CONSTRAINT vendor_partners_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- Name: vendor_po_sequences vendor_po_sequences_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_po_sequences
    ADD CONSTRAINT vendor_po_sequences_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


