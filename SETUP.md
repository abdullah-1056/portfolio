# Quick Start Guide

## What You've Got

A fully functional portfolio CMS built with **ponytail principles**:
- ✓ Minimal dependencies (React, Vite, Supabase)
- ✓ Reused existing design/CSS
- ✓ Native HTML inputs (no form library)
- ✓ Direct DB queries (no ORM)
- ✓ ~200 lines of React per page
- ✓ No over-engineering

## 5-Minute Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase (2 mins)
- Go to [supabase.com/dashboard](https://supabase.com/dashboard)
- Create new project
- SQL Editor → Paste `supabase-setup.sql` → Run
- Storage → Create bucket: `portfolio-assets` (public)
- Auth → Users → Add user (this is your admin account)

### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: Supabase → Settings → API

### 4. Run Locally
```bash
npm run dev
```

Open: http://localhost:5173

### 5. Test Admin Panel
- Visit: http://localhost:5173/mgmt-a7f3k9
- Login with your Supabase user credentials
- Edit any field → saves automatically
- Reload public page → see changes

## What You Can Edit

Everything on the site is editable via admin panel:

**Hero Section:**
- Headline
- Subtext

**About:**
- Name
- Bio
- University/Degree/Year stats

**Triplet Cards (3 philosophy statements):**
- Title
- Body text

**Process Steps (4-step workflow):**
- Step numbers
- Titles
- Descriptions

**Skills:**
- Categories
- Descriptions
- Tags
- Icon SVG

**Footer:**
- Wordmark
- Copyright
- Social links

## File Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Router (public + admin)
├── index.css             # All styles (from your mockup)
├── components/
│   ├── MatrixRain.jsx    # Background animation
│   └── Globe.jsx         # Rotating wireframe
├── pages/
│   ├── Home.jsx          # Public portfolio
│   └── Admin.jsx         # Content editor
└── lib/
    └── supabase.js       # DB client

supabase-setup.sql        # Database schema + seed data
```

## How It Works

**Public Site (Home.jsx):**
1. On load, fetches all content from Supabase
2. Renders with data or falls back to defaults
3. Reuses exact CSS from your HTML mockup
4. Matrix rain + globe canvas extracted as components

**Admin Panel (Admin.jsx):**
1. Protected by Supabase Auth
2. Login with email/password at `/mgmt-a7f3k9`
3. Forms for every content field
4. Saves on blur → immediate DB write
5. Native inputs only (ponytail: platform has it)

**Database (Supabase):**
- RLS enabled: public read, authenticated write
- 6 tables: site_content, triplet_items, process_steps, skills, projects, education
- Seeded with your mockup content

## Adding Projects/Education

The admin panel currently handles text content. To add Projects and Education sections:

1. Add them to `Admin.jsx` (follow the Skills pattern)
2. Add matching sections to `Home.jsx`
3. Use the same form pattern (Input/Textarea components)

Or wait - you said you wanted to add these via admin panel after launch. They're ready in the database schema but not yet in the UI.

## Next Steps

1. **Test locally** - edit content, verify changes appear
2. **Setup Supabase** - follow steps above
3. **Deploy to Vercel** - see DEPLOYMENT.md
4. **Add real content** - via `/mgmt-a7f3k9` admin panel
5. **(Optional) Add Projects/Education UI** - extend admin panel

## Ponytail Philosophy Applied

- **Does this need to exist?** Only built what PRD specifies
- **Already in codebase?** Reused entire CSS/canvas code
- **Stdlib does it?** Native inputs, no React Hook Form
- **Platform feature?** Browser handles forms, localStorage considered for cache
- **Installed dependency?** Only 3: React, Supabase, React Router
- **One line?** `get()` helper for content lookups
- **Minimum that works** - No Redux, no form validation library, no CSS-in-JS, no component library

Result: **~500 lines total code** (excluding styles) for a full CMS-backed portfolio.

## Need Help?

Check:
- `README.md` - Overview
- `DEPLOYMENT.md` - Deployment guide  
- `supabase-setup.sql` - Database schema

Or review the PRD.md to see what was built and why.
