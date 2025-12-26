--
-- Flow360 Production Database Migration
-- Only creates objects that don't exist - safe to run multiple times
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET client_min_messages = warning;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function (safe to replace)
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Only run table creation for tables that DON'T exist
-- Check which tables need to be created first

DO $$
BEGIN
    -- Create users table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE public.users (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            email text UNIQUE,
            username text UNIQUE,
            password_hash text,
            role text DEFAULT 'vendor',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create vendors table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
        CREATE TABLE public.vendors (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            name text NOT NULL,
            email text,
            phone text,
            kra_pin text,
            trading_name text,
            address text,
            status text DEFAULT 'active',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create branches table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'branches') THEN
        CREATE TABLE public.branches (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
            vendor_id uuid REFERENCES public.vendors(id),
            name text NOT NULL,
            bhf_id text,
            location text,
            address text,
            county text,
            local_tax_office text,
            manager text,
            email text,
            phone text,
            status text DEFAULT 'active',
            device_token text,
            storage_indices jsonb,
            trading_name varchar(255),
            kra_pin varchar(50),
            server_address varchar(255),
            server_port varchar(10),
            sr_number integer DEFAULT 0,
            invoice_number integer DEFAULT 0,
            is_main boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create staff table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff') THEN
        CREATE TABLE public.staff (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
            user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
            name text NOT NULL,
            email text,
            phone text,
            role text DEFAULT 'cashier',
            status text DEFAULT 'active',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create items table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'items') THEN
        CREATE TABLE public.items (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
            vendor_id uuid REFERENCES public.vendors(id),
            item_code text,
            sku text,
            item_name text NOT NULL,
            description text,
            item_type text,
            class_code text,
            tax_type text,
            origin text,
            batch_number text,
            purchase_price numeric(10,2),
            sale_price numeric(10,2),
            quantity_unit text,
            package_unit text,
            status text DEFAULT 'active',
            kra_status varchar(20) DEFAULT 'pending',
            kra_response text,
            kra_last_synced_at timestamp,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create tanks table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tanks') THEN
        CREATE TABLE public.tanks (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
            item_id uuid REFERENCES public.items(id),
            tank_name text NOT NULL,
            tank_number integer,
            fuel_type text,
            capacity numeric(10,2),
            current_stock numeric(10,2) DEFAULT 0,
            low_stock_threshold numeric(10,2),
            status text DEFAULT 'active',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create dispensers table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dispensers') THEN
        CREATE TABLE public.dispensers (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
            item_id uuid REFERENCES public.items(id),
            tank_id uuid REFERENCES public.tanks(id),
            dispenser_number integer NOT NULL,
            fuel_type text NOT NULL,
            status text DEFAULT 'active',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create nozzles table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nozzles') THEN
        CREATE TABLE public.nozzles (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
            dispenser_id uuid REFERENCES public.dispensers(id) ON DELETE CASCADE,
            tank_id uuid REFERENCES public.tanks(id),
            item_id uuid REFERENCES public.items(id),
            nozzle_number integer NOT NULL,
            fuel_type text NOT NULL,
            initial_meter_reading numeric(10,2) DEFAULT 0,
            status text DEFAULT 'active',
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create sales table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales') THEN
        CREATE TABLE public.sales (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
            shift_id uuid,
            nozzle_id uuid,
            fuel_type text,
            quantity numeric(10,3),
            unit_price numeric(10,2),
            total_amount numeric(12,2),
            payment_method text,
            customer_name text,
            customer_pin text,
            invoice_number text,
            receipt_number text,
            transmission_status text DEFAULT 'pending',
            kra_status text DEFAULT 'pending',
            kra_rcpt_sign text,
            kra_scu_id text,
            kra_cu_inv text,
            kra_internal_data text,
            is_automated boolean DEFAULT false,
            source_system text,
            sale_date timestamp with time zone DEFAULT now(),
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create customers table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        CREATE TABLE public.customers (
            id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
            branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
            tin text NOT NULL,
            bhf_id text NOT NULL,
            cust_tin text,
            cust_no text,
            cust_nm text NOT NULL,
            adrs text,
            tel_no text,
            email text,
            fax_no text,
            use_yn text DEFAULT 'Y',
            remark text,
            regr_nm text,
            regr_id text,
            modr_nm text,
            modr_id text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create pump_callback_events table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pump_callback_events') THEN
        CREATE TABLE public.pump_callback_events (
            id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
            pts_id varchar(255),
            raw_request jsonb,
            raw_response jsonb,
            created_at timestamp DEFAULT now()
        );
    END IF;

    -- Create pump_transactions table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pump_transactions') THEN
        CREATE TABLE public.pump_transactions (
            id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
            packet_id integer,
            pts_id varchar(255),
            pump_number integer,
            nozzle_number integer,
            fuel_grade_id integer,
            fuel_grade_name text,
            transaction_id integer,
            volume numeric(12,3),
            tc_volume numeric(12,3),
            price numeric(10,2),
            amount numeric(12,2),
            total_volume numeric(14,3),
            total_amount numeric(14,2),
            tag text,
            user_id integer,
            configuration_id text,
            transaction_start timestamp,
            transaction_end timestamp,
            callback_event_id uuid,
            sale_id uuid,
            processed boolean DEFAULT false,
            raw_packet jsonb,
            created_at timestamp DEFAULT now(),
            UNIQUE(pts_id, transaction_id)
        );
    END IF;

    -- Create pump_fuel_grade_mappings table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pump_fuel_grade_mappings') THEN
        CREATE TABLE public.pump_fuel_grade_mappings (
            id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
            pts_id text,
            fuel_grade_id integer NOT NULL,
            fuel_grade_name text,
            item_id uuid REFERENCES public.items(id),
            is_active boolean DEFAULT true,
            notes text,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now()
        );
    END IF;

    -- Create leads table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
        CREATE TABLE public.leads (
            id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
            company_name varchar(255) NOT NULL,
            contact_name varchar(255),
            contact_email varchar(255),
            contact_phone varchar(50),
            stage varchar(50) DEFAULT 'contact',
            assigned_to uuid,
            notes text,
            expected_value numeric(12,2),
            expected_close_date date,
            source varchar(100),
            kra_pin varchar(50),
            trading_name varchar(255),
            is_archived boolean DEFAULT false,
            contract_url text,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    END IF;

    -- Create sales_people table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_people') THEN
        CREATE TABLE public.sales_people (
            id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
            name varchar(255) NOT NULL,
            email varchar(255) UNIQUE,
            phone varchar(50),
            is_active boolean DEFAULT true,
            created_at timestamp DEFAULT now(),
            updated_at timestamp DEFAULT now()
        );
    END IF;

    RAISE NOTICE 'Migration completed successfully';
END $$;

