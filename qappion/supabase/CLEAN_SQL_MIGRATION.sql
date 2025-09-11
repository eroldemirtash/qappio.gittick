-- uuid üretimi
create extension if not exists "pgcrypto";

-- ÜRÜNLER
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  title text not null,
  description text,
  usage_terms text,
  value_qp integer not null default 0,
  is_active boolean not null default true,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low','out_of_stock','hidden')),
  stock_count integer,
  category text not null default 'Elektronik' check (category in ('Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor', 'Kozmetik', 'Kitap', 'Oyuncak', 'Diğer')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- eksik kolonlar varsa ekle
alter table public.products
  add column if not exists value_qp integer not null default 0;
alter table public.products
  add column if not exists stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low','out_of_stock','hidden'));
alter table public.products
  add column if not exists stock_count integer;
alter table public.products
  add column if not exists usage_terms text;
alter table public.products
  add column if not exists category text not null default 'Elektronik' 
  check (category in ('Elektronik', 'Giyim', 'Ev & Yaşam', 'Spor', 'Kozmetik', 'Kitap', 'Oyuncak', 'Diğer'));

-- GÖRSELLER
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

-- PAZARYERLERİ
create table if not exists public.product_marketplaces (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  marketplace text not null check (marketplace in ('Trendyol','Hepsiburada','Pazarama','Amazon','N11','Diğer')),
  product_url text not null,
  image_url text,
  position int not null default 0
);

-- LEVEL / REYON (M2M)
create table if not exists public.product_levels (
  product_id uuid not null references public.products(id) on delete cascade,
  level text not null check (level in ('Snapper','Seeker','Crafter','Viralist','Qappian')),
  primary key (product_id, level)
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'UPDATE' then
    new.updated_at = now(); 
    return new; 
  elsif TG_OP = 'INSERT' then
    new.created_at = now();
    new.updated_at = now();
    return new;
  end if;
  return null;
end$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before insert or update on public.products
for each row execute procedure public.set_updated_at();

-- Drop and recreate view to fix column order
drop view if exists public.v_products_public;

-- VIEW: mobile Market bunu okur
create view public.v_products_public as
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
  p.description,
  p.usage_terms,
  p.value_qp,
  p.stock_status,
  p.stock_count,
  p.category,
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

-- RLS ve POLİTİKALAR
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_marketplaces enable row level security;
alter table public.product_levels enable row level security;
alter table public.brands enable row level security;
alter table public.brand_profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='products' and policyname='public_read_products') then
    create policy public_read_products on public.products
      for select using ( is_active = true and stock_status <> 'hidden' );
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_images' and policyname='public_read_product_images') then
    create policy public_read_product_images on public.product_images
      for select using (
        exists (select 1 from public.products p where p.id = product_images.product_id and p.is_active = true and p.stock_status <> 'hidden')
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_marketplaces' and policyname='public_read_product_marketplaces') then
    create policy public_read_product_marketplaces on public.product_marketplaces
      for select using (
        exists (select 1 from public.products p where p.id = product_marketplaces.product_id and p.is_active = true and p.stock_status <> 'hidden')
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='product_levels' and policyname='public_read_product_levels') then
    create policy public_read_product_levels on public.product_levels
      for select using (
        exists (select 1 from public.products p where p.id = product_levels.product_id and p.is_active = true and p.stock_status <> 'hidden')
      );
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='brands' and policyname='public_read_brands') then
    create policy public_read_brands on public.brands for select using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='brand_profiles' and policyname='public_read_brand_profiles') then
    create policy public_read_brand_profiles on public.brand_profiles for select using (true);
  end if;
end $$;
