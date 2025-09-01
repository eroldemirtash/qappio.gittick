-- Missions tablosuna eksik alanları ekle
-- Mobile app'teki görev kartı için gerekli alanlar

-- Kategori alanı ekle
alter table missions add column if not exists category text default 'Fotoğraf';

-- Görev puanı alanı ekle (reward_points yerine mission_points)
alter table missions add column if not exists mission_points integer default 100;

-- Marka kategorisi için brands tablosuna kategori alanı ekle
alter table brands add column if not exists category text default 'Genel';

-- Brands tablosuna eksik kolonları ekle
alter table brands add column if not exists logo_url text;
alter table brands add column if not exists website_url text;

-- Mevcut görevleri güncelle
update missions 
set 
  category = 'Fotoğraf',
  mission_points = 100
where category is null or mission_points is null;

-- Mevcut markaları güncelle
update brands 
set category = 'Genel'
where category is null;

-- Test için birkaç marka ekle (eğer yoksa)
insert into brands (id, name, category, logo_url, website_url, created_at, updated_at)
select 
  gen_random_uuid(), 'Nike Türkiye', 'Spor', 'https://picsum.photos/60/60?random=1', 'https://nike.com.tr', now(), now()
where not exists (select 1 from brands where name = 'Nike Türkiye');

insert into brands (id, name, category, logo_url, website_url, created_at, updated_at)
select 
  gen_random_uuid(), 'Adidas', 'Spor', 'https://picsum.photos/60/60?random=2', 'https://adidas.com.tr', now(), now()
where not exists (select 1 from brands where name = 'Adidas');

insert into brands (id, name, category, logo_url, website_url, created_at, updated_at)
select 
  gen_random_uuid(), 'Coca-Cola', 'İçecek', 'https://picsum.photos/60/60?random=3', 'https://coca-cola.com.tr', now(), now()
where not exists (select 1 from brands where name = 'Coca-Cola');

-- Güncellenmiş missions tablosunu kontrol et
select 
  id, 
  title, 
  description, 
  category,
  mission_points,
  brand_id,
  published, 
  starts_at, 
  ends_at,
  is_qappio_of_week,
  created_at
from missions 
order by created_at desc
limit 5;
