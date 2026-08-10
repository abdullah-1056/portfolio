-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE PORTFOLIO DATABASE SETUP
-- ═══════════════════════════════════════════════════════════════════════════════
-- This file combines all database migrations and setup steps
-- Run this in your Supabase SQL Editor in order
-- ═══════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 1: CREATE CORE TABLES
-- ───────────────────────────────────────────────────────────────────────────────

-- Site content (key-value pairs for one-off fields)
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triplet items (3 philosophy cards)
CREATE TABLE IF NOT EXISTS triplet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INT NOT NULL,
  title TEXT,
  body TEXT
);

-- Process steps (4 step workflow)
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INT NOT NULL,
  step_number TEXT,
  title TEXT,
  body TEXT
);

-- Skills (skill categories with tags)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INT NOT NULL,
  category TEXT,
  description TEXT,
  tags TEXT[],
  icon_svg TEXT,
  image_url TEXT
);

-- Projects (portfolio items)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INT NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT,
  tags TEXT[],
  live_url TEXT,
  repo_url TEXT
);

-- Education
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INT NOT NULL,
  institution TEXT,
  degree TEXT,
  start_year TEXT,
  end_year TEXT,
  description TEXT
);

-- Achievements & Certificates
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order" INT NOT NULL,
  title TEXT,
  issuer TEXT,
  date TEXT,
  description TEXT,
  credential_url TEXT,
  image_url TEXT
);

-- Contact form submissions
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

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 2: ADD ADDITIONAL COLUMNS (Migrations)
-- ───────────────────────────────────────────────────────────────────────────────

-- Add images array column to projects (for multiple images)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add custom links column to projects (GitHub, YouTube, etc.)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS links JSONB;

-- Add writeups column to skills (for article/writeup links)
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS writeups JSONB DEFAULT '[]'::jsonb;

-- Add column comments for documentation
COMMENT ON COLUMN skills.writeups IS 'Array of writeup objects: [{"label": "Title", "url": "https://..."}]';
COMMENT ON COLUMN projects.links IS 'Array of link objects: [{"label": "GitHub", "url": "https://..."}]';
COMMENT ON COLUMN projects.images IS 'Array of image URLs for project gallery';

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 3: INITIALIZE NULLABLE COLUMNS (Optional but recommended)
-- ───────────────────────────────────────────────────────────────────────────────

-- Initialize empty arrays for existing projects (if any)
UPDATE projects 
SET images = ARRAY[]::TEXT[] 
WHERE images IS NULL;

UPDATE projects 
SET links = '[]'::JSONB
WHERE links IS NULL;

-- Initialize empty arrays for existing skills (if any)
UPDATE skills
SET writeups = '[]'::jsonb
WHERE writeups IS NULL OR writeups = 'null'::jsonb;

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 4: MIGRATE LEGACY WRITEUP DATA (if you have old writeup_label/writeup_url)
-- ───────────────────────────────────────────────────────────────────────────────

-- Only migrate if you have existing writeup_label and writeup_url columns
-- Comment this out if you're setting up fresh database
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'skills' 
    AND column_name IN ('writeup_label', 'writeup_url')
  ) THEN
    UPDATE skills
    SET writeups = jsonb_build_array(
      jsonb_build_object(
        'label', COALESCE(writeup_label, ''),
        'url', COALESCE(writeup_url, '')
      )
    )
    WHERE (writeup_label IS NOT NULL AND writeup_label != '') 
       OR (writeup_url IS NOT NULL AND writeup_url != '');
  END IF;
END $$;

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 5: CREATE STORAGE BUCKETS
-- ───────────────────────────────────────────────────────────────────────────────

-- Create project-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Create writeups bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('writeups', 'writeups', true)
ON CONFLICT (id) DO NOTHING;

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 6: ENABLE ROW LEVEL SECURITY (RLS)
-- ───────────────────────────────────────────────────────────────────────────────

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE triplet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 7: CREATE RLS POLICIES - PUBLIC READ ACCESS
-- ───────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Public read site_content" ON site_content;
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read triplet_items" ON triplet_items;
CREATE POLICY "Public read triplet_items" ON triplet_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read process_steps" ON process_steps;
CREATE POLICY "Public read process_steps" ON process_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read skills" ON skills;
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read projects" ON projects;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read education" ON education;
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read achievements" ON achievements;
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 8: CREATE RLS POLICIES - AUTHENTICATED WRITE ACCESS
-- ───────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated write site_content" ON site_content;
CREATE POLICY "Authenticated write site_content" ON site_content
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write triplet_items" ON triplet_items;
CREATE POLICY "Authenticated write triplet_items" ON triplet_items
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write process_steps" ON process_steps;
CREATE POLICY "Authenticated write process_steps" ON process_steps
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write skills" ON skills;
CREATE POLICY "Authenticated write skills" ON skills
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write projects" ON projects;
CREATE POLICY "Authenticated write projects" ON projects
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write education" ON education;
CREATE POLICY "Authenticated write education" ON education
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated write achievements" ON achievements;
CREATE POLICY "Authenticated write achievements" ON achievements
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 9: CREATE RLS POLICIES - CONTACT FORM
-- ───────────────────────────────────────────────────────────────────────────────

-- Allow anyone to submit contact form
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
FOR INSERT WITH CHECK (true);

-- Only authenticated users can read submissions
DROP POLICY IF EXISTS "Authenticated users can read submissions" ON contact_submissions;
CREATE POLICY "Authenticated users can read submissions" ON contact_submissions
FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update submissions (mark as read)
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON contact_submissions;
CREATE POLICY "Authenticated users can update submissions" ON contact_submissions
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 10: CREATE STORAGE POLICIES - PROJECT IMAGES BUCKET
-- ───────────────────────────────────────────────────────────────────────────────

-- Public read for project images
DROP POLICY IF EXISTS "Public read project images" ON storage.objects;
CREATE POLICY "Public read project images" ON storage.objects
FOR SELECT USING (bucket_id = 'project-images');

-- Allow anyone to upload (for development - tighten in production)
DROP POLICY IF EXISTS "Anyone can upload project images" ON storage.objects;
CREATE POLICY "Anyone can upload project images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-images');

-- Allow anyone to update
DROP POLICY IF EXISTS "Anyone can update project images" ON storage.objects;
CREATE POLICY "Anyone can update project images" ON storage.objects
FOR UPDATE USING (bucket_id = 'project-images') WITH CHECK (bucket_id = 'project-images');

-- Allow anyone to delete
DROP POLICY IF EXISTS "Anyone can delete project images" ON storage.objects;
CREATE POLICY "Anyone can delete project images" ON storage.objects
FOR DELETE USING (bucket_id = 'project-images');

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 11: CREATE STORAGE POLICIES - RESUMES BUCKET
-- ───────────────────────────────────────────────────────────────────────────────

-- Public read for resumes
DROP POLICY IF EXISTS "Public read resumes" ON storage.objects;
CREATE POLICY "Public read resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes');

-- Allow anyone to upload resumes
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes');

-- Allow anyone to update resumes
DROP POLICY IF EXISTS "Anyone can update resumes" ON storage.objects;
CREATE POLICY "Anyone can update resumes" ON storage.objects
FOR UPDATE USING (bucket_id = 'resumes') WITH CHECK (bucket_id = 'resumes');

-- Allow anyone to delete resumes
DROP POLICY IF EXISTS "Anyone can delete resumes" ON storage.objects;
CREATE POLICY "Anyone can delete resumes" ON storage.objects
FOR DELETE USING (bucket_id = 'resumes');

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 12: CREATE STORAGE POLICIES - WRITEUPS BUCKET
-- ───────────────────────────────────────────────────────────────────────────────

-- Public read for writeups
DROP POLICY IF EXISTS "Public read writeups" ON storage.objects;
CREATE POLICY "Public read writeups" ON storage.objects
FOR SELECT USING (bucket_id = 'writeups');

-- Authenticated users can upload writeups
DROP POLICY IF EXISTS "Authenticated upload writeups" ON storage.objects;
CREATE POLICY "Authenticated upload writeups" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'writeups' AND auth.role() = 'authenticated');

-- Authenticated users can update writeups
DROP POLICY IF EXISTS "Authenticated update writeups" ON storage.objects;
CREATE POLICY "Authenticated update writeups" ON storage.objects
FOR UPDATE USING (bucket_id = 'writeups' AND auth.role() = 'authenticated') 
WITH CHECK (bucket_id = 'writeups' AND auth.role() = 'authenticated');

-- Authenticated users can delete writeups
DROP POLICY IF EXISTS "Authenticated delete writeups" ON storage.objects;
CREATE POLICY "Authenticated delete writeups" ON storage.objects
FOR DELETE USING (bucket_id = 'writeups' AND auth.role() = 'authenticated');

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 13: CREATE INDEXES FOR PERFORMANCE
-- ───────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at 
ON contact_submissions(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_order 
ON projects("order");

CREATE INDEX IF NOT EXISTS idx_skills_order 
ON skills("order");

CREATE INDEX IF NOT EXISTS idx_achievements_order 
ON achievements("order");

-- ───────────────────────────────────────────────────────────────────────────────
-- STEP 14: SEED INITIAL DATA (Optional)
-- ───────────────────────────────────────────────────────────────────────────────

INSERT INTO site_content (key, value) VALUES
  ('header_name', 'ABDULLAH AL IFAQUE'),
  ('hero_headline', 'LET''S BUILD<br>SOMETHING GREAT.<br>MOVE IN SILENCE.'),
  ('hero_subtext', 'Your next project deserves more than ordinary. Step into a space where quality is effortless, intentional, and always on.'),
  ('about_name', 'ABDULLAH AL<br>IFAQUE.'),
  ('about_bio', 'A dedicated student at Bangladesh University of Professionals, passionate about technology, design, and building impactful digital experiences—elegantly.'),
  ('stat_university', 'BUP'),
  ('stat_degree', 'CS'),
  ('stat_year', '2024'),
  ('process_title', 'SILENT BY NATURE.<br>POWERFUL BY <span class="accent">DESIGN</span>.'),
  ('calm_eyebrow', 'A CALM AND DELIBERATE PRESENCE'),
  ('calm_heading', 'IN A DIGITAL WORLD THAT NEVER STOPS MOVING, OFFERING QUIET DEDICATION WITHOUT ASKING FOR ATTENTION.'),
  ('skills_heading', 'THREE-LAYER SKILL SET'),
  ('qualities_heading', 'ESSENTIAL QUALITIES FOR A<br>MODERN DEVELOPER'),
  ('cta_headline', 'LET''S BUILD<br>SOMETHING GREAT.<br>MOVE IN SILENCE.'),
  ('cta_subtext', 'Your next project deserves more than ordinary. Step into a space where quality is effortless, intentional, and always on.'),
  ('footer_wordmark', 'IFAQUE'),
  ('footer_copyright', '©2024'),
  ('social_linkedin', '#'),
  ('social_github', '#')
ON CONFLICT (key) DO NOTHING;

INSERT INTO triplet_items ("order", title, body) VALUES
  (1, 'NO SHORTCUTS. NO EXCUSES.', 'All work is crafted with attention to detail, ensuring nothing is left half-finished. Every line of code is intentional—built to last.'),
  (2, 'BLOCK THE NOISE.', 'Focused and deliberate in approach. Every action is purposeful, with zero distractions and clear direction.'),
  (3, 'ONE SKILL. MANY DOORS.', 'From web development to design, each skill opens new possibilities and creates unique value in every project undertaken.')
ON CONFLICT DO NOTHING;

INSERT INTO process_steps ("order", step_number, title, body) VALUES
  (1, '01', 'RESEARCH & DISCOVERY', 'Before any code is written, the problem is deeply understood. Research drives every decision—ensuring the solution fits perfectly.'),
  (2, '02', 'DESIGN & PROTOTYPE', 'Clean interfaces are designed with user experience at the core. Prototypes are built to validate ideas before full development begins.'),
  (3, '03', 'DEVELOP & ITERATE', 'Code is written with precision using modern tools and frameworks. Continuous iteration ensures quality at every stage.'),
  (4, '04', 'DELIVER & REFINE', 'The final product is polished and delivered with care. Feedback is welcomed to continuously improve and refine the work.')
ON CONFLICT DO NOTHING;

INSERT INTO skills ("order", category, description, tags, icon_svg) VALUES
  (1, 'WEB DEVELOPMENT', 'Every project begins with clean, maintainable code that brings ideas to life with modern frameworks and best practices.', 
   ARRAY['REACT & TYPESCRIPT', 'UI/UX DESIGN'], 
   '<svg width="90" height="90" viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1"><polygon points="50,5 95,27 95,73 50,95 5,73 5,27" /><line x1="50" y1="5" x2="50" y2="95"/><line x1="5" y1="27" x2="95" y2="73"/><line x1="95" y1="27" x2="5" y2="73"/></svg>')
ON CONFLICT DO NOTHING;

INSERT INTO achievements ("order", title, issuer, date, description, credential_url) VALUES
  (1, 'React Developer Certification', 'Meta', '2024', 'Advanced React patterns and best practices certification from Meta.', '#'),
  (2, 'Full Stack Web Development', 'freeCodeCamp', '2023', 'Completed 300+ hours of full stack development coursework and projects.', '#'),
  (3, 'UI/UX Design Fundamentals', 'Google', '2023', 'User experience design principles and prototyping certification.', '#')
ON CONFLICT DO NOTHING;

INSERT INTO projects ("order", title, description, tags, live_url, repo_url) VALUES
  (1, 'E-Commerce Platform', 'Full-stack online shopping platform with payment integration, inventory management, and admin dashboard.', ARRAY['React', 'Node.js', 'MongoDB'], '#', '#'),
  (2, 'Task Management App', 'Collaborative project management tool with real-time updates, team collaboration, and progress tracking.', ARRAY['React', 'Firebase', 'Tailwind'], '#', '#'),
  (3, 'Portfolio CMS', 'Self-editable portfolio website with admin panel for content management without touching code.', ARRAY['React', 'Supabase', 'Vite'], '#', '#')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- SETUP COMPLETE! 
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Next Steps:
-- 1. Verify all tables were created: Check Table Editor in Supabase Dashboard
-- 2. Verify storage buckets: Check Storage section
-- 3. Test your admin panel: Log in and try editing content
-- 4. Check RLS policies: Storage > Policies (should see all policies)
--
-- ═══════════════════════════════════════════════════════════════════════════════
