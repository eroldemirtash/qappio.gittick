-- Create mission-assets bucket for mission cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-assets', 'mission-assets', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Policy for mission-assets: allow anyone to read
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'mission-assets');

-- Policy for mission-assets: allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mission-assets' AND auth.role() = 'authenticated');

-- Policy for mission-assets: allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE USING (bucket_id = 'mission-assets' AND auth.uid() = owner) WITH CHECK (bucket_id = 'mission-assets' AND auth.uid() = owner);

-- Policy for mission-assets: allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (bucket_id = 'mission-assets' AND auth.uid() = owner);
