-- Complete Tables Setup - Run this in Supabase Studio → SQL Editor
-- This creates all missing tables needed for the admin panel and mobile app

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Helper function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- 1) PROFILES (user roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','brand_manager','editor','viewer')) default 'viewer',
  brand_id uuid null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- 2) BRANDS
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at before update on public.brands
for each row execute function public.set_updated_at();

-- 3) BRAND PROFILES
create table if not exists public.brand_profiles (
  brand_id uuid primary key references public.brands(id) on delete cascade,
  handle text unique null,
  display_name text null,
  description text null,
  email text null,
  phone text null,
  website text null,
  category text null,
  founded_year int null,
  address text null,
  instagram text null,
  twitter text null,
  facebook text null,
  linkedin text null,
  license_plan text null,
  license_start date null,
  license_end date null,
  license_fee numeric(12,2) null,
  feat_mission_create boolean not null default false,
  feat_user_mgmt boolean not null default false,
  feat_analytics boolean not null default false,
  feat_api_access boolean not null default false,
  feat_priority_support boolean not null default false,
  avatar_url text null,
  cover_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_brand_profiles_updated_at on public.brand_profiles;
create trigger trg_brand_profiles_updated_at before update on public.brand_profiles
for each row execute function public.set_updated_at();

-- 4) MISSIONS
create type mission_status as enum ('draft','published','closed');
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
  status mission_status default 'draft',
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
drop trigger if exists trg_missions_updated_at on public.missions;
create trigger trg_missions_updated_at before update on public.missions
for each row execute function public.set_updated_at();

-- 5) PRODUCTS
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
  category text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
for each row execute function public.set_updated_at();

-- 6) PRODUCT IMAGES
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz default now()
);

-- 7) PRODUCT MARKETPLACES
create table if not exists public.product_marketplaces (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  marketplace text not null check (marketplace in ('Trendyol','Hepsiburada','Pazarama','Amazon','N11','Diğer')),
  product_url text not null,
  image_url text,
  position int not null default 0
);

-- 8) PRODUCT LEVELS
create table if not exists public.product_levels (
  product_id uuid not null references public.products(id) on delete cascade,
  level text not null check (level in ('Snapper','Seeker','Crafter','Viralist','Qappian')),
  primary key (product_id, level)
);

-- 9) AUTO CREATE BRAND PROFILE
create or replace function public.create_brand_profile_on_brand_insert()
returns trigger language plpgsql as $$
begin
  insert into public.brand_profiles (brand_id, display_name)
  values (new.id, new.name)
  on conflict (brand_id) do nothing;
  return new;
end $$;
drop trigger if exists trg_brands_after_insert on public.brands;
create trigger trg_brands_after_insert
after insert on public.brands
for each row execute function public.create_brand_profile_on_brand_insert();

-- 10) ENABLE RLS
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.missions enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_marketplaces enable row level security;
alter table public.product_levels enable row level security;

-- 11) BASIC POLICIES
-- Profiles: users can read their own profile
create policy if not exists "read own profile" on public.profiles
  for select using (id = auth.uid());

-- Brands: everyone can read
create policy if not exists "read brands" on public.brands
  for select using (true);

-- Brand profiles: everyone can read
create policy if not exists "read brand profiles" on public.brand_profiles
  for select using (true);

-- Missions: everyone can read published missions
create policy if not exists "read published missions" on public.missions
  for select using (published = true);

-- Products: everyone can read active products
create policy if not exists "read active products" on public.products
  for select using (is_active = true and stock_status <> 'hidden');

-- Product images: everyone can read if product is active
create policy if not exists "read product images" on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_images.product_id and p.is_active = true and p.stock_status <> 'hidden')
  );

-- Product marketplaces: everyone can read if product is active
create policy if not exists "read product marketplaces" on public.product_marketplaces
  for select using (
    exists (select 1 from public.products p where p.id = product_marketplaces.product_id and p.is_active = true and p.stock_status <> 'hidden')
  );

-- Product levels: everyone can read if product is active
create policy if not exists "read product levels" on public.product_levels
  for select using (
    exists (select 1 from public.products p where p.id = product_levels.product_id and p.is_active = true and p.stock_status <> 'hidden')
  );

-- Success message
select 'All tables created successfully!' as status;

