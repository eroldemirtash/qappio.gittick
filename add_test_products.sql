-- Test ürünleri ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Önce brands tablosunda veri var mı kontrol et
SELECT 'brands count:' as info, count(*) as count FROM public.brands;

-- Eğer brands tablosu boşsa test markası oluştur
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.brands LIMIT 1) THEN
    INSERT INTO public.brands (id, name, logo_url, created_at)
    VALUES (
      gen_random_uuid(),
      'Test Markası',
      'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=T',
      NOW()
    );
    RAISE NOTICE 'Test markası oluşturuldu';
  END IF;
END $$;

-- Test ürünleri ekle
INSERT INTO public.products (
  title, 
  description, 
  value_qp, 
  stock_count, 
  brand_id, 
  category, 
  level,
  is_active
) VALUES 
(
  'Test Ürün 1',
  'Bu bir test ürünüdür. Mobilde görünmeli.',
  100,
  10,
  (SELECT id FROM public.brands LIMIT 1),
  'Elektronik',
  1,
  true
),
(
  'Premium Ürün',
  'Yüksek seviye test ürünü',
  500,
  5,
  (SELECT id FROM public.brands LIMIT 1),
  'Moda',
  3,
  true
),
(
  'Spor Ürünü',
  'Spor kategorisinde test ürünü',
  250,
  15,
  (SELECT id FROM public.brands LIMIT 1),
  'Spor',
  2,
  true
);

-- Test ürün görselleri ekle
INSERT INTO public.product_images (
  product_id,
  url,
  position,
  is_cover
) VALUES 
(
  (SELECT id FROM public.products WHERE title = 'Test Ürün 1' LIMIT 1),
  'https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Test+1',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE title = 'Premium Ürün' LIMIT 1),
  'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Premium',
  0,
  true
),
(
  (SELECT id FROM public.products WHERE title = 'Spor Ürünü' LIMIT 1),
  'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Spor',
  0,
  true
);

-- Sonuçları kontrol et
SELECT 'products count:' as info, count(*) as count FROM public.products WHERE is_active = true;
SELECT 'product_images count:' as info, count(*) as count FROM public.product_images;

-- Ürünleri listele
SELECT 
  p.id,
  p.title,
  p.description,
  p.value_qp,
  p.stock_count,
  p.category,
  p.level,
  p.is_active,
  b.name as brand_name,
  pi.url as image_url
FROM public.products p
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.product_images pi ON p.id = pi.product_id AND pi.is_cover = true
WHERE p.is_active = true
ORDER BY p.created_at DESC;
