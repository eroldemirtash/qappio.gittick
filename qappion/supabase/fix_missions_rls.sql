-- Missions RLS politikasını düzelt
-- Mobile app sadece published=true olan görevleri görmeli

-- Eksik kolonları ekle
alter table missions add column if not exists published boolean default false;
alter table missions add column if not exists starts_at timestamptz;
alter table missions add column if not exists ends_at timestamptz;
alter table missions add column if not exists is_qappio_of_week boolean default false;
alter table missions add column if not exists description text;

-- Mevcut politikayı sil
drop policy if exists "missions read public" on missions;

-- Yeni politika: sadece published=true olan görevleri herkese göster
create policy "missions read published" on missions 
for select 
using (published = true);

-- Önce brands ve users tablosunda veri var mı kontrol et
select 'brands count:' as info, count(*) as count from brands;
select 'users count:' as info, count(*) as count from auth.users;

-- Test için birkaç görev oluştur (sadece veri varsa)
do $$
begin
  if exists (select 1 from brands limit 1) and exists (select 1 from auth.users limit 1) then
    insert into missions (
      id, title, description, brand_id, created_by, 
      reward_points, published, starts_at, ends_at, is_qappio_of_week
    ) values 
    (
      gen_random_uuid(),
      'Test Görev 1',
      'Bu bir test görevidir',
      (select id from brands limit 1),
      (select id from auth.users limit 1),
      50,
      true,
      null,
      null,
      false
    ),
    (
      gen_random_uuid(),
      'Haftanın Qappiosu',
      'Bu haftanın öne çıkan görevi',
      (select id from brands limit 1),
      (select id from auth.users limit 1),
      100,
      true,
      null,
      null,
      true
    );
    raise notice 'Test görevleri oluşturuldu';
  else
    raise notice 'Brands veya users tablosu boş, test görevleri oluşturulamadı';
  end if;
end $$;

-- Mevcut görevleri kontrol et
select id, title, published, is_qappio_of_week, created_at 
from missions 
order by created_at desc 
limit 10;
