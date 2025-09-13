-- Products tablosuna features kolonunu ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Features kolonunu ekle
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';

-- 2. Mevcut ürünlere features ekle
UPDATE public.products 
SET features = '["Test özellik 1", "Test özellik 2", "Test özellik 3"]'::jsonb
WHERE features IS NULL;

-- 3. Test ürünü oluştur (eğer yoksa)
INSERT INTO public.products (
  id,
  title, 
  description, 
  value_qp, 
  stock_count, 
  brand_id, 
  category, 
  level,
  is_active,
  features
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'Test Ürün 1',
  'Bu bir test ürünüdür. Mobilde görünmeli.',
  100,
  10,
  '00000000-0000-0000-0000-000000000001',
  'Elektronik',
  1,
  true,
  '["A17 Pro çip", "48MP ana kamera", "ProRAW ve ProRes", "Titanium gövde", "Ceramic Shield ekran"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 4. Test markası oluştur (eğer yoksa)
INSERT INTO public.brands (id, name, logo_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Markası',
  'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=T',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Test marka profili oluştur (eğer yoksa)
INSERT INTO public.brand_profiles (
  brand_id,
  display_name,
  description,
  avatar_url,
  cover_url,
  website,
  email,
  phone,
  social_instagram,
  social_twitter
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Markası',
  'Bu bir test markasıdır. Mobilde görünmeli.',
  'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=T',
  'https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Test+Marka+Cover',
  'www.testmarka.com',
  'info@testmarka.com',
  '0212 555 0123',
  'https://instagram.com/testmarka',
  'https://twitter.com/testmarka'
) ON CONFLICT (brand_id) DO NOTHING;

-- 6. Test ürün görseli oluştur (eğer yoksa)
INSERT INTO public.product_images (
  product_id,
  url,
  position,
  is_cover
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Test+1',
  0,
  true
) ON CONFLICT DO NOTHING;

-- 7. Sonuçları kontrol et
SELECT 'products count:' as info, count(*) as count FROM public.products WHERE is_active = true;
SELECT 'brands count:' as info, count(*) as count FROM public.brands;
SELECT 'brand_profiles count:' as info, count(*) as count FROM public.brand_profiles;
SELECT 'product_images count:' as info, count(*) as count FROM public.product_images;

-- 8. Test sorgusu - mobile'da kullanılan sorguyu test et
SELECT 
  id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, category, level, usage_terms, features, created_at
FROM public.products 
WHERE id = '00000000-0000-0000-0000-000000000001' 
AND is_active = true;
