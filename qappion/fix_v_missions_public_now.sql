-- Fix v_missions_public view to work with current missions table
DROP VIEW IF EXISTS public.v_missions_public;

-- Create v_missions_public view for mobile app
CREATE VIEW public.v_missions_public AS
SELECT 
  m.id,
  m.title,
  m.description,
  m.brief as cover_url,
  m.reward_qp as qp_reward,
  m.starts_at,
  m.ends_at,
  m.published,
  m.is_qappio_of_week,
  m.created_at,
  b.name as brand_name,
  b.logo_url as brand_logo
FROM public.missions m
LEFT JOIN public.brands b ON m.brand_id = b.id
WHERE m.published = true
ORDER BY m.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.v_missions_public TO anon, authenticated;
