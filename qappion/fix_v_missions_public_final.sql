-- Yeni view (geçici)
create or replace view public.v_missions_public_new as
select
  m.id,
  m.brief as cover_url,  -- brief alanını cover_url olarak kullan
  coalesce(m.reward_qp, 0) as qp_reward,
  m.starts_at,
  m.ends_at,
  coalesce(m.is_qappio_of_week, false) as is_qappio_of_week,
  coalesce(m.published, false) as is_published,
  case
    when m.status is null then true
    when lower(m.status) in ('active','aktif','open','live','enabled') then true
    else false
  end as is_active,
  m.created_at,
  b.name as brand_name,
  coalesce(
    bp.logo_url,
    bp.avatar_url,
    b.logo_url
  ) as brand_logo
from public.missions m
left join public.brands b on b.id = m.brand_id
left join public.brand_profiles bp on bp.brand_id = b.id
where
  coalesce(m.published, false) = true
  and (
    m.status is null
    or lower(m.status) in ('active','aktif','open','live','enabled')
  )
  and (m.starts_at is null or m.starts_at <= now())
  and (m.ends_at is null or m.ends_at >= now())
order by m.created_at desc;

-- Swap
begin;
drop view if exists public.v_missions_public;
alter view public.v_missions_public_new rename to v_missions_public;
commit;

-- Grant permissions
grant select on public.v_missions_public to anon, authenticated;

