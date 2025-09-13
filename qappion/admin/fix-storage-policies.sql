-- Supabase Storage RLS politikalarını düzelt
-- Bu SQL'i Supabase Studio > SQL Editor'da çalıştır

-- 1. Mevcut politikaları temizle (tüm olası isimleri kontrol et)
DROP POLICY IF EXISTS "Public read access for brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update brand-assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete brand-assets" ON storage.objects;

-- 2. Yeni politikalar oluştur (daha basit)
-- Herkes bucket'ı okuyabilir
CREATE POLICY "Public read access for brand-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-assets');

-- Herkes upload edebilir (geçici olarak)
CREATE POLICY "Anyone can upload to brand-assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'brand-assets');

-- Herkes güncelleyebilir (geçici olarak)
CREATE POLICY "Anyone can update brand-assets" ON storage.objects
FOR UPDATE USING (bucket_id = 'brand-assets');

-- Herkes silebilir (geçici olarak)
CREATE POLICY "Anyone can delete brand-assets" ON storage.objects
FOR DELETE USING (bucket_id = 'brand-assets');

-- 3. Bucket'ın public olduğundan emin ol
UPDATE storage.buckets 
SET public = true 
WHERE id = 'brand-assets';
