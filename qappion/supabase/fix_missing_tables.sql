-- Fix Missing Tables - Run this in Supabase Studio → SQL Editor
-- This creates the missing missions table and fixes column references

-- 1) Create missions table (missing)
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  title text not null,
  brief text not null,
  description text null,
  media_type text check (media_type in ('photo','video')) default 'photo',
  reward_qp integer default 0,
  like_qp integer default 1,
  post_qp integer default 20,
  share_qp integer default 10,
  deadline timestamptz,
  status text check (status in ('draft','published','closed')) default 'draft',
  published boolean default false,
  starts_at timestamptz null,
  ends_at timestamptz null,
  is_qappio_of_week boolean default false,
  lat double precision,
  lng double precision,
  radius_m integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Add updated_at trigger for missions
drop trigger if exists trg_missions_updated_at on public.missions;
create trigger trg_missions_updated_at before update on public.missions
for each row execute function public.set_updated_at();

-- 3) Enable RLS for missions
alter table public.missions enable row level security;

-- 4) Create basic policy for missions
drop policy if exists "read published missions" on public.missions;
create policy "read published missions" on public.missions
  for select using (published = true);

-- 5) Add missing columns to brands if needed
alter table public.brands add column if not exists is_active boolean not null default true;

-- 6) Add missing columns to products if needed  
alter table public.products add column if not exists is_active boolean not null default true;
alter table public.products add column if not exists stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low','out_of_stock','hidden'));
alter table public.products add column if not exists stock_count integer;

-- 7) Create product_images table if missing
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

-- 8) Create product_marketplaces table if missing
create table if not exists public.product_marketplaces (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  marketplace text not null check (marketplace in ('Trendyol','Hepsiburada','Pazarama','Amazon','N11','Diğer')),
  product_url text not null,
  image_url text,
  position int not null default 0
);

-- 9) Create product_levels table if missing
create table if not exists public.product_levels (
  product_id uuid not null references public.products(id) on delete cascade,
  level text not null check (level in ('Snapper','Seeker','Crafter','Viralist','Qappian')),
  primary key (product_id, level)
);

-- 10) Enable RLS for product tables
alter table public.product_images enable row level security;
alter table public.product_marketplaces enable row level security;
alter table public.product_levels enable row level security;

-- 11) Create policies for product tables
drop policy if exists "read product images" on public.product_images;
create policy "read product images" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_images.product_id and p.is_active = true and p.stock_status <> 'hidden')
  );

drop policy if exists "read product marketplaces" on public.product_marketplaces;
create policy "read product marketplaces" on public.product_marketplaces
  for select using (
    exists (select 1 from public.products p where p.id = product_marketplaces.product_id and p.is_active = true and p.stock_status <> 'hidden')
  );

drop policy if exists "read product levels" on public.product_levels;
create policy "read product levels" on public.product_levels
  for select using (
    exists (select 1 from public.products p where p.id = product_levels.product_id and p.is_active = true and p.stock_status <> 'hidden')
  );

-- 12) Create v_products_public view
create or replace view public.v_products_public as
with cover as (
  select distinct on (pi.product_id)
    pi.product_id, pi.url as cover_url
  from public.product_images pi
  order by pi.product_id, pi.position asc, pi.created_at nulls last
),
images as (
  select product_id, json_agg(json_build_object('url', url, 'position', position) order by position asc) as images
  from public.product_images
  group by product_id
),
markets as (
  select product_id, json_agg(json_build_object('marketplace', marketplace, 'product_url', product_url, 'image_url', image_url, 'position', position) order by position asc) as marketplaces
  from public.product_marketplaces
  group by product_id
),
levels as (
  select product_id, array_agg(level order by level) as levels
  from public.product_levels
  group by product_id
)
select
  p.id,
  p.title,
  p.value_qp,
  p.stock_status,
  p.stock_count,
  p.is_active,
  b.name as brand_name,
  coalesce(b.logo_url, bp.avatar_url) as brand_logo,
  coalesce(c.cover_url, (select url from public.product_images where product_id = p.id order by position asc limit 1)) as cover_url,
  coalesce(i.images, '[]'::json) as images,
  coalesce(m.marketplaces, '[]'::json) as marketplaces,
  coalesce(l.levels, '{}'::text[]) as levels,
  p.created_at
from public.products p
join public.brands b on b.id = p.brand_id
left join public.brand_profiles bp on bp.brand_id = p.brand_id
left join cover c on c.product_id = p.id
left join images i on i.product_id = p.id
left join markets m on m.product_id = p.id
left join levels l on l.product_id = p.id
where p.is_active = true and p.stock_status <> 'hidden'
order by p.created_at desc;

-- Success message
select 'Missing tables created successfully!' as status;
