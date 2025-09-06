-- Fix missions database issues
-- Add missing columns and create missing tables

-- 1) Add is_sponsored column to missions table
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;

-- 2) Add sponsor_brand_id column to missions table
ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS sponsor_brand_id UUID REFERENCES public.brands(id);

-- 3) Update v_missions_public view to include new columns
DROP VIEW IF EXISTS public.v_missions_public;

CREATE VIEW public.v_missions_public AS
SELECT 
  m.id,
  m.title,
  m.short_description,
  m.description,
  m.cover_url,
  m.qp_reward,
  m.starts_at,
  m.ends_at,
  m.is_qappio_of_week,
  m.is_sponsored,
  m.created_by,
  m.created_at,
  m.updated_at,
  m.brand_id,
  b.name as brand_name,
  b.logo_url as brand_logo,
  b.website as brand_website,
  -- Sponsor brand info
  sb.id as sponsor_brand_id,
  sb.name as sponsor_brand_name,
  sb.logo_url as sponsor_brand_logo,
  -- Mission stats (mock for now)
  COALESCE(ms.total_posts, 0) as total_posts,
  COALESCE(ms.total_likes, 0) as total_likes
FROM public.missions m
LEFT JOIN public.brands b ON m.brand_id = b.id
LEFT JOIN public.brands sb ON m.sponsor_brand_id = sb.id
LEFT JOIN (
  SELECT 
    mission_id,
    COUNT(*) as total_posts,
    SUM(like_count) as total_likes
  FROM public.mission_submissions
  GROUP BY mission_id
) ms ON m.id = ms.mission_id
WHERE m.published = true
  AND (m.starts_at IS NULL OR m.starts_at <= NOW())
  AND (m.ends_at IS NULL OR m.ends_at >= NOW());

-- 4) Create v_mission_leaderboard view
CREATE OR REPLACE VIEW public.v_mission_leaderboard AS
SELECT 
  ms.mission_id,
  ms.user_id,
  u.display_name as user_name,
  u.avatar_url as user_avatar,
  u.level_name as user_level,
  ms.like_count,
  ROW_NUMBER() OVER (PARTITION BY ms.mission_id ORDER BY ms.like_count DESC) as rank
FROM public.mission_submissions ms
JOIN public.profiles u ON ms.user_id = u.id
WHERE ms.like_count > 0
ORDER BY ms.mission_id, ms.like_count DESC;

-- 5) Grant permissions
GRANT SELECT ON public.v_missions_public TO anon, authenticated;
GRANT SELECT ON public.v_mission_leaderboard TO anon, authenticated;

-- 6) Update some missions to be sponsored (for testing)
UPDATE public.missions 
SET is_sponsored = true, 
    sponsor_brand_id = (SELECT id FROM public.brands LIMIT 1)
WHERE id IN (
  SELECT id FROM public.missions 
  ORDER BY created_at DESC 
  LIMIT 2
);

-- 7) Insert some test mission submissions for leaderboard
INSERT INTO public.mission_submissions (mission_id, user_id, media_url, caption, like_count)
SELECT 
  m.id as mission_id,
  u.id as user_id,
  'https://picsum.photos/400/400?random=' || (random() * 1000)::int as media_url,
  'Test submission ' || (random() * 100)::int as caption,
  (random() * 50)::int as like_count
FROM public.missions m
CROSS JOIN public.profiles u
WHERE m.published = true
  AND u.role IN ('admin', 'brand_manager', 'editor', 'viewer')
LIMIT 20
ON CONFLICT DO NOTHING;
