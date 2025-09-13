-- Kolonların varlığını doğrula ve cache'i temizle
-- Supabase Studio'da SQL Editor'da çalıştırın

-- 1) Kolonların varlığını kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'brand_profiles' 
AND table_schema = 'public'
ORDER BY column_name;

-- 2) Eğer logo_url yoksa ekle
ALTER TABLE public.brand_profiles 
ADD COLUMN IF NOT EXISTS logo_url text;

-- 3) Submissions tablosuna comments kolonu ekle (eğer yoksa)
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS comments text;

-- 4) Unique constraint ekle (hata varsa görmezden gel)
DO $$ 
BEGIN
    ALTER TABLE public.brand_profiles 
    ADD CONSTRAINT brand_profiles_brand_id_unique UNIQUE (brand_id);
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraint zaten var, devam et
        NULL;
END $$;

-- 5) Test verisi ekle
INSERT INTO public.brand_profiles (brand_id, logo_url, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'https://via.placeholder.com/100x100/000000/FFFFFF?text=Nike', 'Nike - Just Do It'),
('550e8400-e29b-41d4-a716-446655440002', 'https://via.placeholder.com/100x100/FF0000/FFFFFF?text=Adidas', 'Adidas - Impossible is Nothing'),
('550e8400-e29b-41d4-a716-446655440003', 'https://via.placeholder.com/100x100/0000FF/FFFFFF?text=Puma', 'Puma - Forever Faster')
ON CONFLICT (brand_id) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description;

-- 6) Cache'i temizlemek için schema'yı yenile
NOTIFY pgrst, 'reload schema';
