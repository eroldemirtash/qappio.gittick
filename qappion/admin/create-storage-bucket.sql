-- Supabase Storage RLS politikaları
-- Bu SQL'i Supabase Studio > SQL Editor'da çalıştır

-- Bucket zaten var, sadece RLS politikalarını ekle
-- Herkes bucket'ı okuyabilir
CREATE POLICY "Public read access for brand-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-assets');

-- Authenticated kullanıcılar upload edebilir
CREATE POLICY "Authenticated users can upload to brand-assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brand-assets' 
  AND auth.role() = 'authenticated'
);

-- Authenticated kullanıcılar güncelleyebilir
CREATE POLICY "Authenticated users can update brand-assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'brand-assets' 
  AND auth.role() = 'authenticated'
);

-- Authenticated kullanıcılar silebilir
CREATE POLICY "Authenticated users can delete brand-assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'brand-assets' 
  AND auth.role() = 'authenticated'
);
