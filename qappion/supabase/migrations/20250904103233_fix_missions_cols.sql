-- Ensure missions table has required columns for views and policies
alter table if exists public.missions
  add column if not exists is_published boolean not null default false,
  add column if not exists is_active boolean not null default true,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists cover_url text,
  add column if not exists qp_reward integer not null default 0;

-- Recreate view depending on these columns
create or replace view public.v_missions_public as
  select 
    m.id,
    m.brand_id,
    m.title,
    m.short_description,
    m.full_description,
    m.cover_url,
    m.qp_reward,
    m.like_qp,
    m.share_qp,
    m.status,
    m.starts_at,
    m.ends_at,
    m.is_published,
    m.is_active,
    m.created_at,
    b.name as brand_name,
    b.logo_url as brand_logo
  from public.missions m
  left join public.brands b on b.id = m.brand_id
  where m.is_published = true
    and m.is_active = true
    and (m.starts_at is null or m.starts_at <= now())
    and (m.ends_at   is null or m.ends_at   >= now());
