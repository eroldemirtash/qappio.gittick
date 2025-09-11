-- Create product-images storage bucket
-- Run this in Supabase Studio → SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
DROP POLICY IF EXISTS "product-images read" ON storage.objects;
CREATE POLICY "product-images read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product-images write" ON storage.objects;
CREATE POLICY "product-images write"
ON storage.objects FOR ALL TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','brand_manager'))
);

-- Allow service role to access all objects in product-images bucket
DROP POLICY IF EXISTS "product-images service role" ON storage.objects;
CREATE POLICY "product-images service role"
ON storage.objects FOR ALL TO service_role
USING (bucket_id = 'product-images');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE name = 'product-images';

