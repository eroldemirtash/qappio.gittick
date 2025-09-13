-- Brands tablosuna eksik kolonları ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Brands tablosuna eksik kolonları ekle
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT '{}';

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- 2. Mevcut markalara test verisi ekle
UPDATE public.brands 
SET 
  socials = '{"instagram": "https://instagram.com/testmarka", "twitter": "https://twitter.com/testmarka", "facebook": "https://facebook.com/testmarka", "linkedin": "https://linkedin.com/company/testmarka"}'::jsonb,
  email = 'info@testmarka.com',
  website = 'https://www.testmarka.com',
  category = 'Teknoloji',
  description = 'Test markası açıklaması',
  cover_url = 'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Test+Marka+Cover'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 3. Kolonları kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'brands' 
ORDER BY ordinal_position;

-- 4. Test verisini kontrol et
SELECT 
  id, 
  name, 
  socials, 
  email, 
  website, 
  category, 
  description, 
  cover_url,
  logo_url
FROM public.brands 
WHERE id = '00000000-0000-0000-0000-000000000001';
