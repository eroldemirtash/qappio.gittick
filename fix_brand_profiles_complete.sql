-- Brand_profiles tablosuna TÜM eksik kolonları tek seferde ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Önce mevcut kolonları kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'brand_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. TÜM eksik kolonları tek seferde ekle
ALTER TABLE public.brand_profiles 
ADD COLUMN IF NOT EXISTS license_start DATE,
ADD COLUMN IF NOT EXISTS license_end DATE,
ADD COLUMN IF NOT EXISTS license_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'manager',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. UNIQUE constraint ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'brand_profiles_brand_id_user_id_key'
        AND table_name = 'brand_profiles'
    ) THEN
        ALTER TABLE public.brand_profiles 
        ADD CONSTRAINT brand_profiles_brand_id_user_id_key 
        UNIQUE (brand_id, user_id);
    END IF;
END $$;

-- 4. Updated_at trigger'ını oluştur
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- 5. Brand_profiles için trigger oluştur
DROP TRIGGER IF EXISTS trg_brand_profiles_updated_at ON public.brand_profiles;
CREATE TRIGGER trg_brand_profiles_updated_at 
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.set_updated_at();

-- 6. RLS politikalarını etkinleştir
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- 7. RLS politikalarını oluştur
DROP POLICY IF EXISTS "brand_profiles_select_policy" ON public.brand_profiles;
CREATE POLICY "brand_profiles_select_policy"
  ON public.brand_profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "brand_profiles_insert_policy" ON public.brand_profiles;
CREATE POLICY "brand_profiles_insert_policy"
  ON public.brand_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "brand_profiles_update_policy" ON public.brand_profiles;
CREATE POLICY "brand_profiles_update_policy"
  ON public.brand_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "brand_profiles_delete_policy" ON public.brand_profiles;
CREATE POLICY "brand_profiles_delete_policy"
  ON public.brand_profiles FOR DELETE
  TO authenticated
  USING (true);

-- 8. Son durumu kontrol et
SELECT 
  'brands' as table_name,
  COUNT(*) as total_count
FROM public.brands
UNION ALL
SELECT 
  'brand_profiles' as table_name,
  COUNT(*) as total_count
FROM public.brand_profiles;

-- 9. Tüm markaları listele
SELECT 
  b.id,
  b.name,
  b.logo_url,
  b.website,
  b.email,
  b.phone,
  b.category,
  b.description,
  b.socials,
  b.cover_url,
  b.is_active,
  b.created_at,
  b.updated_at,
  COUNT(bp.id) as profile_count
FROM public.brands b
LEFT JOIN public.brand_profiles bp ON b.id = bp.brand_id
GROUP BY b.id, b.name, b.logo_url, b.website, b.email, b.phone, b.category, b.description, b.socials, b.cover_url, b.is_active, b.created_at, b.updated_at
ORDER BY b.created_at DESC;
