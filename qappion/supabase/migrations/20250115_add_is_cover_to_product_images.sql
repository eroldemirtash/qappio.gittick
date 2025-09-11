-- Add is_cover column to product_images table
-- Run this in Supabase Studio → SQL Editor

-- Add is_cover column if it doesn't exist
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false;

-- Update existing records - first image of each product should be cover
UPDATE public.product_images 
SET is_cover = true 
WHERE id IN (
  SELECT DISTINCT ON (product_id) id 
  FROM public.product_images 
  ORDER BY product_id, position ASC
);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'product_images' 
AND table_schema = 'public'
ORDER BY ordinal_position;

