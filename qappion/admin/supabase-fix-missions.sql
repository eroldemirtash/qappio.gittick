-- Fix missions schema for weekly-feature and sponsor support
-- Run this in Supabase Studio > SQL Editor

-- 1) Weekly feature flag
alter table public.missions
  add column if not exists is_qappio_of_week boolean not null default false;

-- 2) Sponsor relationship (FK to brands)
alter table public.missions
  add column if not exists sponsor_brand_id uuid;

do $$
begin
  -- add FK constraint if not exists
  if not exists (
    select 1 from pg_constraint
    where conname = 'missions_sponsor_brand_id_fkey'
  ) then
    alter table public.missions
      add constraint missions_sponsor_brand_id_fkey
      foreign key (sponsor_brand_id) references public.brands(id)
      on update cascade on delete set null;
  end if;
end $$;

-- 3) Helpful indexes
create index if not exists idx_missions_is_published on public.missions(is_published) where is_published = true;
create index if not exists idx_missions_is_qappio_of_week on public.missions(is_qappio_of_week) where is_qappio_of_week = true;
create index if not exists idx_missions_sponsor_brand_id on public.missions(sponsor_brand_id);

-- 4) Optional: ensure RLS continues to work (no change if already enabled)
-- alter table public.missions enable row level security;

-- Notes:
-- - Mobile query MUST embed brand with explicit relationship to avoid ambiguity:
--   brands!missions_brand_id_fkey ( ... )
-- - If you also embed sponsor, use alias:
--   sponsor_brand:brands!missions_sponsor_brand_id_fkey ( ... )

