-- Sadece tabloları oluştur (policy'ler olmadan)
-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- PROFILES tablosu (kullanıcı rolleri için)
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

-- BRANDS (yoksa oluştur)
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at before update on public.brands
for each row execute function public.set_updated_at();

-- BRAND PROFILES (her marka için tek profil)
create table if not exists public.brand_profiles (
  brand_id uuid primary key references public.brands(id) on delete cascade,
  handle text unique null,
  display_name text null,
  description text null,
  avatar_url text null,
  cover_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_brand_profiles_updated_at on public.brand_profiles;
create trigger trg_brand_profiles_updated_at before update on public.brand_profiles
for each row execute function public.set_updated_at();

-- BRAND INSERT → AUTO PROFILE
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

-- MISSIONS: haftanın qappiosu bayrağı
alter table public.missions
  add column if not exists is_qappio_of_week boolean not null default false;
create index if not exists idx_missions_qappio on public.missions(is_qappio_of_week);
create index if not exists idx_missions_published on public.missions(published);
