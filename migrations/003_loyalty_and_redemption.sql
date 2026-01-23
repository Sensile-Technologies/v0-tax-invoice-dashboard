-- Flow360 Migration: Loyalty Earning & Redemption Rules
-- Run this script for databases that need loyalty features added since last deployment
-- Date: 2026-01-23

-- ============================================
-- BRANCHES: Loyalty Earning Rules
-- ============================================

ALTER TABLE branches 
  ADD COLUMN IF NOT EXISTS loyalty_earn_type VARCHAR(20) DEFAULT 'per_amount',
  ADD COLUMN IF NOT EXISTS loyalty_points_per_litre NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS loyalty_points_per_amount NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS loyalty_amount_threshold NUMERIC DEFAULT 100;

-- ============================================
-- BRANCHES: Loyalty Redemption Rules
-- ============================================

ALTER TABLE branches 
  ADD COLUMN IF NOT EXISTS redemption_points_per_ksh NUMERIC DEFAULT 1,
  ADD COLUMN IF NOT EXISTS min_redemption_points NUMERIC DEFAULT 100,
  ADD COLUMN IF NOT EXISTS max_redemption_percent NUMERIC DEFAULT 50;

-- ============================================
-- LOYALTY_TRANSACTIONS: New Columns
-- ============================================

ALTER TABLE loyalty_transactions 
  ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES items(id),
  ADD COLUMN IF NOT EXISTS points_redeemed NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) DEFAULT 'earn';

-- ============================================
-- LOYALTY_TRANSACTIONS: Unique Index on sale_id
-- Required for ON CONFLICT (sale_id) DO NOTHING clause
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_transactions_sale_id_unique 
  ON loyalty_transactions(sale_id) 
  WHERE sale_id IS NOT NULL;

-- ============================================
-- BACKFILL: Create missing loyalty transactions
-- For sales with is_loyalty_sale=true that don't have a matching transaction
-- NOTE: Run this AFTER the ALTER TABLE statements above have completed
-- ============================================

INSERT INTO loyalty_transactions 
(branch_id, sale_id, customer_name, customer_pin, transaction_date, transaction_amount, points_earned, payment_method, fuel_type, quantity)
SELECT 
  s.branch_id,
  s.id,
  s.loyalty_customer_name,
  s.loyalty_customer_pin,
  s.created_at,
  s.total_amount,
  CASE 
    WHEN b.loyalty_earn_type = 'per_litre' THEN FLOOR(s.quantity * COALESCE(b.loyalty_points_per_litre, 1))
    ELSE FLOOR(s.total_amount / GREATEST(1, COALESCE(b.loyalty_amount_threshold, 100))) * COALESCE(b.loyalty_points_per_amount, 1)
  END as points_earned,
  s.payment_method,
  s.fuel_type,
  s.quantity
FROM sales s
JOIN branches b ON b.id = s.branch_id
WHERE s.is_loyalty_sale = true
  AND s.loyalty_customer_name IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM loyalty_transactions lt WHERE lt.sale_id = s.id)
ON CONFLICT DO NOTHING;

-- Update backfilled records to set transaction_type
UPDATE loyalty_transactions SET transaction_type = 'earn' WHERE transaction_type IS NULL;

-- ============================================
-- END OF MIGRATION
-- ============================================
