-- Sadece RLS policy'leri oluştur (tablolar zaten var)
-- Önce profiles tablosunun var olduğunu kontrol et
do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'profiles') then
    raise exception 'profiles tablosu bulunamadı. Önce 01_tables_only.sql dosyasını çalıştırın.';
  end if;
end $$;

-- RLS aktif et
alter table public.profiles enable row level security;
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

-- PROFILES RLS policies
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
  with check ( case when id = auth.uid() then role = old.role else true end );

-- YAZMA: admin/brand_manager
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
