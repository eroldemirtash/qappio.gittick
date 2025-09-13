-- Brand_profiles tablosuna eksik lisans kolonlarını ekle
-- Bu script'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. Eksik kolonları ekle
ALTER TABLE public.brand_profiles 
ADD COLUMN IF NOT EXISTS license_start DATE,
ADD COLUMN IF NOT EXISTS license_end DATE,
ADD COLUMN IF NOT EXISTS license_fee DECIMAL(10,2);

-- 2. Mevcut markaları kontrol et
SELECT 
  id,
  name,
  logo_url,
  website,
  email,
  phone,
  category,
  description,
  socials,
  cover_url,
  is_active,
  created_at,
  updated_at
FROM public.brands 
ORDER BY created_at DESC;

-- 3. Brand_profiles tablosundaki tüm profilleri kontrol et
SELECT 
  bp.id,
  bp.brand_id,
  b.name as brand_name,
  bp.display_name,
  bp.email,
  bp.phone,
  bp.website,
  bp.avatar_url,
  bp.category,
  bp.license_plan,
  bp.license_start,
  bp.license_end,
  bp.license_fee,
  bp.features,
  bp.address,
  bp.description,
  bp.social_instagram,
  bp.social_twitter,
  bp.social_facebook,
  bp.social_linkedin,
  bp.is_active,
  bp.created_at,
  bp.updated_at
FROM public.brand_profiles bp
LEFT JOIN public.brands b ON bp.brand_id = b.id
ORDER BY bp.created_at DESC;

-- 4. Toplam sayıları göster
SELECT 
  'brands' as table_name,
  COUNT(*) as total_count
FROM public.brands
UNION ALL
SELECT 
  'brand_profiles' as table_name,
  COUNT(*) as total_count
FROM public.brand_profiles;
