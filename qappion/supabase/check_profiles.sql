-- profiles tablosunun yapısını kontrol et
select column_name, data_type, is_nullable, column_default
from information_schema.columns 
where table_schema = 'public' 
and table_name = 'profiles'
order by ordinal_position;

-- Eğer role kolonu yoksa ekle
alter table public.profiles 
add column if not exists role text not null default 'viewer';

-- role kolonuna constraint ekle
alter table public.profiles 
drop constraint if exists profiles_role_check;

alter table public.profiles 
add constraint profiles_role_check 
check (role in ('admin','brand_manager','editor','viewer'));
