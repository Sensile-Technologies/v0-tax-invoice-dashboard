-- Migration 004: Production Fixes
-- Date: January 26, 2026
-- Description: Fixes for bulk sales item_id, tank readings, and loyalty transactions

-- ============================================================
-- 1. BULK SALES ITEM_ID FIX
-- Populates item_id for automated sales based on nozzle configuration
-- ============================================================

UPDATE sales s 
SET item_id = n.item_id 
FROM nozzles n 
WHERE s.nozzle_id = n.id 
  AND s.item_id IS NULL 
  AND s.is_automated = true;

-- ============================================================
-- 2. TANK READING CONTINUITY FIX
-- Ensures tank opening readings match previous shift's closing readings
-- This fixes legacy mismatched readings
-- ============================================================

WITH corrected_readings AS (
  SELECT 
    sr.id,
    sr.shift_id,
    sr.tank_id,
    sr.opening_reading,
    LAG(sr.closing_reading) OVER (
      PARTITION BY sr.tank_id 
      ORDER BY s.start_time
    ) as prev_closing
  FROM shift_readings sr
  JOIN shifts s ON sr.shift_id = s.id
  WHERE sr.opening_reading IS NOT NULL
)
UPDATE shift_readings sr
SET opening_reading = cr.prev_closing
FROM corrected_readings cr
WHERE sr.id = cr.id
  AND cr.prev_closing IS NOT NULL
  AND sr.opening_reading != cr.prev_closing;

-- ============================================================
-- 3. LOYALTY TRANSACTIONS BACKFILL
-- Creates missing loyalty_transactions for sales with loyalty_points
-- ============================================================

INSERT INTO loyalty_transactions (
  id,
  customer_id,
  sale_id,
  branch_id,
  points_earned,
  points_redeemed,
  transaction_type,
  description,
  created_at
)
SELECT 
  gen_random_uuid()::text,
  s.customer_id,
  s.id,
  s.branch_id,
  COALESCE(s.loyalty_points, 0),
  0,
  'earn',
  'Points earned from sale ' || s.invoice_number,
  s.created_at
FROM sales s
WHERE s.customer_id IS NOT NULL
  AND s.loyalty_points > 0
  AND NOT EXISTS (
    SELECT 1 FROM loyalty_transactions lt 
    WHERE lt.sale_id = s.id AND lt.transaction_type = 'earn'
  );

-- ============================================================
-- 4. UPDATE CUSTOMER POINT BALANCES
-- Recalculates point balances from transaction history
-- ============================================================

UPDATE customers c
SET point_balance = COALESCE(
  (SELECT SUM(COALESCE(lt.points_earned, 0) - COALESCE(lt.points_redeemed, 0))
   FROM loyalty_transactions lt
   WHERE lt.customer_id = c.id),
  0
)
WHERE c.id IN (
  SELECT DISTINCT customer_id FROM loyalty_transactions
);

-- ============================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================

-- Check bulk sales with item_id populated:
-- SELECT COUNT(*) FROM sales WHERE is_automated = true AND item_id IS NOT NULL;

-- Check tank reading continuity:
-- SELECT sr.id, sr.tank_id, sr.opening_reading, 
--        LAG(sr.closing_reading) OVER (PARTITION BY sr.tank_id ORDER BY s.start_time) as prev_closing
-- FROM shift_readings sr
-- JOIN shifts s ON sr.shift_id = s.id
-- WHERE sr.opening_reading != LAG(sr.closing_reading) OVER (PARTITION BY sr.tank_id ORDER BY s.start_time);

-- Check loyalty transaction coverage:
-- SELECT COUNT(*) FROM sales WHERE customer_id IS NOT NULL AND loyalty_points > 0
--   AND NOT EXISTS (SELECT 1 FROM loyalty_transactions lt WHERE lt.sale_id = sales.id);
