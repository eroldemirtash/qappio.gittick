-- Panel'in Supabase bağlantısını test et
-- Panel'den görev oluşturma testi

-- Test görevi oluştur
insert into missions (
  title, 
  description, 
  published, 
  is_qappio_of_week
) values (
  'Panel Test Görevi',
  'Bu görev panel\'den oluşturuldu',
  true,
  false
);

-- Oluşturulan görevi kontrol et
select 
  id, 
  title, 
  description, 
  published, 
  is_qappio_of_week,
  created_at
from missions 
where title = 'Panel Test Görevi'
order by created_at desc;
