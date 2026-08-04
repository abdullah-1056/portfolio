# Abdullah Al Ifaque - Portfolio

Self-editable portfolio with dark "silent developer" aesthetic. Every text field editable via hidden admin panel.

## Stack

- **Frontend**: React + Vite (SPA)
- **Backend/DB**: Supabase (Postgres + Auth + Storage)
- **Styling**: Plain CSS with CSS variables
- **Hosting**: Vercel

## Setup

### 1. Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL in `supabase-setup.sql` via SQL Editor
3. Create storage bucket: `portfolio-assets` (public read)
4. Create admin user: Auth → Users → Add user (email/password)
5. Copy Project URL and anon key

### 2. Local Dev

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

Visit `http://localhost:5173`

### 3. Admin Access

Visit `/mgmt-a7f3k9` and login with your Supabase user credentials.

Edit any content → saves immediately to Supabase → reflects on public site.

### 4. Deploy to Vercel

```bash
npm run build
```

Deploy `dist/` folder to Vercel, add env vars:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
src/
  components/
    MatrixRain.jsx    # Background effect
    Globe.jsx         # Rotating wireframe globe
  pages/
    Home.jsx          # Public portfolio
    Admin.jsx         # Content management
  lib/
    supabase.js       # Supabase client
```

## Database Schema

- `site_content` - Key-value pairs (hero text, about bio, footer, etc.)
- `triplet_items` - 3 philosophy cards
- `process_steps` - 4-step workflow
- `skills` - Skill categories with tags and icons
- `projects` - Portfolio projects (add via admin)
- `education` - Education entries (add via admin)

All tables have RLS: public read, authenticated write.

## Ponytail Principles Applied

- ✓ Reused existing CSS/canvas code
- ✓ Native `<input>`, `<textarea>`, no form library
- ✓ Direct Supabase queries, no ORM
- ✓ One component per concern
- ✓ Minimal abstractions
- ✓ No unnecessary state management
