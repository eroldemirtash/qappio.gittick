-- Products tablosunu kontrol et ve debug yap
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Products tablosu var mı kontrol et
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Products tablosunda veri var mı kontrol et
SELECT 'products count:' as info, count(*) as count FROM public.products;

-- 3. RLS politikalarını kontrol et
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'products';

-- 4. Test verisi ekle (eğer yoksa)
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

-- 5. Brands tablosunda veri var mı kontrol et
SELECT 'brands count:' as info, count(*) as count FROM public.brands;

-- 6. Brand_profiles tablosunda veri var mı kontrol et
SELECT 'brand_profiles count:' as info, count(*) as count FROM public.brand_profiles;

-- 7. Test sorgusu - mobile'da kullanılan sorguyu test et
SELECT 
  id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, category, level, usage_terms, features, created_at
FROM public.products 
WHERE id = '00000000-0000-0000-0000-000000000001' 
AND is_active = true;
