-- Migration: Create branch_logs table for KRA initialization logging
-- Run this on production database before deploying

CREATE TABLE IF NOT EXISTS branch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id),
  log_type VARCHAR(50),
  endpoint TEXT,
  request_payload JSONB,
  response_payload JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_branch_logs_branch_id ON branch_logs(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_logs_created_at ON branch_logs(created_at DESC);

-- If table already exists with varchar(255), run this to fix:
-- ALTER TABLE branch_logs ALTER COLUMN endpoint TYPE text;
