-- Create resumes bucket for storing resume PDFs
-- Run this in Supabase SQL Editor: https://kvlblcgllmjeworkrivx.supabase.co

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to resumes
DROP POLICY IF EXISTS "Public read resumes" ON storage.objects;
CREATE POLICY "Public read resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

-- Allow anonymous/authenticated upload (for admin panel - dev mode)
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Anyone can update resumes" ON storage.objects;
CREATE POLICY "Anyone can update resumes" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Anyone can delete resumes" ON storage.objects;
CREATE POLICY "Anyone can delete resumes" ON storage.objects
FOR DELETE 
USING (bucket_id = 'resumes');
