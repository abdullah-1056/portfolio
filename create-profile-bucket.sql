-- Create profile-images bucket for storing profile pictures
-- Run this in Supabase SQL Editor: https://kvlblcgllmjeworkrivx.supabase.co

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to profile images
DROP POLICY IF EXISTS "Public read profile images" ON storage.objects;
CREATE POLICY "Public read profile images" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-images');

-- Allow anonymous/authenticated upload (for admin panel - dev mode)
DROP POLICY IF EXISTS "Anyone can upload profile images" ON storage.objects;
CREATE POLICY "Anyone can upload profile images" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Anyone can update profile images" ON storage.objects;
CREATE POLICY "Anyone can update profile images" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'profile-images')
WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Anyone can delete profile images" ON storage.objects;
CREATE POLICY "Anyone can delete profile images" ON storage.objects
FOR DELETE 
USING (bucket_id = 'profile-images');
