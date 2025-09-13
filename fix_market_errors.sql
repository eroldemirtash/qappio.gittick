-- Market sayfası hatalarını düzelt
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Brands tablosuna eksik kolonları ekle
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Updated_at trigger'ını oluştur
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- 3. Brands için trigger oluştur
DROP TRIGGER IF EXISTS trg_brands_updated_at ON public.brands;
CREATE TRIGGER trg_brands_updated_at 
  BEFORE UPDATE ON public.brands
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Product marketplaces tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.product_marketplaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  marketplace TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS politikalarını etkinleştir
ALTER TABLE public.product_marketplaces ENABLE ROW LEVEL SECURITY;

-- 6. RLS politikalarını oluştur
CREATE POLICY "product_marketplaces_read" ON public.product_marketplaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = product_id AND is_active = true
    )
  );

-- 7. Test marketplace verisi ekle
INSERT INTO public.product_marketplaces (product_id, marketplace, url) VALUES 
('00000000-0000-0000-0000-000000000001', 'Amazon', 'https://amazon.com/test-urun-1'),
('00000000-0000-0000-0000-000000000001', 'Trendyol', 'https://trendyol.com/test-urun-1'),
('00000000-0000-0000-0000-000000000002', 'Hepsiburada', 'https://hepsiburada.com/premium-urun'),
('00000000-0000-0000-0000-000000000002', 'N11', 'https://n11.com/premium-urun');

-- 8. Sonuçları kontrol et
SELECT 'product_marketplaces count:' as info, count(*) as count FROM public.product_marketplaces;
SELECT 'brands updated_at exists:' as info, 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'updated_at') 
  THEN 'YES' ELSE 'NO' END as result;
