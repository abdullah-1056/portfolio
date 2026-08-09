-- Create table to store contact form submissions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  service TEXT,
  budget TEXT,
  details TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (submit contact form)
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (admin panel)
CREATE POLICY "Authenticated users can read submissions" ON contact_submissions
FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update (mark as read)
CREATE POLICY "Authenticated users can update submissions" ON contact_submissions
FOR UPDATE USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at 
ON contact_submissions(submitted_at DESC);
