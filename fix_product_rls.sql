-- Products tablosu için RLS politikalarını kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

-- Products tablosuna SELECT izni ver
GRANT SELECT ON public.products TO anon, authenticated;

-- Product_images tablosuna SELECT izni ver  
GRANT SELECT ON public.product_images TO anon, authenticated;

-- Brands tablosuna SELECT izni ver
GRANT SELECT ON public.brands TO anon, authenticated;

-- Brand_profiles tablosuna SELECT izni ver
GRANT SELECT ON public.brand_profiles TO anon, authenticated;

-- Product_marketplaces tablosuna SELECT izni ver
GRANT SELECT ON public.product_marketplaces TO anon, authenticated;

-- Basit RLS politikaları oluştur
DROP POLICY IF EXISTS "app read products" ON public.products;
CREATE POLICY "app read products" ON public.products FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "app read product_images" ON public.product_images;
CREATE POLICY "app read product_images" ON public.product_images FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "app read brands" ON public.brands;
CREATE POLICY "app read brands" ON public.brands FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "app read brand_profiles" ON public.brand_profiles;
CREATE POLICY "app read brand_profiles" ON public.brand_profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "app read product_marketplaces" ON public.product_marketplaces;
CREATE POLICY "app read product_marketplaces" ON public.product_marketplaces FOR SELECT TO anon, authenticated USING (true);
