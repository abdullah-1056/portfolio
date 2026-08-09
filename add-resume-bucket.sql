-- Create resumes bucket for storing resume PDFs
-- Run this in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to resumes
DROP POLICY IF EXISTS "Public read resumes" ON storage.objects;
CREATE POLICY "Public read resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

-- Allow anonymous/authenticated upload (for admin panel)
DROP POLICY IF EXISTS "Authenticated write resumes" ON storage.objects;
CREATE POLICY "Authenticated write resumes" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Authenticated update resumes" ON storage.objects;
CREATE POLICY "Authenticated update resumes" ON storage.objects
FOR UPDATE 
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');

DROP POLICY IF EXISTS "Authenticated delete resumes" ON storage.objects;
CREATE POLICY "Authenticated delete resumes" ON storage.objects
FOR DELETE 
USING (bucket_id = 'resumes');
