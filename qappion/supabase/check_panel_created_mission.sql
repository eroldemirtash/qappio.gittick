-- Panel'den oluşturulan görevi kontrol et
select 
  id, 
  title, 
  description, 
  published, 
  is_qappio_of_week,
  created_at,
  updated_at
from missions 
where title = 'Panel Test Görevi'
order by created_at desc;

-- Tüm görevleri listele (son 5)
select 
  id, 
  title, 
  description, 
  published, 
  is_qappio_of_week,
  created_at
from missions 
order by created_at desc
limit 5;
