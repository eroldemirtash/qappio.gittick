-- QAPPION RLS POLICIES

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.stores enable row level security;
alter table public.missions enable row level security;
alter table public.submissions enable row level security;
alter table public.likes enable row level security;
alter table public.wallet_txns enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;

-- PROFILES: kullanıcı kendi profilini select/update; herkes başka kullanıcıyı select
create policy "Users can view all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- BRANDS: public read, creators can manage their own
create policy "Brands are viewable by everyone" on brands for select using (true);
create policy "Users can insert brands" on brands for insert with check (auth.uid() = created_by);
create policy "Users can update own brands" on brands for update using (auth.uid() = created_by);

-- STORES: public read, brand owners can manage
create policy "Stores are viewable by everyone" on stores for select using (true);
create policy "Brand owners can insert stores" on stores for insert with check (
  exists (select 1 from brands where id = brand_id and created_by = auth.uid())
);
create policy "Brand owners can update stores" on stores for update using (
  exists (select 1 from brands where id = brand_id and created_by = auth.uid())
);

-- MISSIONS: published olanlar herkesçe görülebilir; draft sadece marka oluşturucusu
create policy "Published missions are viewable by everyone" on missions for select using (
  status = 'published' or 
  auth.uid() = created_by or
  exists (select 1 from brands where id = brand_id and created_by = auth.uid())
);
create policy "Brand owners can insert missions" on missions for insert with check (
  exists (select 1 from brands where id = brand_id and created_by = auth.uid())
);
create policy "Brand owners can update missions" on missions for update using (
  exists (select 1 from brands where id = brand_id and created_by = auth.uid())
);

-- SUBMISSIONS: kullanıcı kendi submission'ını görür; mission.brand sahipleri görür; approved olanlar public
create policy "Users can view submissions" on submissions for select using (
  auth.uid() = user_id or
  status = 'approved' or
  exists (
    select 1 from missions m 
    join brands b on m.brand_id = b.id 
    where m.id = mission_id and b.created_by = auth.uid()
  )
);
create policy "Users can insert own submissions" on submissions for insert with check (auth.uid() = user_id);
create policy "Users can update own submissions" on submissions for update using (auth.uid() = user_id);
create policy "Brand owners can update submission status" on submissions for update using (
  exists (
    select 1 from missions m 
    join brands b on m.brand_id = b.id 
    where m.id = mission_id and b.created_by = auth.uid()
  )
);

-- LIKES: authenticated herkes insert/delete kendi adına; select public
create policy "Likes are viewable by everyone" on likes for select using (true);
create policy "Users can insert own likes" on likes for insert with check (auth.uid() = user_id);
create policy "Users can delete own likes" on likes for delete using (auth.uid() = user_id);

-- WALLET_TXNS: kullanıcı sadece kendi kayıtlarını görür
create policy "Users can view own wallet transactions" on wallet_txns for select using (auth.uid() = user_id);
create policy "System can insert wallet transactions" on wallet_txns for insert with check (true); -- will be restricted by app logic

-- REWARDS: select public; insert/update/delete admin
create policy "Rewards are viewable by everyone" on rewards for select using (true);
-- Note: Admin actions will use service role, bypassing RLS

-- REDEMPTIONS: user kendi talebini görür; brand yetkilisi görür
create policy "Users can view own redemptions" on redemptions for select using (auth.uid() = user_id);
create policy "Brand owners can view redemptions for their rewards" on redemptions for select using (
  exists (
    select 1 from rewards r 
    join brands b on r.brand_id = b.id 
    where r.id = reward_id and b.created_by = auth.uid()
  )
);
create policy "Users can insert own redemptions" on redemptions for insert with check (auth.uid() = user_id);

-- Grant access to views
grant select on public.user_balances to authenticated;

-- Functions for safe operations
create or replace function public.grant_points_for_submission(
  p_user_id uuid,
  p_submission_id uuid,
  p_amount integer default 20
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.wallet_txns (user_id, source, type, amount)
  values (p_user_id, 'submission:' || p_submission_id, 'earn', p_amount)
  on conflict (user_id, source) do nothing;
end;
$$;

create or replace function public.grant_points_for_like(
  p_user_id uuid,
  p_like_source text,
  p_amount integer default 1
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.wallet_txns (user_id, source, type, amount)
  values (p_user_id, p_like_source, 'earn', p_amount)
  on conflict (user_id, source) do nothing;
end;
$$;

create or replace function public.toggle_like(
  p_submission_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_like_exists boolean;
  v_submission_owner uuid;
begin
  -- Check if like already exists
  select exists(
    select 1 from public.likes 
    where submission_id = p_submission_id and user_id = v_user_id
  ) into v_like_exists;
  
  -- Get submission owner
  select user_id into v_submission_owner 
  from public.submissions 
  where id = p_submission_id;
  
  if v_like_exists then
    -- Remove like
    delete from public.likes 
    where submission_id = p_submission_id and user_id = v_user_id;
    
    -- Remove points (negative transaction)
    insert into public.wallet_txns (user_id, source, type, amount)
    values (v_submission_owner, 'like:' || p_submission_id || ':' || v_user_id, 'adjust', -1)
    on conflict (user_id, source) do nothing;
    
    return false;
  else
    -- Add like
    insert into public.likes (submission_id, user_id) 
    values (p_submission_id, v_user_id);
    
    -- Grant points to submission owner
    perform public.grant_points_for_like(
      v_submission_owner, 
      'like:' || p_submission_id || ':' || v_user_id,
      1
    );
    
    return true;
  end if;
end;
$$;
