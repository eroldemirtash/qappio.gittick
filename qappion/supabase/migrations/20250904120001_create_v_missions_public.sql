-- Drop existing view first
DROP VIEW IF EXISTS public.v_missions_public;

-- Create v_missions_public view for mobile app
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
  m.created_at,
  b.name as brand_name,
  bp.logo_url as brand_logo,
  bp.display_name as brand_display_name,
  bp.category as brand_category
FROM public.missions m
LEFT JOIN public.brands b ON m.brand_id = b.id
LEFT JOIN public.brand_profiles bp ON b.id = bp.brand_id
WHERE m.is_published = true
  AND (m.starts_at IS NULL OR m.starts_at <= now())
  AND (m.ends_at IS NULL OR m.ends_at >= now())
ORDER BY m.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.v_missions_public TO anon, authenticated;
