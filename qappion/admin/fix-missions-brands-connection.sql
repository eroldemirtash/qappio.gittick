-- Missions ve Brands tablolarını birbirine bağla
-- Bu SQL'i Supabase Studio > SQL Editor'da çalıştır

-- 1. Missions tablosuna eksik kolonları ekle
ALTER TABLE public.missions
ADD COLUMN IF NOT EXISTS is_qappio_of_week boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsor_brand_id uuid,
ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

-- 2. Foreign key ilişkilerini ekle (önce varsa sil)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'missions_sponsor_brand_id_fkey' 
               AND table_name = 'missions') THEN
        ALTER TABLE public.missions DROP CONSTRAINT missions_sponsor_brand_id_fkey;
    END IF;
END $$;

ALTER TABLE public.missions
ADD CONSTRAINT missions_sponsor_brand_id_fkey
FOREIGN KEY (sponsor_brand_id) REFERENCES public.brands(id);

-- 3. Performans için indeksler
CREATE INDEX IF NOT EXISTS idx_missions_brand_id ON public.missions (brand_id);
CREATE INDEX IF NOT EXISTS idx_missions_qappio_week ON public.missions (is_qappio_of_week) WHERE is_qappio_of_week = true;
CREATE INDEX IF NOT EXISTS idx_missions_sponsor_brand_id ON public.missions (sponsor_brand_id);
CREATE INDEX IF NOT EXISTS idx_missions_published ON public.missions (is_published) WHERE is_published = true;

-- 4. Mevcut görevleri published yap (test için)
UPDATE public.missions 
SET is_published = true 
WHERE is_published IS NULL OR is_published = false;

-- 5. Brand_profiles tablosuna eksik kolonları ekle
ALTER TABLE public.brand_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_twitter TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS social_linkedin TEXT,
ADD COLUMN IF NOT EXISTS license_plan TEXT DEFAULT 'freemium',
ADD COLUMN IF NOT EXISTS license_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS license_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS license_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS address TEXT;

-- 6. Brands tablosuna eksik kolonları ekle
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 7. RLS politikalarını kontrol et
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Public okuma politikaları (mobil için)
DROP POLICY IF EXISTS "Public read missions" ON public.missions;
CREATE POLICY "Public read missions" ON public.missions
FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public read brands" ON public.brands;
CREATE POLICY "Public read brands" ON public.brands
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read brand_profiles" ON public.brand_profiles;
CREATE POLICY "Public read brand_profiles" ON public.brand_profiles
FOR SELECT USING (true);

-- 9. Admin yazma politikaları
DROP POLICY IF EXISTS "Admin write missions" ON public.missions;
CREATE POLICY "Admin write missions" ON public.missions
FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin write brands" ON public.brands;
CREATE POLICY "Admin write brands" ON public.brands
FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin write brand_profiles" ON public.brand_profiles;
CREATE POLICY "Admin write brand_profiles" ON public.brand_profiles
FOR ALL USING (true);
