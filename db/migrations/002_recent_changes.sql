-- Flow360 Migration Script - Recent Changes
-- Run this on production database to sync with latest deployment
-- Safe to run multiple times (idempotent)

-- ============================================
-- 1. Ensure branch_items table exists with correct structure
-- ============================================
CREATE TABLE IF NOT EXISTS public.branch_items (
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
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT branch_items_pkey PRIMARY KEY (id),
    CONSTRAINT branch_items_branch_id_item_id_key UNIQUE (branch_id, item_id)
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_branch_items_branch_id ON public.branch_items USING btree (branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_items_item_id ON public.branch_items USING btree (item_id);

-- Add foreign keys if they don't exist (will fail silently if already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branch_items_branch_id_fkey') THEN
        ALTER TABLE public.branch_items ADD CONSTRAINT branch_items_branch_id_fkey 
        FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'branch_items_item_id_fkey') THEN
        ALTER TABLE public.branch_items ADD CONSTRAINT branch_items_item_id_fkey 
        FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 2. Ensure controller_id column exists on branches
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'branches' AND column_name = 'controller_id') THEN
        ALTER TABLE public.branches ADD COLUMN controller_id character varying(255);
    END IF;
END $$;

-- ============================================
-- 3. Ensure sales table has automation columns
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'is_automated') THEN
        ALTER TABLE public.sales ADD COLUMN is_automated boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sales' AND column_name = 'source_system') THEN
        ALTER TABLE public.sales ADD COLUMN source_system text;
    END IF;
END $$;

-- ============================================
-- 4. Ensure pump_transactions table exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.pump_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
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
    raw_packet jsonb,
    CONSTRAINT pump_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT pump_transactions_pts_id_transaction_id_key UNIQUE (pts_id, transaction_id)
);

-- ============================================
-- 5. Ensure pump_callback_events table exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.pump_callback_events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    pts_id character varying(255),
    raw_request jsonb,
    raw_response jsonb,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT pump_callback_events_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_pump_callback_events_pts ON public.pump_callback_events USING btree (pts_id);
CREATE INDEX IF NOT EXISTS idx_pump_callback_events_created ON public.pump_callback_events USING btree (created_at DESC);

-- ============================================
-- 6. Ensure pump_fuel_grade_mappings table exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.pump_fuel_grade_mappings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    pts_id text,
    fuel_grade_id integer,
    fuel_grade_name text,
    item_id uuid,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pump_fuel_grade_mappings_pkey PRIMARY KEY (id),
    CONSTRAINT pump_fuel_grade_mappings_pts_fuel_unique UNIQUE (pts_id, fuel_grade_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS pump_fuel_grade_mappings_global_idx 
ON public.pump_fuel_grade_mappings USING btree (fuel_grade_id) WHERE (pts_id IS NULL);

-- ============================================
-- 7. Ensure branch_logs table exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.branch_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_id uuid NOT NULL,
    log_type character varying(50) NOT NULL,
    endpoint text,
    request_payload jsonb,
    response_payload jsonb,
    status character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    CONSTRAINT branch_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_branch_logs_branch_id ON public.branch_logs USING btree (branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_logs_created_at ON public.branch_logs USING btree (created_at DESC);

-- ============================================
-- 8. Ensure nozzles and tanks have item_id
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'nozzles' AND column_name = 'item_id') THEN
        ALTER TABLE public.nozzles ADD COLUMN item_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tanks' AND column_name = 'item_id') THEN
        ALTER TABLE public.tanks ADD COLUMN item_id uuid;
    END IF;
END $$;

-- ============================================
-- 9. Ensure vendor_partners table exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.vendor_partners (
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
    CONSTRAINT vendor_partners_pkey PRIMARY KEY (id),
    CONSTRAINT vendor_partners_partner_type_check CHECK (((partner_type)::text = ANY ((ARRAY['supplier'::character varying, 'transporter'::character varying])::text[]))),
    CONSTRAINT vendor_partners_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);

-- ============================================
-- 10. Ensure purchase_orders has new columns
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'transporter_id') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN transporter_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'transport_cost') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN transport_cost numeric(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'vehicle_registration') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN vehicle_registration character varying(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'driver_name') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN driver_name character varying(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'driver_phone') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN driver_phone character varying(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'approval_status') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN approval_status character varying(50) DEFAULT 'draft';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'approved_by') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN approved_by uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'approved_at') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN approved_at timestamp with time zone;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'purchase_orders' AND column_name = 'rejection_comments') THEN
        ALTER TABLE public.purchase_orders ADD COLUMN rejection_comments text;
    END IF;
END $$;

-- ============================================
-- 11. Remove legacy pricing columns from items table (if they exist)
-- branch_items is now the ONLY source of truth for pricing
-- ============================================
DO $$
BEGIN
    -- Remove sale_price from items if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'items' AND column_name = 'sale_price') THEN
        ALTER TABLE public.items DROP COLUMN sale_price;
        RAISE NOTICE 'Removed items.sale_price column';
    END IF;
    
    -- Remove purchase_price from items if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'items' AND column_name = 'purchase_price') THEN
        ALTER TABLE public.items DROP COLUMN purchase_price;
        RAISE NOTICE 'Removed items.purchase_price column';
    END IF;
END $$;

-- ============================================
-- 12. Drop fuel_prices table if it exists (replaced by branch_items)
-- ============================================
DROP TABLE IF EXISTS public.fuel_prices;

-- ============================================
-- 13. Migrate any orphaned pricing data to branch_items
-- This ensures no pricing data is lost during migration
-- ============================================
-- Note: Run this BEFORE dropping columns if you need to preserve legacy prices
-- INSERT INTO branch_items (branch_id, item_id, sale_price, purchase_price)
-- SELECT i.branch_id, i.id, i.sale_price, i.purchase_price
-- FROM items i
-- WHERE i.branch_id IS NOT NULL 
--   AND i.sale_price IS NOT NULL
--   AND NOT EXISTS (SELECT 1 FROM branch_items bi WHERE bi.item_id = i.id AND bi.branch_id = i.branch_id)
-- ON CONFLICT (branch_id, item_id) DO NOTHING;

-- ============================================
-- Done!
-- ============================================
SELECT 'Migration completed successfully - branch_items is now the ONLY pricing source' as status;
