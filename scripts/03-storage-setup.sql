-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('companion-images', 'companion-images', true);

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Storage policies for companion images bucket
CREATE POLICY "Anyone can view companion images" ON storage.objects
  FOR SELECT USING (bucket_id = 'companion-images');

CREATE POLICY "Service role can manage companion images" ON storage.objects
  FOR ALL USING (bucket_id = 'companion-images' AND auth.role() = 'service_role');
