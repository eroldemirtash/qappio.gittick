-- Missions tablosuna cover_url alanını ekle
-- Mobile app'teki görev kartı için gerekli

-- cover_url alanını ekle
ALTER TABLE missions ADD COLUMN IF NOT EXISTS cover_url text;

-- Mevcut görevlere test cover_url'leri ekle
UPDATE missions 
SET cover_url = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&crop=center'
WHERE cover_url IS NULL AND id = (SELECT id FROM missions LIMIT 1);

-- Test için birkaç görev daha ekle (eğer yoksa)
INSERT INTO missions (
  id, 
  title, 
  brief, 
  description, 
  brand_id, 
  reward_qp, 
  published, 
  starts_at, 
  ends_at, 
  cover_url
)
SELECT 
  gen_random_uuid(),
  'Qappio Geliyor!',
  'Qappio uygulamasını keşfet ve paylaş',
  'Qappio uygulamasını indir, keşfet ve sosyal medyada paylaş. En yaratıcı paylaşımlar ödüllendirilecek!',
  (SELECT id FROM brands LIMIT 1),
  100,
  true,
  now(),
  now() + interval '7 days',
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&crop=center'
WHERE NOT EXISTS (SELECT 1 FROM missions WHERE title = 'Qappio Geliyor!');

-- Mevcut görevleri kontrol et
SELECT 
  id, 
  title, 
  cover_url, 
  published, 
  created_at 
FROM missions 
WHERE published = true 
ORDER BY created_at DESC 
LIMIT 5;

