-- Create v_missions_public view for mobile app
CREATE OR REPLACE VIEW public.v_missions_public AS
SELECT 
  m.id,
  m.title,
  m.description,
  m.brief as cover_url,
  m.reward_qp as qp_reward,
  m.starts_at,
  m.ends_at,
  m.is_qappio_of_week,
  m.created_at,
  b.name as brand_name,
  b.logo_url as brand_logo
FROM public.missions m
LEFT JOIN public.brands b ON b.id = m.brand_id
WHERE m.published = true
ORDER BY m.created_at DESC;
