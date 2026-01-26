-- Migration 004: Production Fixes
-- Date: January 26, 2026
-- Description: Fixes for bulk sales item_id

-- ============================================================
-- BULK SALES ITEM_ID FIX
-- Populates item_id for automated sales based on nozzle configuration
-- This ensures all automated/bulk sales have the correct product reference
-- ============================================================

UPDATE sales s 
SET item_id = n.item_id 
FROM nozzles n 
WHERE s.nozzle_id = n.id 
  AND s.item_id IS NULL 
  AND s.is_automated = true;

-- ============================================================
-- VERIFICATION (run after migration)
-- ============================================================

-- Check remaining automated sales without item_id:
-- SELECT COUNT(*) FROM sales WHERE is_automated = true AND item_id IS NULL;

-- Check bulk sales with item_id populated:
-- SELECT COUNT(*) FROM sales WHERE is_automated = true AND item_id IS NOT NULL;
