-- Add missing profile fields to brands and brand_profiles

-- brands core fields
alter table if exists public.brands
  add column if not exists category text,
  add column if not exists email text,
  add column if not exists website_url text,
  add column if not exists socials jsonb,
  add column if not exists followers integer default 0,
  add column if not exists description text,
  add column if not exists cover_url text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- brand_profiles holds media URLs (logo/avatar/cover)
create table if not exists public.brand_profiles (
  brand_id uuid primary key references public.brands(id) on delete cascade,
  logo_url text,
  avatar_url text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists trg_brand_profiles_updated_at on public.brand_profiles;
create trigger trg_brand_profiles_updated_at
before update on public.brand_profiles
for each row execute function public.set_updated_at();

-- RLS (optional): keep disabled unless needed for app-side reads
alter table public.brand_profiles enable row level security;

-- Simple read policy for anon/authenticated (read-only)
do $$ begin
  begin
    create policy "read brand_profiles" on public.brand_profiles
      for select to anon, authenticated using (true);
  exception when duplicate_object then null; end;
end $$;

grant usage on schema public to anon, authenticated;
grant select on public.brands, public.brand_profiles to anon, authenticated;

-- Optional: light backfill for media from missions view if present
-- This is best-effort; adjust brand_name filter as needed in Studio when executing manually.
-- Example:
-- update public.brands b
-- set cover_url = coalesce(b.cover_url, vm.cover_url),
--     updated_at = now()
-- from public.v_missions_public vm
-- where vm.brand_name ilike '%Coca Cola%'
--   and (b.name ilike '%Coca Cola%');



