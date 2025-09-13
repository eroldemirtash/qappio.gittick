-- Brands tablosunu kontrol et
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'brands' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Brands tablosundaki kayıtları kontrol et
SELECT COUNT(*) as total_brands FROM public.brands;

-- İlk 3 kaydı göster
SELECT * FROM public.brands LIMIT 3;
