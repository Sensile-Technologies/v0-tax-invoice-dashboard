-- Seed default expense accounts and banking accounts for ALL vendors
-- Run this in production to ensure every vendor has the required default accounts
-- Safe to run multiple times - uses ON CONFLICT DO NOTHING

-- Default Expense Account: Petty Cash
INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
SELECT v.id, 'Petty Cash', 'Petty cash expenses', true
FROM vendors v
WHERE NOT EXISTS (
    SELECT 1 FROM expense_accounts ea 
    WHERE ea.vendor_id = v.id AND LOWER(TRIM(ea.account_name)) = 'petty cash'
);

-- Default Expense Account: Genset
INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
SELECT v.id, 'Genset', 'Generator fuel and maintenance expenses', true
FROM vendors v
WHERE NOT EXISTS (
    SELECT 1 FROM expense_accounts ea 
    WHERE ea.vendor_id = v.id AND LOWER(TRIM(ea.account_name)) = 'genset'
);

-- Default Banking Account: Cash Drop (marked as default)
INSERT INTO banking_accounts (vendor_id, account_name, is_default, is_active)
SELECT v.id, 'Cash Drop', true, true
FROM vendors v
WHERE NOT EXISTS (
    SELECT 1 FROM banking_accounts ba 
    WHERE ba.vendor_id = v.id AND LOWER(TRIM(ba.account_name)) = 'cash drop'
);

-- Ensure Cash Drop is marked as default if it already exists
UPDATE banking_accounts 
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE LOWER(TRIM(account_name)) = 'cash drop' AND is_default = false;

-- Show results
SELECT 'Expense Accounts' as type, COUNT(*) as count FROM expense_accounts
UNION ALL
SELECT 'Banking Accounts' as type, COUNT(*) as count FROM banking_accounts;
