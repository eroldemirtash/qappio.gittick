-- Fix marketplace constraint to allow custom marketplace names
-- Run this in Supabase Studio → SQL Editor

-- Drop the existing check constraint
ALTER TABLE public.product_marketplaces 
DROP CONSTRAINT IF EXISTS product_marketplaces_marketplace_check;

-- Add a new constraint that allows any text (or keep it flexible)
-- We can either remove the constraint entirely or make it more flexible
-- For now, let's remove it to allow any marketplace name

-- Verify the constraint is removed
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.product_marketplaces'::regclass 
AND conname LIKE '%marketplace%';
