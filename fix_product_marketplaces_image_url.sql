-- Check if product_marketplaces table exists, if not create it
CREATE TABLE IF NOT EXISTS public.product_marketplaces (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    marketplace text NOT NULL,
    product_url text,
    image_url text,
    position integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add missing columns if they don't exist
ALTER TABLE public.product_marketplaces 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS product_url text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Fix column name mismatch: drop 'url' column if it exists (product_url already exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'product_marketplaces' 
               AND column_name = 'url' 
               AND table_schema = 'public') THEN
        ALTER TABLE public.product_marketplaces DROP COLUMN url;
    END IF;
END $$;

-- Make product_url nullable (it can be empty)
ALTER TABLE public.product_marketplaces ALTER COLUMN product_url DROP NOT NULL;

-- Add comments for the columns
COMMENT ON COLUMN public.product_marketplaces.image_url IS 'Product image URL for the marketplace';
COMMENT ON COLUMN public.product_marketplaces.position IS 'Display position/order for the product in marketplace';
COMMENT ON COLUMN public.product_marketplaces.product_url IS 'Product URL on the marketplace';
COMMENT ON COLUMN public.product_marketplaces.marketplace IS 'Marketplace name (e.g., Amazon, Trendyol)';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_marketplaces_product_id ON public.product_marketplaces(product_id);
CREATE INDEX IF NOT EXISTS idx_product_marketplaces_marketplace ON public.product_marketplaces(marketplace);

-- Enable RLS
ALTER TABLE public.product_marketplaces ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "product_marketplaces_select_policy" ON public.product_marketplaces;
CREATE POLICY "product_marketplaces_select_policy" ON public.product_marketplaces
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "product_marketplaces_insert_policy" ON public.product_marketplaces;
CREATE POLICY "product_marketplaces_insert_policy" ON public.product_marketplaces
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "product_marketplaces_update_policy" ON public.product_marketplaces;
CREATE POLICY "product_marketplaces_update_policy" ON public.product_marketplaces
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "product_marketplaces_delete_policy" ON public.product_marketplaces;
CREATE POLICY "product_marketplaces_delete_policy" ON public.product_marketplaces
    FOR DELETE USING (true);
