-- Check if products table exists and has brand_id column
DO $$ 
BEGIN
    -- Check if products table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Products table does not exist';
    END IF;
    
    -- Check if brand_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'brand_id column does not exist in products table';
    END IF;
    
    RAISE NOTICE 'Products table and brand_id column exist';
END $$;

-- Check if brands table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brands' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Brands table does not exist';
    END IF;
    
    RAISE NOTICE 'Brands table exists';
END $$;

-- First, clean up invalid brand_id references
DO $$ 
BEGIN
    -- Delete products with invalid brand_id references
    DELETE FROM public.products 
    WHERE brand_id IS NOT NULL 
    AND brand_id NOT IN (SELECT id FROM public.brands);
    
    RAISE NOTICE 'Cleaned up products with invalid brand_id references';
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_brand_id_fkey' 
        AND table_name = 'products' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.products 
        ADD CONSTRAINT products_brand_id_fkey 
        FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint added: products_brand_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists: products_brand_id_fkey';
    END IF;
END $$;

-- Check current products table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;
