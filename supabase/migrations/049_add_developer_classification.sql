-- ============================================================
-- 049_add_developer_classification.sql — Add Developer to contacts classification check
-- ============================================================

-- 1. Drop the old check constraint
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_classification_check;

-- 2. Add the updated check constraint with 'Developer' included
ALTER TABLE contacts
  ADD CONSTRAINT contacts_classification_check
  CHECK (classification IN ('Owner', 'Seller', 'Buyer', 'Agent', 'Developer', 'Others'));
