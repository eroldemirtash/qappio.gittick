-- Update v_brand_profile to coalesce admin panel profile fields
drop view if exists public.v_brand_profile;
create view public.v_brand_profile as
select
  b.id                                          as brand_id,
  coalesce(bp.display_name, b.name)             as name,
  coalesce(bp.category, b.category)             as category,
  coalesce(bp.email, b.email)                   as email,
  coalesce(bp.website, b.website_url)           as website_url,
  -- socials: prefer brand_profiles handles/urls, else brands.socials json
  case when (bp.social_instagram is not null or bp.social_twitter is not null or bp.social_facebook is not null or bp.social_linkedin is not null)
       then jsonb_strip_nulls(jsonb_build_object(
              'instagram', bp.social_instagram,
              'twitter',   bp.social_twitter,
              'facebook',  bp.social_facebook,
              'linkedin',  bp.social_linkedin
            ))
       else b.socials end                       as socials,
  coalesce(b.followers, 0)                      as followers,
  coalesce(bp.description, b.description)       as description,
  coalesce(bp.cover_url, b.cover_url)           as cover_url,
  coalesce(bp.avatar_url, bp.logo_url, b.logo_url) as logo_url,
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


