-- Profiles tablosuna role kolonunu ekle ve RLS politikalarını düzelt
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- Profiles tablosuna eksik kolonları ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'viewer' 
CHECK (role IN ('admin','brand_manager','editor','viewer'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Mevcut RLS politikalarını temizle
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
DROP POLICY IF EXISTS "product_images_admin_all" ON public.product_images;
DROP POLICY IF EXISTS "product_marketplaces_admin_all" ON public.product_marketplaces;

-- Yeni RLS politikalarını oluştur
-- Products için admin politikası
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Product images için admin politikası
CREATE POLICY "product_images_admin_all" ON public.product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Product marketplaces için admin politikası
CREATE POLICY "product_marketplaces_admin_all" ON public.product_marketplaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Updated_at trigger'ı ekle
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Test için admin kullanıcısı oluştur (eğer yoksa)
DO $$
BEGIN
  -- Eğer auth.users'da kullanıcı varsa ve profiles'da yoksa admin profili oluştur
  IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    INSERT INTO public.profiles (id, role, is_active)
    SELECT id, 'admin', true
    FROM auth.users
    LIMIT 1;
    RAISE NOTICE 'Admin profili oluşturuldu';
  END IF;
END $$;

-- Profiles tablosunu kontrol et
SELECT id, role, is_active, created_at 
FROM public.profiles 
ORDER BY created_at DESC;
