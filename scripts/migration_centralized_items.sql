-- Migration script for centralizing item management at vendor HQ level
-- Run these commands on your production database

-- 1. Create branch_items table for branch-level pricing and item availability
CREATE TABLE IF NOT EXISTS branch_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL PRIMARY KEY,
    branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    sale_price numeric(10,2) NOT NULL,
    purchase_price numeric(10,2),
    is_available boolean DEFAULT true,
    kra_status character varying(20) DEFAULT 'pending',
    kra_response text,
    kra_last_synced_at timestamp without time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(branch_id, item_id)
);

-- 2. Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_branch_items_branch_id ON branch_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_items_item_id ON branch_items(item_id);

-- 3. Make branch_id nullable in items table (for vendor-level items)
ALTER TABLE items ALTER COLUMN branch_id DROP NOT NULL;

-- 4. Add unique constraint on vendor_id + item_code for vendor-level uniqueness
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'items_vendor_id_item_code_unique'
    ) THEN
        ALTER TABLE items ADD CONSTRAINT items_vendor_id_item_code_unique UNIQUE (vendor_id, item_code);
    END IF;
END$$;

-- NOTE: After running this migration:
-- 1. Items created at HQ will have branch_id = NULL
-- 2. Branches can assign items and set custom prices via branch_items table
-- 3. Existing branch-specific items will continue to work
-- 4. The API will check both vendor-level items (with branch_items) and legacy branch-level items
