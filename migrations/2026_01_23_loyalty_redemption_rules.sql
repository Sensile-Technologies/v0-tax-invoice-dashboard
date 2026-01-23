-- Migration: Add loyalty redemption rules columns
-- Date: 2026-01-23
-- Description: Add redemption rule columns to branches table and redemption tracking to loyalty_transactions

-- Add redemption rule columns to branches
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS redemption_points_per_ksh NUMERIC(10,2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS min_redemption_points NUMERIC(10,2) DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_redemption_percent NUMERIC(5,2) DEFAULT 50;

-- Add redemption tracking columns to loyalty_transactions
ALTER TABLE loyalty_transactions 
ADD COLUMN IF NOT EXISTS points_redeemed NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) DEFAULT 'earn';

-- Add unique index on sale_id for faster conflict handling
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_transactions_sale_id_unique 
ON loyalty_transactions (sale_id) 
WHERE sale_id IS NOT NULL;

-- Add index for faster point balance queries
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_pin 
ON loyalty_transactions (branch_id, customer_pin);

COMMENT ON COLUMN branches.redemption_points_per_ksh IS 'Number of points required for KES 1 discount';
COMMENT ON COLUMN branches.min_redemption_points IS 'Minimum points required before redemption is allowed';
COMMENT ON COLUMN branches.max_redemption_percent IS 'Maximum percentage of transaction that can be covered by points';
COMMENT ON COLUMN loyalty_transactions.points_redeemed IS 'Points redeemed in this transaction';
COMMENT ON COLUMN loyalty_transactions.transaction_type IS 'Type of transaction: earn or redeem';
