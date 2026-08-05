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

-- Row Level Security (RLS)
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE triplet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Row Level Security (RLS) for achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public read triplet_items" ON triplet_items FOR SELECT USING (true);
CREATE POLICY "Public read process_steps" ON process_steps FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);

-- Public read access for achievements
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Authenticated write site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write triplet_items" ON triplet_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write process_steps" ON process_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write skills" ON skills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write projects" ON projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write education" ON education FOR ALL USING (auth.role() = 'authenticated');

-- Authenticated write access for achievements
CREATE POLICY "Authenticated write achievements" ON achievements FOR ALL USING (auth.role() = 'authenticated');

-- Seed data
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

-- Seed data for achievements
INSERT INTO achievements ("order", title, issuer, date, description, credential_url) VALUES
  (1, 'React Developer Certification', 'Meta', '2024', 'Advanced React patterns and best practices certification from Meta.', '#'),
  (2, 'Full Stack Web Development', 'freeCodeCamp', '2023', 'Completed 300+ hours of full stack development coursework and projects.', '#'),
  (3, 'UI/UX Design Fundamentals', 'Google', '2023', 'User experience design principles and prototyping certification.', '#')
ON CONFLICT DO NOTHING;

-- Seed data for projects
INSERT INTO projects ("order", title, description, tags, live_url, repo_url) VALUES
  (1, 'E-Commerce Platform', 'Full-stack online shopping platform with payment integration, inventory management, and admin dashboard.', ARRAY['React', 'Node.js', 'MongoDB'], '#', '#'),
  (2, 'Task Management App', 'Collaborative project management tool with real-time updates, team collaboration, and progress tracking.', ARRAY['React', 'Firebase', 'Tailwind'], '#', '#'),
  (3, 'Portfolio CMS', 'Self-editable portfolio website with admin panel for content management without touching code.', ARRAY['React', 'Supabase', 'Vite'], '#', '#')
ON CONFLICT DO NOTHING;
