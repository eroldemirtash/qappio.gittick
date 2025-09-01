-- Missions okuma politikası
alter table public.missions enable row level security;

drop policy if exists "app read published missions" on public.missions;
create policy "app read published missions"
  on public.missions for select
  to anon, authenticated
  using (
    published = true
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
  );

-- Katılım tablosu (mission_participations)
create table if not exists public.mission_participations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  user_id uuid not null,
  image_url text not null,                 -- storage key: mission-submits/<user>/<mission>/<ts>.jpg
  caption text null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_mp_mission on public.mission_participations(mission_id);
create index if not exists idx_mp_user on public.mission_participations(user_id);
create unique index if not exists ux_mp_user_per_mission on public.mission_participations(mission_id, user_id);

alter table public.mission_participations enable row level security;

-- Okuma: sahibi (user) veya admin; Insert: authenticated; Update: admin
-- Varsayım: public.profiles(role) var (admin check için)
drop policy if exists "mp select self or admin" on public.mission_participations;
create policy "mp select self or admin"
  on public.mission_participations for select
  to authenticated, anon
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "mp insert auth" on public.mission_participations;
create policy "mp insert auth"
  on public.mission_participations for insert
  to authenticated
  with check ( user_id = auth.uid() );

drop policy if exists "mp update admin" on public.mission_participations;
create policy "mp update admin"
  on public.mission_participations for update
  to authenticated
  using ( exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') )
  with check ( exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') );

-- Storage bucket: mission-submits (private)
insert into storage.buckets (id, name, public)
values ('mission-submits','mission-submits', false)
on conflict (id) do nothing;

-- Upload/Read politikaları (kullanıcı kendi klasörüne yazsın/okusun)
-- Nesne adı 'userId/missionId/filename.jpg' formatında olacak.
drop policy if exists "mp storage insert own folder" on storage.objects;
create policy "mp storage insert own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'mission-submits'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "mp storage select own folder" on storage.objects;
create policy "mp storage select own folder"
on storage.objects for select to authenticated
using (
  bucket_id = 'mission-submits'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Admin her şeye erişsin (opsiyonel)
drop policy if exists "mp storage admin all" on storage.objects;
create policy "mp storage admin all"
on storage.objects for all to authenticated
using (
  bucket_id = 'mission-submits'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  bucket_id = 'mission-submits'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
