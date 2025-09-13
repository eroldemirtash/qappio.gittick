-- Brands tablosunu tamamen düzelt - tüm eksik kolonlarla
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Mevcut tabloları temizle
DROP TABLE IF EXISTS public.brand_profiles CASCADE;
DROP TABLE IF EXISTS public.brands CASCADE;

-- 2. Brands tablosunu tüm kolonlarla oluştur
CREATE TABLE public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  description TEXT,
  socials JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Brand_profiles tablosunu oluştur
CREATE TABLE public.brand_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'manager',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(brand_id, user_id)
);

-- 4. Updated_at trigger'ını oluştur
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- 5. Trigger'ları oluştur
CREATE TRIGGER trg_brands_updated_at 
  BEFORE UPDATE ON public.brands
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_brand_profiles_updated_at 
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- 6. RLS politikalarını etkinleştir
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- 7. Brands RLS politikaları
CREATE POLICY "brands_select_policy" ON public.brands
  FOR SELECT USING (true);

CREATE POLICY "brands_insert_policy" ON public.brands
  FOR INSERT WITH CHECK (true);

CREATE POLICY "brands_update_policy" ON public.brands
  FOR UPDATE USING (true);

CREATE POLICY "brands_delete_policy" ON public.brands
  FOR DELETE USING (true);

-- 8. Brand_profiles RLS politikaları
CREATE POLICY "brand_profiles_select_policy" ON public.brand_profiles
  FOR SELECT USING (true);

CREATE POLICY "brand_profiles_insert_policy" ON public.brand_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "brand_profiles_update_policy" ON public.brand_profiles
  FOR UPDATE USING (true);

CREATE POLICY "brand_profiles_delete_policy" ON public.brand_profiles
  FOR DELETE USING (true);

-- 9. Test verisi ekle
INSERT INTO public.brands (name, email, category, description, socials) VALUES
('Nike', 'info@nike.com', 'Sportswear', 'Just Do It', '{"instagram": "@nike", "twitter": "@nike"}'),
('Adidas', 'info@adidas.com', 'Sportswear', 'Impossible is Nothing', '{"instagram": "@adidas", "twitter": "@adidas"}'),
('Apple', 'info@apple.com', 'Technology', 'Think Different', '{"instagram": "@apple", "twitter": "@apple"}'),
('Samsung', 'info@samsung.com', 'Technology', 'Innovation for Everyone', '{"instagram": "@samsung", "twitter": "@samsung"}');

-- 10. Grant permissions
GRANT ALL ON public.brands TO authenticated;
GRANT ALL ON public.brand_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 11. Schema cache'i yenile
NOTIFY pgrst, 'reload schema';
