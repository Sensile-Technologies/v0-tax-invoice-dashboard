-- Flow360 Default Accounts Seed Migration
-- Run this script to create default expense and banking accounts for all vendors

-- Seed default expense accounts for all vendors
INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
SELECT v.id, 'Petty Cash', 'For petty cash expenses', true
FROM vendors v
WHERE NOT EXISTS (
  SELECT 1 FROM expense_accounts ea 
  WHERE ea.vendor_id = v.id AND ea.account_name = 'Petty Cash'
);

INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
SELECT v.id, 'Genset', 'For generator fuel and maintenance', true
FROM vendors v
WHERE NOT EXISTS (
  SELECT 1 FROM expense_accounts ea 
  WHERE ea.vendor_id = v.id AND ea.account_name = 'Genset'
);

-- Seed default banking account for all vendors
INSERT INTO banking_accounts (vendor_id, account_name, is_default, is_active)
SELECT v.id, 'Cash Drop', true, true
FROM vendors v
WHERE NOT EXISTS (
  SELECT 1 FROM banking_accounts ba 
  WHERE ba.vendor_id = v.id AND ba.account_name = 'Cash Drop'
);

-- Update existing Cash Drop accounts to be default if no default exists
UPDATE banking_accounts ba
SET is_default = true
WHERE ba.account_name = 'Cash Drop'
  AND NOT EXISTS (
    SELECT 1 FROM banking_accounts ba2 
    WHERE ba2.vendor_id = ba.vendor_id AND ba2.is_default = true
  );
