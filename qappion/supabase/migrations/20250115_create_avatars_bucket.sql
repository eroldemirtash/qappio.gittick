-- Create avatars bucket for profile images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
CREATE POLICY "Public read access for avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'public'
);
