-- Add new columns to branches table for enhanced branch management
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS bhf_id TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS county TEXT,
ADD COLUMN IF NOT EXISTS local_tax_office TEXT,
ADD COLUMN IF NOT EXISTS device_token TEXT,
ADD COLUMN IF NOT EXISTS storage_indices JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN branches.bhf_id IS 'Business Hardware Facility ID for tax compliance';
COMMENT ON COLUMN branches.storage_indices IS 'JSON array of storage configurations (tanks, warehouses, etc.) with dispensers and initial readings';
