-- Fix products table - add missing columns
-- Run this in Supabase Studio → SQL Editor

-- Add category column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Elektronik' 
CHECK (category IN ('Elektronik', 'Ses & Kulaklık', 'Gaming & Aksesuar', 'Giyim', 'Ayakkabı & Çanta', 'Aksesuar & Takı', 'Güzellik & Bakım', 'Spor & Outdoor', 'Sağlık & Wellness', 'Ev & Yaşam', 'Mutfak & Kahve', 'Hobi & DIY', 'Kırtasiye & Ofis', 'Bebek & Çocuk', 'Evcil Hayvan', 'Otomotiv', 'Seyahat & Valiz', 'Yiyecek & İçecek', 'Dijital / Kodlar', 'Sezonluk & Hediyelik'));

-- Add level column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1 
CHECK (level >= 1 AND level <= 5);

-- Add usage_terms column if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS usage_terms text DEFAULT '';

-- Update existing products with default values
UPDATE public.products 
SET 
  category = 'Elektronik',
  level = 1,
  usage_terms = ''
WHERE category IS NULL OR level IS NULL OR usage_terms IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

