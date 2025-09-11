-- Drop existing view first
drop view if exists public.v_missions_public;

-- Create new view
create view public.v_missions_public as
select
  m.id,
  m.title,
  m.cover_url                                   as cover_url,
  coalesce(m.reward_qp, 0)                      as qp_reward,
  m.starts_at,
  m.ends_at,
  coalesce(m.is_qappio_of_week, false)          as is_qappio_of_week,
  coalesce(m.published, false)                  as is_published,
  case
    when m.status is null then true
    when lower(m.status) in ('active','aktif','open','live','enabled','draft') then true
    else false
  end                                           as is_active,
  m.created_at,
  b.name                                        as brand_name,
  coalesce(
    to_jsonb(bp)->>'logo_url',
    to_jsonb(bp)->>'avatar_url',
    to_jsonb(bp)->>'logo',
    to_jsonb(bp)->>'image_url'
  )                                             as brand_logo
from public.missions m
left join public.brands b          on b.id = m.brand_id
left join public.brand_profiles bp on bp.brand_id = b.id
where
  coalesce(m.published, false) = true
  and (
    m.status is null
    or lower(m.status) in ('active','aktif','open','live','enabled','draft')
  )
order by m.created_at desc;

-- Grant permissions
grant select on public.v_missions_public to anon, authenticated;