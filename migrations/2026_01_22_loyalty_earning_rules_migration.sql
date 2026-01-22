-- Migration: Add configurable loyalty earning rules to branches
-- Date: 2026-01-22
-- Description: Adds columns for configurable loyalty points earning (per litre or per amount spent)

-- Add loyalty earning configuration columns to branches table
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS loyalty_earn_type VARCHAR(20) DEFAULT 'per_amount';

ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS loyalty_points_per_litre NUMERIC(10,2) DEFAULT 1;

ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS loyalty_points_per_amount NUMERIC(10,2) DEFAULT 1;

ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS loyalty_amount_threshold NUMERIC(10,2) DEFAULT 100;

-- Add comments for documentation
COMMENT ON COLUMN branches.loyalty_earn_type IS 'How loyalty points are earned: per_litre or per_amount';
COMMENT ON COLUMN branches.loyalty_points_per_litre IS 'Points earned per litre of fuel purchased';
COMMENT ON COLUMN branches.loyalty_points_per_amount IS 'Points earned per loyalty_amount_threshold spent';
COMMENT ON COLUMN branches.loyalty_amount_threshold IS 'Amount threshold for earning points (e.g., 100 = earn points per KES 100 spent). Must be >= 1.';
