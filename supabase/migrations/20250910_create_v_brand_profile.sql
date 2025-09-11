-- Unified brand profile view for mobile/admin
drop view if exists public.v_brand_profile;
create view public.v_brand_profile as
select
  b.id                        as brand_id,
  b.name                      as name,
  b.category                  as category,
  b.email                     as email,
  b.website_url               as website_url,
  b.socials                   as socials,
  coalesce(b.followers, 0)    as followers,
  b.description               as description,
  coalesce(bp.cover_url, b.cover_url) as cover_url,
  coalesce(bp.logo_url, bp.avatar_url) as logo_url,
  (
    select count(1)
    from public.missions m
    where m.brand_id = b.id and (m.published is true or m.published is null)
  ) as missions_count,
  (
    select count(1)
    from public.products p
    where p.brand_id = b.id and (p.is_active is true or p.is_active is null)
  ) as products_count,
  b.created_at,
  b.updated_at
from public.brands b
left join public.brand_profiles bp on bp.brand_id = b.id;

grant select on public.v_brand_profile to anon, authenticated;


