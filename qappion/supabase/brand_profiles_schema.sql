-- Brand Profiles Schema - Complete Implementation
-- Run this in Supabase Studio → SQL Editor

-- helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- brands (basit ana tablo)
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at before update on public.brands
for each row execute function public.set_updated_at();

-- brand_profiles (detay/profil)
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
  avatar_url text null, -- logo
  cover_url text null,  -- kapak
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_brand_profiles_updated_at on public.brand_profiles;
create trigger trg_brand_profiles_updated_at before update on public.brand_profiles
for each row execute function public.set_updated_at();

-- brands INSERT → otomatik profil
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

-- RLS
alter table public.brands enable row level security;
alter table public.brand_profiles enable row level security;

drop policy if exists "read brands" on public.brands;
create policy "read brands" on public.brands for select to anon, authenticated using (true);

drop policy if exists "read brand profiles" on public.brand_profiles;
create policy "read brand profiles" on public.brand_profiles for select to anon, authenticated using (true);

drop policy if exists "write brands" on public.brands;
create policy "write brands" on public.brands
for insert, update, delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

drop policy if exists "write brand profiles" on public.brand_profiles;
create policy "write brand profiles" on public.brand_profiles
for insert, update, delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

-- Storage: brand-assets (public read, admin yaz)
insert into storage.buckets (id, name, public)
values ('brand-assets','brand-assets', true)
on conflict (id) do nothing;

-- herkes okuyabilir (public bucket)
drop policy if exists "brand-assets read" on storage.objects;
create policy "brand-assets read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'brand-assets');

-- admin/brand_manager yazsın
drop policy if exists "brand-assets write" on storage.objects;
create policy "brand-assets write"
on storage.objects for insert, update, delete to authenticated
with check (
  bucket_id = 'brand-assets'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager'))
);
