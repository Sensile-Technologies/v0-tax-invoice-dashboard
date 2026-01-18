-- Seed default expense accounts and banking accounts for all vendors
-- Run this in production to ensure every vendor has the required default accounts

-- Default Expense Accounts: Petty Cash and Genset
INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
SELECT v.id, 'Petty Cash', 'Petty cash expenses', true
FROM vendors v
WHERE NOT EXISTS (
    SELECT 1 FROM expense_accounts ea 
    WHERE ea.vendor_id = v.id AND LOWER(ea.account_name) = 'petty cash'
);

INSERT INTO expense_accounts (vendor_id, account_name, description, is_active)
SELECT v.id, 'Genset', 'Generator fuel and maintenance expenses', true
FROM vendors v
WHERE NOT EXISTS (
    SELECT 1 FROM expense_accounts ea 
    WHERE ea.vendor_id = v.id AND LOWER(ea.account_name) = 'genset'
);

-- Default Banking Account: Cash Drop (marked as default)
INSERT INTO banking_accounts (vendor_id, account_name, is_default, is_active)
SELECT v.id, 'Cash Drop', true, true
FROM vendors v
WHERE NOT EXISTS (
    SELECT 1 FROM banking_accounts ba 
    WHERE ba.vendor_id = v.id AND LOWER(ba.account_name) = 'cash drop'
);

-- If Cash Drop already exists but is not marked as default, update it
UPDATE banking_accounts 
SET is_default = true, updated_at = CURRENT_TIMESTAMP
WHERE LOWER(account_name) = 'cash drop' AND is_default = false;
