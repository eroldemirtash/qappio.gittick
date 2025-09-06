-- URGENT FIX: v_missions_public view'ına eksik kolonları ekle
-- Bu SQL'i Supabase Dashboard → SQL Editor'da çalıştır

-- Önce missions tablosuna eksik kolonları ekle
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS is_qappio_of_week boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS cover_url text,
ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsor_brand_id uuid REFERENCES public.brands(id);

-- Mevcut view'ı sil
DROP VIEW IF EXISTS public.v_missions_public;

-- Yeni view'ı oluştur (eksik kolonlarla)
CREATE VIEW public.v_missions_public AS
SELECT 
  m.id,
  m.title,
  m.short_description,
  m.cover_url,
  m.qp_reward,
  m.starts_at,
  m.ends_at,
  m.is_published as published,
  COALESCE(m.is_qappio_of_week, false) as is_qappio_of_week,  -- Eksik kolon eklendi
  COALESCE(m.is_sponsored, false) as is_sponsored,  -- Sponsor bilgisi eklendi
  m.created_at,
  b.name as brand_name,
  bp.logo_url as brand_logo,
  bp.display_name as brand_display_name,
  bp.category as brand_category,
  -- Sponsor bilgileri
  sb.name as sponsor_brand_name,
  sbp.logo_url as sponsor_brand_logo
FROM public.missions m
LEFT JOIN public.brands b ON m.brand_id = b.id
LEFT JOIN public.brand_profiles bp ON b.id = bp.brand_id
LEFT JOIN public.brands sb ON m.sponsor_brand_id = sb.id
LEFT JOIN public.brand_profiles sbp ON sb.id = sbp.brand_id
WHERE m.is_published = true
  AND (m.starts_at IS NULL OR m.starts_at <= now())
  AND (m.ends_at IS NULL OR m.ends_at >= now())
ORDER BY m.created_at DESC;

-- İzinleri ver
GRANT SELECT ON public.v_missions_public TO anon, authenticated;

-- Test için birkaç görev oluştur (eğer yoksa)
-- Önce kullanıcı var mı kontrol et, yoksa oluştur
DO $$
DECLARE
  user_id uuid;
  brand_id uuid;
BEGIN
  -- Kullanıcı var mı kontrol et
  SELECT id INTO user_id FROM auth.users LIMIT 1;
  
  -- Kullanıcı yoksa oluştur
  IF user_id IS NULL THEN
    INSERT INTO auth.users (id, email, created_at, updated_at)
    VALUES (gen_random_uuid(), 'test@qappio.com', now(), now())
    RETURNING id INTO user_id;
  END IF;
  
  -- Marka var mı kontrol et
  SELECT id INTO brand_id FROM public.brands LIMIT 1;
  
  -- Marka yoksa oluştur
  IF brand_id IS NULL THEN
    INSERT INTO public.brands (id, name, created_at)
    VALUES (gen_random_uuid(), 'Test Marka', now())
    RETURNING id INTO brand_id;
  END IF;
  
  -- Test görevlerini oluştur
  INSERT INTO public.missions (
    id, title, short_description, brand_id, created_by, 
    qp_reward, is_published, starts_at, ends_at, is_qappio_of_week
  ) VALUES 
  (
    gen_random_uuid(),
    'Test Görev 1',
    'Bu bir test görevidir',
    brand_id,
    user_id,
    50,
    true,
    now(),
    now() + interval '30 days',
    false
  ),
  (
    gen_random_uuid(),
    'Haftanın Qappiosu',
    'Bu haftanın öne çıkan görevi',
    brand_id,
    user_id,
    100,
    true,
    now(),
    now() + interval '30 days',
    true
  )
  ON CONFLICT DO NOTHING;
END $$;

-- Sonucu kontrol et
SELECT 
  id, 
  title, 
  is_published, 
  is_qappio_of_week, 
  created_at 
FROM public.missions 
WHERE is_published = true
ORDER BY created_at DESC
LIMIT 5;
