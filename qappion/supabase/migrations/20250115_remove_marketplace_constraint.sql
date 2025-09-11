-- Remove marketplace constraint to allow custom marketplace names
-- Run this in Supabase Studio → SQL Editor

-- Drop the existing check constraint
ALTER TABLE public.product_marketplaces 
DROP CONSTRAINT IF EXISTS product_marketplaces_marketplace_check;

-- Check if the constraint was removed
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'product_marketplaces' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK';

