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
alter table public.profiles enable row level security;

-- Profiles RLS policies (profiles tablosu oluşturulduktan sonra)
-- Bu policy'ler dosyanın sonunda oluşturulacak

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

-- RLS
alter table public.brands enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.missions enable row level security;

-- OKUMA: anon + authenticated (app/panel)
drop policy if exists "app read brands" on public.brands;
create policy "app read brands" on public.brands
for select to anon, authenticated using (true);

drop policy if exists "app read brand profiles" on public.brand_profiles;
create policy "app read brand profiles" on public.brand_profiles
for select to anon, authenticated using (true);

drop policy if exists "app read published missions" on public.missions;
create policy "app read published missions" on public.missions
for select to anon, authenticated using (
  published = true
  and (starts_at is null or starts_at <= now())
  and (ends_at   is null or ends_at   >= now())
);

-- YAZMA: admin/brand_manager (varsayım: public.profiles(role) var)
-- BRANDS policies
drop policy if exists "brand insert brands" on public.brands;
create policy "brand insert brands" on public.brands
for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

drop policy if exists "brand update brands" on public.brands;
create policy "brand update brands" on public.brands
for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

drop policy if exists "brand delete brands" on public.brands;
create policy "brand delete brands" on public.brands
for delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

-- BRAND_PROFILES policies
drop policy if exists "brand insert brand_profiles" on public.brand_profiles;
create policy "brand insert brand_profiles" on public.brand_profiles
for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

drop policy if exists "brand update brand_profiles" on public.brand_profiles;
create policy "brand update brand_profiles" on public.brand_profiles
for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

drop policy if exists "brand delete brand_profiles" on public.brand_profiles;
create policy "brand delete brand_profiles" on public.brand_profiles
for delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

-- MISSIONS policies
drop policy if exists "brand insert missions" on public.missions;
create policy "brand insert missions" on public.missions
for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

drop policy if exists "brand update missions" on public.missions;
create policy "brand update missions" on public.missions
for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

drop policy if exists "brand delete missions" on public.missions;
create policy "brand delete missions" on public.missions
for delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','brand_manager')));

-- PROFILES RLS policies (en son oluştur)
drop policy if exists "read own profile or admin read all" on public.profiles;
create policy "read own profile or admin read all"
  on public.profiles for select
  to authenticated
  using ( id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

drop policy if exists "update own profile (limited) or admin" on public.profiles;
create policy "update own profile (limited) or admin"
  on public.profiles for update
  to authenticated
  using ( id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') )
  with check ( true );
