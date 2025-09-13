-- Check current structure of product_marketplaces table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'product_marketplaces' 
AND table_schema = 'public'
ORDER BY ordinal_position;
