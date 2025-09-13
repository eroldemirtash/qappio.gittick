-- Brands tablosunu tamamen düzelt
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Brands tablosunu sıfırla
DROP TABLE IF EXISTS public.brands CASCADE;

-- 2. Brands tablosunu doğru şemayla oluştur
CREATE TABLE public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Updated_at trigger'ını oluştur
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- 4. Brands için trigger oluştur
CREATE TRIGGER trg_brands_updated_at 
  BEFORE UPDATE ON public.brands
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS politikalarını etkinleştir
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 6. RLS politikalarını oluştur
CREATE POLICY "brands_read_all" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "brands_write_admin" ON public.brands
  FOR ALL USING (true);

-- 7. Test markaları ekle
INSERT INTO public.brands (name, logo_url, website, category, description, is_active) VALUES 
('Nike', 'https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=N', 'https://nike.com', 'Spor', 'Just Do It', true),
('Adidas', 'https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=A', 'https://adidas.com', 'Spor', 'Impossible is Nothing', true),
('Apple', 'https://via.placeholder.com/100x100/45B7D1/FFFFFF?text=A', 'https://apple.com', 'Teknoloji', 'Think Different', true),
('Samsung', 'https://via.placeholder.com/100x100/96CEB4/FFFFFF?text=S', 'https://samsung.com', 'Teknoloji', 'Innovation for Everyone', true);

-- 8. Sonuçları kontrol et
SELECT 'brands count:' as info, count(*) as count FROM public.brands;
SELECT 'sample brands:' as info, name, category, is_active FROM public.brands LIMIT 3;
