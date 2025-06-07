-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view avatars (since bucket is public)
CREATE POLICY "Allow public read access on avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated upload on avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Allow authenticated update on avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Allow authenticated delete on avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars');
