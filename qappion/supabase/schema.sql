-- QAPPION MVP DATABASE SCHEMA
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS: Supabase auth.users ile eşleşen profil tablosu
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  city text,
  interests text[] default '{}',
  push_token text, -- Expo push token
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BRANDS & STORES
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  name text not null,
  lat double precision,
  lng double precision,
  radius_m integer default 0, -- 0 = lokasyon şartı yok
  created_at timestamptz default now()
);

-- MISSIONS
create type mission_status as enum ('draft','published','closed');

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  store_id uuid references stores(id) on delete set null,
  title text not null,
  brief text not null,
  media_type text check (media_type in ('photo','video')) default 'photo',
  reward_qp integer default 0, -- "winner bonus"
  like_qp integer default 1,   -- like başına
  post_qp integer default 20,  -- submission başına
  share_qp integer default 10, -- dış paylaşım beyanı
  deadline timestamptz,
  status mission_status default 'draft',
  lat double precision, -- opsiyonel geofence
  lng double precision,
  radius_m integer default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- SUBMISSIONS
create type review_status as enum ('pending','approved','rejected');

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references missions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  media_url text not null,
  note text,
  share_declared boolean default false, -- kullanıcı "dış platformda paylaştım" dedi mi?
  status review_status default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LIKES (tekil)
create table public.likes (
  submission_id uuid references submissions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (submission_id, user_id)
);

-- WALLET: işlemler
create type txn_type as enum ('earn','spend','adjust');

create table public.wallet_txns (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  source text, -- e.g., 'submission:UUID', 'like:UUID', 'mission_winner:UUID', 'redemption:UUID'
  type txn_type not null,
  amount integer not null, -- + (earn/adjust up), - (spend/adjust down)
  created_at timestamptz default now()
);

-- REWARDS & REDEMPTIONS
create type redemption_status as enum ('requested','approved','rejected','fulfilled');

create table public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand_id uuid references brands(id) on delete set null,
  image_url text,
  cost_qp integer not null,
  stock integer default 999999,
  created_at timestamptz default now()
);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid references rewards(id) on delete restrict,
  user_id uuid references auth.users(id) on delete cascade,
  status redemption_status default 'requested',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- SIMPLE DERIVED VIEWS
create view public.user_balances as
select
  u.id as user_id,
  coalesce(sum(case when t.type in ('earn','adjust') and t.amount>0 then t.amount
                    when t.type='spend' or (t.type='adjust' and t.amount<0) then 0 end),0) as lifetime_earned_qp,
  coalesce(sum(t.amount),0) as spendable_qp
from auth.users u
left join wallet_txns t on t.user_id = u.id
group by u.id;

-- INDEXES
create index on submissions (mission_id, status);
create index on likes (submission_id);
create index on missions (status, deadline);
create index on wallet_txns (user_id, created_at);
create index on profiles (city);
create index on stores (brand_id);
create index on redemptions (user_id, status);

-- UNIQUE INDEX for idempotent transactions
create unique index on wallet_txns (user_id, source) where source is not null;

-- Trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_submissions_updated_at before update on submissions
  for each row execute procedure update_updated_at_column();

create trigger update_redemptions_updated_at before update on redemptions
  for each row execute procedure update_updated_at_column();
