-- Qappio base schema (brands, market, missions, submissions, likes, views, indexes, RLS)
-- Idempotent: uses IF NOT EXISTS where applicable

-- ====== ENUMS ======
create type public.mission_status as enum ('draft','scheduled','published','archived');
create type public.submission_status as enum ('pending','approved','rejected');

-- ====== BRANDS ======
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

-- ====== MARKET (CATEGORIES + PRODUCTS) ======
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  kind text not null default 'market', -- 'market' | 'mission' vs.
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  slug text unique,
  description text,
  price numeric(12,2) not null default 0,
  currency text not null default 'TRY',
  cover_url text,
  gallery jsonb default '[]'::jsonb,   -- ["url1","url2",...]
  stock integer default 0,
  is_published boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- ====== MISSIONS (Qappios) ======
create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  title text not null,
  slug text unique,
  short_description text,
  full_description text,
  cover_url text,                         -- UI bunu arıyor
  qp_reward integer not null default 0,   -- 500 QP
  like_qp integer not null default 1,     -- 1 beğeni = 1 QP (opsiyonel)
  share_qp integer not null default 10,   -- paylaşım QP (opsiyonel)
  status public.mission_status not null default 'draft',
  starts_at timestamptz,
  ends_at   timestamptz,
  is_published boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- ====== WEEKLY / SPOTLIGHT ======
create table if not exists public.spotlights (
  id uuid primary key default gen_random_uuid(),
  kind text not null, -- 'mission' | 'product'
  ref_id uuid not null, -- missions.id veya products.id
  label text,           -- "Haftanın Qappiosu" vb.
  position int not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- ====== USER ACTIVITIES ======
-- Kullanıcı postları (görev gönderimleri)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  user_id uuid not null,                    -- auth.users.id
  image_url text not null,
  caption text,
  likes_count int not null default 0,
  comments_count int not null default 0,
  status public.submission_status not null default 'pending',
  created_at timestamptz default now()
);

-- Beğeniler (tekil)
create table if not exists public.submission_likes (
  submission_id uuid references public.submissions(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz default now(),
  primary key (submission_id, user_id)
);

-- Views intentionally moved to a later migration to avoid dependency issues

-- ====== INDEXES ======
create index if not exists idx_products_published on public.products(is_published, is_active);
create index if not exists idx_spotlights_active on public.spotlights(is_active, starts_at, ends_at, kind, position);
create index if not exists idx_submissions_mission on public.submissions(mission_id, status, likes_count);

-- ====== RLS ======
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.missions enable row level security;
alter table public.spotlights enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_likes enable row level security;

-- Public read: sadece yayınlanmış/içerik aktif olan veriler
create policy "public_read_brands" on public.brands
  for select using (is_active = true);

create policy "public_read_categories" on public.categories
  for select using (is_active = true);

create policy "public_read_products" on public.products
  for select using (is_published = true and is_active = true);


create policy "public_read_spotlights" on public.spotlights
  for select using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

-- User activity RLS
-- Herkes onaylı gönderileri görebilir:
create policy "public_read_approved_submissions" on public.submissions
  for select using (status = 'approved');

-- Auth user kendi submission'ını ekleyebilir/güncelleyebilir/silebilir:
create policy "insert_own_submission" on public.submissions
  for insert with check (auth.uid() = user_id);

create policy "update_own_submission" on public.submissions
  for update using (auth.uid() = user_id);

create policy "delete_own_submission" on public.submissions
  for delete using (auth.uid() = user_id);

-- Likes: herkes görebilir
create policy "public_read_likes" on public.submission_likes
  for select using (true);

-- Auth user beğeni ekleyip kaldırabilir (kendi adına)
create policy "insert_own_like" on public.submission_likes
  for insert with check (auth.uid() = user_id);

create policy "delete_own_like" on public.submission_likes
  for delete using (auth.uid() = user_id);
