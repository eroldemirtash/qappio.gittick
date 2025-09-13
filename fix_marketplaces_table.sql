-- Product marketplaces tablosunu düzelt
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Önce mevcut tabloyu kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'product_marketplaces' 
AND table_schema = 'public';

-- 2. Eğer tablo varsa ve url kolonu yoksa ekle
ALTER TABLE public.product_marketplaces 
ADD COLUMN IF NOT EXISTS url TEXT;

-- 3. Eğer tablo yoksa sıfırdan oluştur
DROP TABLE IF EXISTS public.product_marketplaces CASCADE;

CREATE TABLE public.product_marketplaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS politikalarını etkinleştir
ALTER TABLE public.product_marketplaces ENABLE ROW LEVEL SECURITY;

-- 5. RLS politikalarını oluştur
CREATE POLICY "product_marketplaces_read" ON public.product_marketplaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND is_active = true
    )
  );

-- 6. Test verisi ekle
INSERT INTO public.product_marketplaces (product_id, marketplace, url) 
SELECT 
  p.id,
  'Amazon',
  'https://amazon.com/' || replace(lower(p.title), ' ', '-')
FROM public.products p
WHERE p.is_active = true;

-- 7. Sonuçları kontrol et
SELECT 'product_marketplaces count:' as info, count(*) as count FROM public.product_marketplaces;
SELECT 'sample data:' as info, marketplace, url FROM public.product_marketplaces LIMIT 3;
