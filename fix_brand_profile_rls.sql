-- Marka profil sayfası için RLS politikalarını düzelt
-- Bu script'i Supabase Studio'da çalıştır

-- Missions tablosu için RLS politikaları
DROP POLICY IF EXISTS "app read missions for brand profile" ON public.missions;
CREATE POLICY "app read missions for brand profile" 
ON public.missions FOR SELECT 
TO anon, authenticated 
USING (true);

-- Products tablosu için RLS politikaları  
DROP POLICY IF EXISTS "app read products for brand profile" ON public.products;
CREATE POLICY "app read products for brand profile" 
ON public.products FOR SELECT 
TO anon, authenticated 
USING (true);

-- Brands tablosu için RLS politikaları
DROP POLICY IF EXISTS "app read brands for profile" ON public.brands;
CREATE POLICY "app read brands for profile" 
ON public.brands FOR SELECT 
TO anon, authenticated 
USING (true);

-- Brand_profiles tablosu için RLS politikaları
DROP POLICY IF EXISTS "app read brand_profiles" ON public.brand_profiles;
CREATE POLICY "app read brand_profiles" 
ON public.brand_profiles FOR SELECT 
TO anon, authenticated 
USING (true);

-- Grant permissions
GRANT SELECT ON public.missions TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.brands TO anon, authenticated;
GRANT SELECT ON public.brand_profiles TO anon, authenticated;
