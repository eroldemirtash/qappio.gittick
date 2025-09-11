-- Add url column to product_marketplaces table
ALTER TABLE public.product_marketplaces ADD COLUMN IF NOT EXISTS url text DEFAULT '';

-- Update existing records to have empty url
UPDATE public.product_marketplaces SET url = '' WHERE url IS NULL;

