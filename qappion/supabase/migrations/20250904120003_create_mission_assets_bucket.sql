-- Create mission-assets bucket for mission cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-assets', 'mission-assets', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Policy for mission-assets: allow anyone to read (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'mission-assets');
    END IF;
END $$;

-- Policy for mission-assets: allow authenticated users to upload (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated uploads'
    ) THEN
        CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mission-assets' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Policy for mission-assets: allow authenticated users to update their own files (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated updates'
    ) THEN
        CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE USING (bucket_id = 'mission-assets' AND auth.uid() = owner) WITH CHECK (bucket_id = 'mission-assets' AND auth.uid() = owner);
    END IF;
END $$;

-- Policy for mission-assets: allow authenticated users to delete their own files (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Allow authenticated deletes'
    ) THEN
        CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (bucket_id = 'mission-assets' AND auth.uid() = owner);
    END IF;
END $$;
