-- Create v_missions_public_new view for mobile app
-- This view provides a clean interface for mobile app to fetch missions

DROP VIEW IF EXISTS public.v_missions_public_new;

CREATE VIEW public.v_missions_public_new AS
SELECT
  m.id,
  m.title,
  m.brief as cover_url,  -- Use brief field as cover_url since cover_url column doesn't exist
  COALESCE(m.reward_qp, 0) as qp_reward,
  m.starts_at,
  m.ends_at,
  COALESCE(m.is_qappio_of_week, false) as is_qappio_of_week,
  COALESCE(m.published, false) as is_published,
  CASE
    WHEN m.status IS NULL THEN true
    WHEN LOWER(m.status) IN ('active','aktif','open','live','enabled') THEN true
    ELSE false
  END as is_active,
  m.created_at,
  b.name as brand_name,
  COALESCE(
    bp.logo_url,
    bp.avatar_url,
    b.logo_url
  ) as brand_logo
FROM public.missions m
LEFT JOIN public.brands b ON b.id = m.brand_id
LEFT JOIN public.brand_profiles bp ON bp.brand_id = b.id
WHERE
  COALESCE(m.published, false) = true
  AND (
    m.status IS NULL
    OR LOWER(m.status) IN ('active','aktif','open','live','enabled')
  )
  AND (m.starts_at IS NULL OR m.starts_at <= now())
  AND (m.ends_at IS NULL OR m.ends_at >= now())
ORDER BY m.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.v_missions_public_new TO anon, authenticated;

-- Optional: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_missions_published_active 
ON public.missions (published, status, starts_at, ends_at) 
WHERE published = true;
