-- Panel'den oluşturulan görevleri published yap
-- Tüm görevleri listele
select 
  id, 
  title, 
  description, 
  published, 
  is_qappio_of_week,
  created_at,
  updated_at
from missions 
order by created_at desc;

-- Tüm görevleri published yap (test görevleri dahil)
update missions 
set published = true;

-- Güncellenmiş listeyi göster
select 
  id, 
  title, 
  description, 
  published, 
  is_qappio_of_week,
  created_at,
  updated_at
from missions 
order by created_at desc;
