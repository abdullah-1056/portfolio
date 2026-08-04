# Deployment Guide

## Pre-Deployment Checklist

1. ✓ React app built
2. ✓ Supabase tables created
3. ✓ RLS policies configured
4. ✓ Admin user created
5. ✓ Env vars ready

## Supabase Setup (Detailed)

### Step 1: Create Project
- Go to [supabase.com](https://supabase.com)
- New Project → Choose name, password, region
- Wait for provisioning (~2 mins)

### Step 2: Run SQL
- Left sidebar → SQL Editor → New Query
- Paste entire contents of `supabase-setup.sql`
- Run (green play button)
- Should see "Success. No rows returned"

### Step 3: Create Storage Bucket
- Left sidebar → Storage
- New bucket → Name: `portfolio-assets`
- Public bucket: **ON**
- Create

### Step 4: Create Admin User
- Left sidebar → Authentication → Users
- Add user → Email + Password
- **Save these credentials** - you'll use them to login at `/mgmt-a7f3k9`

### Step 5: Get API Keys
- Left sidebar → Settings → API
- Copy:
  - Project URL (e.g., `https://xxxxx.supabase.co`)
  - `anon` `public` key (long string starting with `eyJ...`)

## Vercel Deployment

### Method 1: CLI

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

### Method 2: GitHub + Vercel Dashboard

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

## Post-Deployment

1. Visit your site (e.g., `https://portfolio.vercel.app`)
2. Should see portfolio with default/seeded content
3. Visit `/mgmt-a7f3k9`
4. Login with your Supabase admin credentials
5. Edit content → saves → reflects on public site immediately

## Custom Domain (Optional)

In Vercel dashboard:
- Project Settings → Domains
- Add domain → Follow DNS instructions

## Troubleshooting

**Site loads but content is empty:**
- Check browser console for errors
- Verify env vars are set in Vercel
- Verify SQL was run successfully in Supabase
- Check Supabase logs: Dashboard → Logs

**Admin login fails:**
- Verify user exists in Supabase: Auth → Users
- Check email/password match
- Try password reset in Supabase dashboard

**Content saves but doesn't appear:**
- Check RLS policies are created (should be automatic from SQL)
- Verify anon key matches in Vercel env vars
- Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

**Images don't upload (future feature):**
- Verify storage bucket `portfolio-assets` exists
- Verify bucket is public
- Check storage policies allow authenticated writes
