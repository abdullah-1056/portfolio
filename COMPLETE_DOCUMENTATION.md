# Complete Portfolio Documentation

**All-in-One Documentation Guide**  
*Combined from 15 separate documentation files*

---

## Table of Contents

1. [Quick Start & Setup](#quick-start--setup)
2. [Database Setup (SQL)](#database-setup-sql)
3. [Deployment Guide](#deployment-guide)
4. [Feature Guides](#feature-guides)
   - [Resume Upload](#resume-upload)
   - [Writeups System](#writeups-system)
   - [About Section Design](#about-section-design)
5. [Troubleshooting](#troubleshooting)
6. [Checklists](#checklists)

---

## Quick Start & Setup

### What You've Got

A fully functional portfolio CMS built with **ponytail principles**:
- ✓ Minimal dependencies (React, Vite, Supabase)
- ✓ Reused existing design/CSS
- ✓ Native HTML inputs (no form library)
- ✓ Direct DB queries (no ORM)
- ✓ ~200 lines of React per page
- ✓ No over-engineering

### 5-Minute Quickstart

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Setup Supabase (2 mins)
- Go to [supabase.com/dashboard](https://supabase.com/dashboard)
- Create new project
- SQL Editor → Paste `complete-setup.sql` → Run
- Auth → Users → Add user (this is your admin account)

#### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get these from: Supabase → Settings → API

#### 4. Run Locally
```bash
npm run dev
```

Open: http://localhost:5173

#### 5. Test Admin Panel
- Visit: http://localhost:5173/mgmt-a7f3k9
- Login with your Supabase user credentials
- Edit any field → saves automatically
- Reload public page → see changes

### File Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Router (public + admin)
├── index.css             # All styles
├── components/
│   ├── MatrixRain.jsx    # Background animation
│   └── Globe.jsx         # Rotating wireframe
├── pages/
│   ├── Home.jsx          # Public portfolio
│   └── Admin.jsx         # Content editor
└── lib/
    └── supabase.js       # DB client

complete-setup.sql        # Database schema + seed data
```

---

## Database Setup (SQL)

### All SQL Files Combined into One

The `complete-setup.sql` file contains everything:

1. ✅ Create all database tables (8 tables)
2. ✅ Add all additional columns (migrations)
3. ✅ Initialize nullable columns
4. ✅ Migrate legacy data
5. ✅ Create storage buckets (project-images, resumes, writeups)
6. ✅ Enable Row Level Security (RLS)
7. ✅ Create all RLS policies (read/write permissions)
8. ✅ Create storage policies for all buckets
9. ✅ Create performance indexes
10. ✅ Insert seed data (optional)

### How to Use

#### Option 1: Fresh Database Setup (Recommended)

If you're setting up a **new Supabase project**:

1. Go to your Supabase Dashboard
2. Open **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of **`complete-setup.sql`**
5. Paste into the editor
6. Click **Run** (or Ctrl+Enter)
7. Wait for completion (may take 10-15 seconds)
8. ✅ Done! Your entire database is set up.

#### Option 2: Existing Database (Migration)

If you already have some tables:

1. **Backup first!** (Supabase Dashboard → Database → Backups)
2. Open **`complete-setup.sql`**
3. The file uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`
4. Safe to run - it won't duplicate data
5. Run the entire file in SQL Editor
6. Existing data will be preserved, new features added

### What Gets Created

#### Tables (8 total):
- ✅ `site_content` - Key-value pairs for content
- ✅ `triplet_items` - Philosophy cards
- ✅ `process_steps` - Workflow steps
- ✅ `skills` - Skills with tags and writeups
- ✅ `projects` - Portfolio projects with images/links
- ✅ `education` - Education history
- ✅ `achievements` - Achievements and certificates
- ✅ `contact_submissions` - Contact form submissions

#### Storage Buckets (3 total):
- ✅ `project-images` - Project photos and images
- ✅ `resumes` - Resume PDF files
- ✅ `writeups` - Writeup/article PDFs

#### Policies:
- ✅ Public read access for all content
- ✅ Authenticated write access for admin
- ✅ Anyone can submit contact forms
- ✅ Storage upload/delete permissions

### Verification

After running the SQL:

**Check Tables:**
```
Supabase Dashboard → Table Editor
```
Should see 8 tables listed.

**Check Storage:**
```
Supabase Dashboard → Storage
```
Should see 3 buckets: `project-images`, `resumes`, `writeups`

**Check Policies:**
```
Supabase Dashboard → Authentication → Policies
```
Should see policies for all tables.

---

## Deployment Guide

### Pre-Deployment Checklist

1. ✓ React app built
2. ✓ Supabase tables created
3. ✓ RLS policies configured
4. ✓ Admin user created
5. ✓ Env vars ready

### Vercel Deployment

#### Method 1: CLI

```bash
npm install -g vercel
vercel login
vercel

# When prompted:
# - Link to existing project? N
# - Project name? portfolio (or your choice)
# - Directory? ./
```

Then add env vars:
```bash
vercel env add VITE_SUPABASE_URL
# paste your Project URL

vercel env add VITE_SUPABASE_ANON_KEY
# paste your anon key
```

Redeploy:
```bash
vercel --prod
```

#### Method 2: GitHub + Vercel Dashboard

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. New Project → Import Git Repository
4. Select your repo
5. Framework Preset: Vite
6. Environment Variables:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
7. Deploy

### Post-Deployment

1. Visit your site (e.g., `https://portfolio.vercel.app`)
2. Should see portfolio with default/seeded content
3. Visit `/mgmt-a7f3k9`
4. Login with your Supabase admin credentials
5. Edit content → saves → reflects on public site immediately

---

## Feature Guides

### Resume Upload

#### How It Works

- Resume is stored in Supabase Storage bucket: `resumes`
- Filename is always: `Abdullah_Al_Ifaque_Resume.pdf` (overwrites on re-upload)
- Public URL is saved in `site_content` table with key `resume_url`
- Anyone can download from your homepage
- Only admin panel can upload/delete

#### Upload Process

1. Make sure your dev server is running: `npm run dev`
2. Go to admin panel: http://localhost:5173/mgmt-a7f3k9
3. Click **◆ Header** in the left sidebar
4. Scroll down to the **Resume** section
5. Click **Choose File** and select your resume PDF
6. The file will upload automatically
7. You should see "✓ Resume uploaded successfully"

#### Delete and Re-upload

1. Go back to admin panel: http://localhost:5173/mgmt-a7f3k9 → **◆ Header**
2. You'll see the current resume with a **View Resume →** link
3. Click **DELETE** button to remove it from storage
4. Upload a new one using **Choose File** again

---

### Writeups System

#### Features

1. **Add Writeup Links Manually**
   - Click "+ Add Manual Link"
   - Enter label and URL
   - Works with Google Drive, PDFs, articles, etc.

2. **Automatic Storage Cleanup**
   - When you remove a Supabase-hosted writeup → file auto-deletes
   - When you delete a skill → all writeup files auto-delete
   - External links (Google Drive) are NOT affected

3. **Smart URL Detection**
   - 📁 **Supabase Storage** → Will be deleted when removed
   - 🔗 **External Link** → Only link removed, file untouched

#### How to Add Writeups

**Method: Manual Link Entry**

1. Go to **Admin Panel** → **04 — Skills**
2. Select a skill
3. Click **"+ Add Manual Link"**
4. Enter **Label**: e.g., "OverTheWire — Natas Writeup"
5. Enter **URL**: e.g., Google Drive link, PDF URL
6. Click **"Save Writeups"**

#### Supported URL Types

- 🔗 **Google Drive links** - `https://drive.google.com/...`
- 🔗 **Dropbox links** - `https://dropbox.com/...`
- 🔗 **Direct PDF URLs** - `https://example.com/writeup.pdf`
- 🔗 **Article links** - `https://medium.com/...`
- 🔗 **Any URL** - Any external link you want

#### Visual Indicators

Each writeup shows its storage type:

```
📁 Stored in Supabase (will be deleted when removed)
```
OR
```
🔗 External Google Drive link (not stored in Supabase)
```

#### What Gets Deleted Automatically

**When You Remove a Single Writeup:**
✅ File deleted from Supabase Storage (if stored there)  
✅ Link removed from database  
❌ External Google Drive files NOT affected

**When You Delete an Entire Skill:**
✅ Skill image deleted from storage  
✅ ALL writeup PDFs deleted from storage  
✅ All database records removed  
❌ External links remain on Google Drive

---

### About Section Design

#### Layout Changes

**Current Design:**
- Profile picture on RIGHT side (320x320px)
- Name and bio on LEFT
- Stats in HORIZONTAL ROW at bottom (BUP | CSE | 2022)

#### Desktop View:
```
┌─────────────────────────────────────────────┐
│                                             │
│   ABDULLAH AL IFAQUE        [Picture]       │
│                             320x320         │
│   Bio text describing                       │
│   your background...                        │
│                                             │
│   BUP      CSE      2022                    │
│ University Student  Batch                   │
│                                             │
└─────────────────────────────────────────────┘
```

#### Mobile View (<900px):
- Picture centered at top
- Content below
- Stats may wrap if screen is very narrow

#### Files Modified

1. **src/pages/Home.jsx**
   - Moved profile picture to right of content
   - Stats moved inside name-block at bottom
   - Horizontal stats layout

2. **src/index.css**
   - Updated `.about-content` flex layout
   - Changed `.side-stats` from column to row
   - Added responsive styles for mobile
   - Profile image size: 320x320px

---

## Troubleshooting

### Common Issues

#### Site is blank:
1. Check browser console for errors
2. Verify Supabase URL/key in Vercel env vars
3. Check Supabase project is running (not paused)

#### Admin login fails:
1. Verify user exists in Supabase Auth panel
2. Try resetting password in Supabase
3. Check network tab for auth errors

#### Content doesn't save:
1. Check RLS policies (should allow authenticated writes)
2. Verify you're logged in (session active)
3. Check Supabase logs for errors

#### Writeups still showing after delete:
**Fixed!** The database now updates immediately when you remove a writeup.

**How it works now:**
1. Click Remove → Deletes from storage (if Supabase)
2. Updates database immediately
3. Updates local state
4. Shows success message
5. Home page reflects changes

#### Images don't upload:
- Verify storage bucket exists
- Verify bucket is public
- Check storage policies allow authenticated writes

#### Resume not downloading:
- Check if `resume_url` exists in admin panel
- Make sure you uploaded a PDF file
- Try opening the "View Resume →" link directly

---

## Checklists

### Pre-Launch Checklist

#### Database Setup
- [ ] Supabase project created
- [ ] `complete-setup.sql` executed successfully
- [ ] All 8 tables exist
- [ ] 3 storage buckets exist
- [ ] RLS policies active
- [ ] Admin user created

#### Local Testing
- [ ] `npm install` completed
- [ ] `.env` file configured
- [ ] `npm run dev` starts successfully
- [ ] Public site loads
- [ ] Matrix rain animating
- [ ] Globe rotating
- [ ] All sections visible

#### Admin Panel Testing
- [ ] `/mgmt-a7f3k9` accessible
- [ ] Login works
- [ ] Can edit content
- [ ] Changes save
- [ ] Logout works
- [ ] Public site reflects edits

#### Build Verification
- [ ] `npm run build` completes
- [ ] No build errors
- [ ] `dist/` folder created

### Deployment Checklist

#### Vercel Setup
- [ ] Project deployed
- [ ] Env vars added (URL + KEY)
- [ ] Build completes
- [ ] Site URL generated

#### Production Testing
- [ ] Site loads without errors
- [ ] All sections visible
- [ ] Matrix rain active
- [ ] Globe rotating
- [ ] Navigation works

#### Admin Access (Production)
- [ ] Can access `/mgmt-a7f3k9`
- [ ] Login works
- [ ] Can edit content
- [ ] Changes save
- [ ] Public site reflects edits

#### Content Population
- [ ] Update Hero headline
- [ ] Update About bio
- [ ] Set University/Degree/Year
- [ ] Review/edit Triplet cards
- [ ] Review/edit Process steps
- [ ] Update Skills section
- [ ] Update Footer info
- [ ] Add LinkedIn URL
- [ ] Add GitHub URL

### Post-Launch Checklist

#### Optional Enhancements
- [ ] Add custom domain
- [ ] Add Projects section to admin
- [ ] Add Education section to admin
- [ ] Add image upload for Projects
- [ ] Add analytics
- [ ] Add sitemap.xml
- [ ] Add Open Graph meta tags

#### Security Check
- [ ] Admin URL not linked publicly
- [ ] Admin URL not in sitemap
- [ ] Service role key NOT in code
- [ ] `.env` file in `.gitignore`

#### Performance Check
- [ ] Test on mobile device
- [ ] Matrix rain performance acceptable
- [ ] Globe doesn't cause jank

#### Backup
- [ ] Export Supabase data (optional)
- [ ] Keep copy of admin credentials

---

## Success Indicators

### After Running `complete-setup.sql`:

- [ ] All 8 tables appear in Table Editor
- [ ] 3 storage buckets exist
- [ ] Admin panel loads without errors
- [ ] Can edit content in admin panel
- [ ] Can upload images/files
- [ ] Home page displays content correctly
- [ ] Contact form works

### After Deployment:

- [ ] Production site loads
- [ ] Admin panel accessible
- [ ] Content editable via admin
- [ ] Changes reflect immediately
- [ ] No console errors

---

## File Organization

### Documentation Files (This Replaces Them All):

All of the following are now combined in this file:

1. ❌ ABOUT_SECTION_REDESIGN.md
2. ❌ BEFORE_AFTER_FIX.md
3. ❌ CHECKLIST.md
4. ❌ DEPLOYMENT.md
5. ❌ FIX_APPLIED.md
6. ❌ RESUME_SETUP_INSTRUCTIONS.md
7. ❌ SETUP_CHECKLIST.md
8. ❌ SETUP.md
9. ❌ SQL_SETUP_GUIDE.md
10. ❌ UPLOAD_SECTION_REMOVED.md
11. ❌ WHAT_CHANGED.md
12. ❌ WRITEUP_DELETE_SUMMARY.md
13. ❌ WRITEUP_FLOW_DIAGRAM.md
14. ❌ WRITEUPS_FIX_GUIDE.md
15. ❌ WRITEUP_STORAGE_GUIDE.md

### Files to Keep:

- ✅ **COMPLETE_DOCUMENTATION.md** (This file)
- ✅ **PRD.md** (Product Requirements Document)
- ✅ **README.md** (Project overview)
- ✅ **complete-setup.sql** (Database setup)

---

## Quick Reference Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
```

### Deployment
```bash
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

### Database
```
Run complete-setup.sql in Supabase SQL Editor
```

### URLs
- Local: http://localhost:5173
- Admin: http://localhost:5173/mgmt-a7f3k9
- Production: https://your-site.vercel.app

---

## Support & Resources

### Official Documentation
- React: https://react.dev
- Vite: https://vitejs.dev
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs

### Your Project Files
- `complete-setup.sql` - Complete database setup
- `PRD.md` - Product requirements
- `README.md` - Project overview
- `COMPLETE_DOCUMENTATION.md` - This guide

---

**Your portfolio is ready to launch!** 🚀

*One file. Complete documentation. Zero confusion.*
