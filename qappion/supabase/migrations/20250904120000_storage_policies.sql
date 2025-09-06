-- Storage policies for brand-assets bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to brand-assets
CREATE POLICY "Public read access for brand-assets" ON storage.objects
FOR SELECT USING (bucket_id = 'brand-assets');

-- Allow authenticated users to upload to brand-assets
CREATE POLICY "Authenticated upload to brand-assets" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');

-- Allow authenticated users to update brand-assets
CREATE POLICY "Authenticated update to brand-assets" ON storage.objects
FOR UPDATE USING (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete brand-assets
CREATE POLICY "Authenticated delete to brand-assets" ON storage.objects
FOR DELETE USING (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');
