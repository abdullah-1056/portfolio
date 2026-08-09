-- Add custom links column to projects table
-- This allows flexible links like GitHub, YouTube, Live Demo, etc.
-- Run this in Supabase SQL Editor

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS links JSONB;

-- Optional: Initialize empty arrays for existing projects
UPDATE projects 
SET links = '[]'::JSONB
WHERE links IS NULL;

-- Example data structure:
-- links = [
--   {"label": "GitHub", "url": "https://github.com/user/repo"},
--   {"label": "YouTube Demo", "url": "https://youtube.com/watch?v=xxx"},
--   {"label": "Live Demo", "url": "https://example.com"}
-- ]
