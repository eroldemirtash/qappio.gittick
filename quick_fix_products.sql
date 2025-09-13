-- Hızlı çözüm: Products tablosunu oluştur ve test verisi ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Products tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  value_qp INTEGER NOT NULL DEFAULT 0,
  stock_count INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'limited')),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'Elektronik',
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 5),
  usage_terms TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Product images tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eksik kolonları ekle
ALTER TABLE public.product_images 
ADD COLUMN IF NOT EXISTS is_cover BOOLEAN DEFAULT false;

-- 3. RLS politikalarını etkinleştir
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 4. RLS politikalarını oluştur
-- Herkes aktif ürünleri görebilir
CREATE POLICY "products_read_active" ON public.products
  FOR SELECT USING (is_active = true);

-- Product images için
CREATE POLICY "product_images_read" ON public.product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND is_active = true
    )
  );

-- 5. Brand profiles tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.brand_profiles (
  brand_id UUID PRIMARY KEY REFERENCES public.brands(id) ON DELETE CASCADE,
  display_name TEXT,
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_facebook TEXT,
  social_linkedin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Test markası oluştur (eğer yoksa)
INSERT INTO public.brands (id, name, logo_url, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Markası',
  'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=T',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 7. Test marka profili oluştur
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

-- 6. Features kolonunu ekle
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';

-- 7. Test ürünleri ekle
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
),
(
  '00000000-0000-0000-0000-000000000002',
  'Premium Ürün',
  'Yüksek seviye test ürünü',
  500,
  5,
  '00000000-0000-0000-0000-000000000001',
  'Moda',
  3,
  true,
  '["Rahat tasarım", "Hava yastığı", "Dayanıklı malzeme", "Günlük kullanım", "Çok renk seçeneği"]'::jsonb
);

-- 7. Test ürün görselleri ekle
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
),
(
  '00000000-0000-0000-0000-000000000002',
  'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Premium',
  0,
  true
);

-- 8. Sonuçları kontrol et
SELECT 'products count:' as info, count(*) as count FROM public.products WHERE is_active = true;
SELECT 'product_images count:' as info, count(*) as count FROM public.product_images;

-- 9. Ürünleri listele
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
