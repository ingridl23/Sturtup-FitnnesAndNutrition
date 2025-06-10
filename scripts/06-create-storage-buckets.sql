-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('pdfs', 'pdfs', true),
  ('videos', 'videos', true),
  ('anatomia', 'anatomia', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.role() = 'authenticated'
  );

-- Create storage policies for PDFs
CREATE POLICY "PDF files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdfs');

CREATE POLICY "Nutritionists can upload PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pdfs' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'nutricionista'
    )
  );

-- Create storage policies for videos
CREATE POLICY "Video files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Trainers can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND 
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() AND rol = 'entrenador'
    )
  );

-- Create storage policies for anatomy images
CREATE POLICY "Anatomy images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'anatomia');

CREATE POLICY "Authenticated users can upload anatomy images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'anatomia' AND 
    auth.role() = 'authenticated'
  );
