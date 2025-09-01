-- Panel'den oluşturulan görevleri kontrol et
-- Tüm görevleri listele (panel'den olanları ayırt etmek için)
select 
  id, 
  title, 
  description, 
  published, 
  is_qappio_of_week,
  created_at,
  updated_at,
  case 
    when title like 'Test%' then 'Test Görev'
    when title like 'Qappio%' then 'Test Görev'
    else 'Panel Görevi'
  end as görev_tipi
from missions 
order by created_at desc;

-- Panel'den oluşturulan görevleri published yap (Test olmayanlar)
update missions 
set published = true 
where published = false 
and title not like 'Test%' 
and title not like 'Qappio%';

-- Güncellenmiş listeyi göster
select 
  id, 
  title, 
  description, 
  published, 
  is_qappio_of_week,
  created_at,
  updated_at,
  case 
    when title like 'Test%' then 'Test Görev'
    when title like 'Qappio%' then 'Test Görev'
    else 'Panel Görevi'
  end as görev_tipi
from missions 
order by created_at desc;
