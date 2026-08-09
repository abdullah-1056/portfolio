-- Add images array column to projects table for multiple image uploads
-- Run this in Supabase SQL Editor

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Optional: Initialize empty arrays for existing projects
UPDATE projects 
SET images = ARRAY[]::TEXT[] 
WHERE images IS NULL;
