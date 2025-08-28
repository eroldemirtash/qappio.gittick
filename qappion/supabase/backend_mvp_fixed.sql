-- =========================
-- A) ENUM'lar
-- =========================
create type submission_status as enum ('review','approved','rejected');
create type mission_status as enum ('draft','active','closed');
create type follow_status as enum ('requested','accepted','blocked');
create type reward_status as enum ('active','inactive');
create type redemption_status as enum ('pending','completed','canceled');
create type tx_type as enum ('earn','spend','adjust');

-- =========================
-- B) Çekirdek Tablolar
-- =========================

-- 1) Profiller
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  username text unique,
  bio text,
  gender text check (gender in ('Erkek','Kadın','Diğer')),
  avatar_url text,
  followers_count int default 0,
  following_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;

-- 2) Takip
create table follows (
  follower_id uuid references auth.users on delete cascade,
  following_id uuid references auth.users on delete cascade,
  status follow_status not null default 'requested',
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);
alter table follows enable row level security;

-- 3) Markalar & Mağazalar
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  social jsonb,
  created_by uuid references auth.users on delete set null,
  is_verified boolean default false,
  created_at timestamptz default now()
);
alter table brands enable row level security;

create table brand_locations (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands on delete cascade,
  name text,
  city text,
  address text,
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);
alter table brand_locations enable row level security;

-- 4) Görevler (Missions)
create table missions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands on delete set null,
  title text not null,
  brief text,
  reward_points int not null default 0,
  location_required boolean default false,
  location_id uuid references brand_locations on delete set null,
  deadline timestamptz,
  status mission_status not null default 'active',
  sponsored_by_brand_id uuid references brands on delete set null,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);
alter table missions enable row level security;

-- 5) Görev Favori
create table mission_favorites (
  user_id uuid references auth.users on delete cascade,
  mission_id uuid references missions on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, mission_id)
);
alter table mission_favorites enable row level security;

-- 6) Gönderiler (Submissions)
create table submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  media jsonb not null,
  note text,
  status submission_status not null default 'review',
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamptz default now(),
  approved_at timestamptz
);
alter table submissions enable row level security;

-- 7) Beğeni/Yorum
create table submission_likes (
  submission_id uuid references submissions on delete cascade,
  user_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (submission_id, user_id)
);
alter table submission_likes enable row level security;

create table submission_comments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references submissions on delete cascade,
  user_id uuid references auth.users on delete cascade,
  text text not null,
  created_at timestamptz default now()
);
alter table submission_comments enable row level security;

-- 8) Cüzdan & Ödül Marketi
create table wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  amount int not null,
  type tx_type not null,
  reason text,
  meta jsonb,
  created_at timestamptz default now()
);
alter table wallet_transactions enable row level security;

create table reward_catalog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  brand_id uuid references brands on delete set null,
  points_cost int not null,
  stock int not null default 0,
  status reward_status not null default 'active',
  metadata jsonb,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);
alter table reward_catalog enable row level security;

create table reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  reward_id uuid not null references reward_catalog on delete restrict,
  points_cost int not null,
  status redemption_status not null default 'pending',
  code text,
  created_at timestamptz default now()
);
alter table reward_redemptions enable row level security;

-- 9) Bildirimler
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  type text not null check (type in ('mission','qappish','wallet','message','system','follow')),
  title text not null,
  body text,
  entity_type text,
  entity_id text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table notifications enable row level security;

-- =========================
-- C) RLS Politikaları
-- =========================

-- profiles
create policy "profiles select all" on profiles for select using (true);
create policy "profiles insert self" on profiles for insert with check (auth.uid() = id);
create policy "profiles update self" on profiles for update using (auth.uid() = id);

-- follows
create policy "follows select own relations" on follows
for select using (auth.uid() = follower_id or auth.uid() = following_id);
create policy "follows request" on follows
for insert with check (auth.uid() = follower_id and follower_id <> following_id);
create policy "follows cancel-unfollow" on follows
for delete using (auth.uid() = follower_id or auth.uid() = following_id);
create policy "follows accept" on follows
for update using (auth.uid() = following_id) with check (auth.uid() = following_id);

-- brands & locations
create policy "brands read public" on brands for select using (true);
create policy "brands manage creator" on brands for all using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "brand_locations read public" on brand_locations for select using (true);
create policy "brand_locations manage creator" on brand_locations for all using (
  auth.uid() = (select b.created_by from brands b where b.id = brand_locations.brand_id)
) with check (
  auth.uid() = (select b.created_by from brands b where b.id = brand_locations.brand_id)
);

-- missions
create policy "missions read public" on missions for select using (true);
create policy "missions manage creator" on missions for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

-- mission_favorites
create policy "fav select own" on mission_favorites for select using (auth.uid() = user_id);
create policy "fav insert own" on mission_favorites for insert with check (auth.uid() = user_id);
create policy "fav delete own" on mission_favorites for delete using (auth.uid() = user_id);

-- submissions
create policy "submissions read approved or owner or brand" on submissions
for select using (
  status = 'approved'
  or auth.uid() = user_id
  or exists (
    select 1
    from missions m
    left join brands b on b.id = m.brand_id
    where m.id = submissions.mission_id
      and (m.created_by = auth.uid() or b.created_by = auth.uid())
  )
);
create policy "submissions insert self" on submissions
for insert with check (auth.uid() = user_id);
create policy "submissions update owner or brand" on submissions
for update using (
  auth.uid() = user_id
  or exists (
    select 1
    from missions m
    left join brands b on b.id = m.brand_id
    where m.id = submissions.mission_id
      and (m.created_by = auth.uid() or b.created_by = auth.uid())
  )
);

-- likes & comments
create policy "likes select public" on submission_likes for select using (true);
create policy "likes insert self" on submission_likes for insert with check (auth.uid() = user_id);
create policy "likes delete self" on submission_likes for delete using (auth.uid() = user_id);

create policy "comments select public" on submission_comments for select using (true);
create policy "comments insert self" on submission_comments for insert with check (auth.uid() = user_id);
create policy "comments delete self" on submission_comments for delete using (auth.uid() = user_id);

-- wallet
create policy "wallet select own" on wallet_transactions for select using (auth.uid() = user_id);
create policy "wallet insert self spend-only" on wallet_transactions
for insert with check (auth.uid() = user_id);

-- rewards
create policy "reward read public" on reward_catalog for select using (status='active');
create policy "reward manage creator" on reward_catalog for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

-- redemptions
create policy "redemption select own" on reward_redemptions for select using (auth.uid() = user_id);
create policy "redemption insert own" on reward_redemptions for insert with check (auth.uid() = user_id);
create policy "redemption update own pending" on reward_redemptions for update using (auth.uid() = user_id);

-- notifications
create policy "notifs select own" on notifications for select using (auth.uid() = user_id);
create policy "notifs insert own" on notifications for insert with check (auth.uid() = user_id);
create policy "notifs update own" on notifications for update using (auth.uid() = user_id);

-- =========================
-- D) Yardımcı Görünümler & Fonksiyonlar
-- =========================

-- Bakiye view
create or replace view wallet_balances as
select user_id, coalesce(sum(amount),0)::int as balance
from wallet_transactions
group by user_id;

-- Fonksiyon: kullanıcının güncel bakiyesi
create or replace function fn_wallet_balance(p_user uuid)
returns int language sql stable as $$
  select coalesce(sum(amount),0)::int from wallet_transactions where user_id = p_user
$$;

-- Fonksiyon: Beğeni toggle
create or replace function fn_toggle_like(p_submission uuid)
returns void language plpgsql security definer as $$
begin
  if exists(select 1 from submission_likes where submission_id=p_submission and user_id=auth.uid()) then
    delete from submission_likes where submission_id=p_submission and user_id=auth.uid();
  else
    insert into submission_likes(submission_id,user_id) values (p_submission, auth.uid());
  end if;
end;
$$;

-- Fonksiyon: Görev'e gönderi yap (review durumunda)
create or replace function fn_submit(
  p_mission uuid,
  p_media jsonb,
  p_note text default null
) returns uuid
language plpgsql security definer as $$
declare new_id uuid;
begin
  insert into submissions(mission_id,user_id,media,note,status)
  values (p_mission, auth.uid(), p_media, p_note, 'review')
  returning id into new_id;
  return new_id;
end;
$$;

-- Fonksiyon: Ödül talep et (atomik)
create or replace function fn_redeem_reward(p_reward uuid)
returns uuid language plpgsql security definer as $$
declare r record; bal int; rid uuid;
begin
  select id, points_cost, stock into r from reward_catalog where id=p_reward and status='active' for update;
  if not found then raise exception 'Reward not found/active'; end if;
  if r.stock <= 0 then raise exception 'Out of stock'; end if;

  select fn_wallet_balance(auth.uid()) into bal;
  if bal < r.points_cost then raise exception 'Insufficient points'; end if;

  -- harcama ve redemption
  insert into wallet_transactions(user_id, amount, type, reason, meta)
    values (auth.uid(), -r.points_cost, 'spend', 'reward_redeem', jsonb_build_object('reward_id', p_reward));
  insert into reward_redemptions(user_id, reward_id, points_cost, status, code)
    values (auth.uid(), p_reward, r.points_cost, 'completed', substr(md5(gen_random_uuid()::text),1,10))
    returning id into rid;

  update reward_catalog set stock = stock - 1 where id = p_reward;

  -- bildirim
  insert into notifications(user_id, type, title, body, entity_type, entity_id)
    values (auth.uid(), 'wallet', 'Ödül alındı', 'Tebrikler! Ödülünüz tanımlandı.', 'reward', rid::text);

  return rid;
end;
$$;

-- =========================
-- E) Trigger'lar (Sayaç & Puan)
-- =========================

-- Beğeni sayacı
create or replace function trg_like_counter()
returns trigger language plpgsql as $$
begin
  if tg_op='INSERT' then
    update submissions set likes_count = likes_count + 1 where id = new.submission_id;
    -- Bildirim: gönderi sahibine
    insert into notifications(user_id, type, title, body, entity_type, entity_id)
      select s.user_id, 'qappish', 'Yeni beğeni', 'Gönderiniz beğenildi.', 'submission', s.id::text
      from submissions s where s.id = new.submission_id and s.user_id <> new.user_id;
    return new;
  elsif tg_op='DELETE' then
    update submissions set likes_count = greatest(likes_count - 1, 0) where id = old.submission_id;
    return old;
  end if;
  return null;
end;
$$;
drop trigger if exists t_like_counter_ins on submission_likes;
drop trigger if exists t_like_counter_del on submission_likes;
create trigger t_like_counter_ins after insert on submission_likes for each row execute function trg_like_counter();
create trigger t_like_counter_del after delete on submission_likes for each row execute function trg_like_counter();

-- Yorum sayacı
create or replace function trg_comment_counter()
returns trigger language plpgsql as $$
begin
  if tg_op='INSERT' then
    update submissions set comments_count = comments_count + 1 where id = new.submission_id;
    insert into notifications(user_id, type, title, body, entity_type, entity_id)
      select s.user_id, 'qappish', 'Yeni yorum', 'Gönderinize yorum yapıldı.', 'submission', s.id::text
      from submissions s where s.id = new.submission_id and s.user_id <> new.user_id;
    return new;
  elsif tg_op='DELETE' then
    update submissions set comments_count = greatest(comments_count - 1, 0) where id = old.submission_id;
    return old;
  end if;
  return null;
end;
$$;
drop trigger if exists t_comment_counter_ins on submission_comments;
drop trigger if exists t_comment_counter_del on submission_comments;
create trigger t_comment_counter_ins after insert on submission_comments for each row execute function trg_comment_counter();
create trigger t_comment_counter_del after delete on submission_comments for each row execute function trg_comment_counter();

-- Gönderi onaylanınca puan ekle + bildirim
create or replace function trg_submission_approve_reward()
returns trigger language plpgsql as $$
declare pts int;
begin
  if tg_op='UPDATE' and new.status='approved' and old.status is distinct from 'approved' then
    select reward_points into pts from missions where id = new.mission_id;
    if pts is null then pts := 0; end if;

    update submissions set approved_at = now() where id = new.id;

    if pts > 0 then
      insert into wallet_transactions(user_id, amount, type, reason, meta)
        values (new.user_id, pts, 'earn', 'mission_reward', jsonb_build_object('mission_id', new.mission_id, 'submission_id', new.id));
      insert into notifications(user_id, type, title, body, entity_type, entity_id)
        values (new.user_id, 'wallet', 'Puan yüklendi', 'Görevi tamamladığın için puan kazandın.', 'submission', new.id::text);
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists t_submission_approve_reward on submissions;
create trigger t_submission_approve_reward after update on submissions for each row execute function trg_submission_approve_reward();

-- Takip kabul edilince sayaç + bildirim
create or replace function trg_follow_counters()
returns trigger language plpgsql as $$
begin
  if tg_op='UPDATE' and new.status='accepted' and old.status is distinct from 'accepted' then
    update profiles set followers_count = followers_count + 1 where id = new.following_id;
    update profiles set following_count = following_count + 1 where id = new.follower_id;

    insert into notifications(user_id, type, title, body, entity_type, entity_id)
      values (new.follower_id, 'follow', 'Takip isteği kabul edildi', 'Artık birbirinizi takip ediyorsunuz.', 'user', new.following_id::text);
  end if;
  if tg_op='DELETE' then
    if old.status='accepted' then
      update profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
      update profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    end if;
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists t_follow_counters_upd on follows;
drop trigger if exists t_follow_counters_del on follows;
create trigger t_follow_counters_upd after update on follows for each row execute function trg_follow_counters();
create trigger t_follow_counters_del after delete on follows for each row execute function trg_follow_counters();

-- =========================
-- F) Storage RLS (avatars, submissions, chat)
-- =========================

-- Avatars: herkes okuyabilir; yazma sadece sahibi
create policy "avatars public read" on storage.objects
for select using (bucket_id = 'avatars');
create policy "avatars owner write" on storage.objects
for insert to authenticated with check (bucket_id='avatars' and owner = auth.uid());
create policy "avatars owner update" on storage.objects
for update to authenticated using (bucket_id='avatars' and owner = auth.uid())
with check (bucket_id='avatars' and owner = auth.uid());
create policy "avatars owner delete" on storage.objects
for delete to authenticated using (bucket_id='avatars' and owner = auth.uid());

-- Submissions: sadece sahibi veya gönderisi approved olanlar
create policy "subs read owner or approved" on storage.objects
for select using (
  bucket_id='submissions' and (
    owner = auth.uid()
    or exists (
      select 1 from submissions s
      where s.media @> jsonb_build_array(jsonb_build_object('path', name))
        and s.status = 'approved'
    )
  )
);
create policy "subs owner write" on storage.objects
for insert to authenticated with check (bucket_id='submissions' and owner = auth.uid());
create policy "subs owner update" on storage.objects
for update to authenticated using (bucket_id='submissions' and owner = auth.uid())
with check (bucket_id='submissions' and owner = auth.uid());
create policy "subs owner delete" on storage.objects
for delete to authenticated using (bucket_id='submissions' and owner = auth.uid());

-- Chat: sadece sahibi okuyup yazsın (DM görselleri için)
create policy "chat owner read" on storage.objects
for select using (bucket_id='chat' and owner = auth.uid());
create policy "chat owner write" on storage.objects
for insert to authenticated with check (bucket_id='chat' and owner = auth.uid());
create policy "chat owner update" on storage.objects
for update to authenticated using (bucket_id='chat' and owner = auth.uid())
with check (bucket_id='chat' and owner = auth.uid());
create policy "chat owner delete" on storage.objects
for delete to authenticated using (bucket_id='chat' and owner = auth.uid());

-- =========================
-- G) Seed (küçük örnekler)
-- =========================

-- Profil satırı yoksa oluşturma izni:
create policy "profiles owner insert" on profiles
for insert with check (auth.uid() = id);

-- Örnek marka ve görev (oturum sahibi creator kabul edilir)
insert into brands(name, created_by) values ('Mavi Jeans', auth.uid());

insert into missions(brand_id, title, brief, reward_points, status, created_by)
select b.id, 'Mavi - Sonbahar Vitrini', 'Vitrin önünde yaratıcı foto/video.', 50, 'active', b.created_by
from brands b where b.name='Mavi Jeans';
