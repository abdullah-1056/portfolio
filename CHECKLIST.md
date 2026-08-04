# Go-Live Checklist

## Pre-Launch

### Database Setup
- [ ] Supabase project created
- [ ] SQL from `supabase-setup.sql` executed successfully
- [ ] All 6 tables exist (site_content, triplet_items, process_steps, skills, projects, education)
- [ ] RLS policies active (verify in Supabase → Authentication → Policies)
- [ ] Storage bucket `portfolio-assets` created (public read)
- [ ] Admin user created (Auth → Users)

### Local Testing
- [ ] `npm install` completed without errors
- [ ] `.env` file created with Supabase credentials
- [ ] `npm run dev` starts successfully
- [ ] Public site loads at http://localhost:5173
- [ ] Matrix rain animating in background
- [ ] Globe rotating in Process section
- [ ] All sections visible with seed data

### Admin Panel Testing
- [ ] `/mgmt-a7f3k9` route accessible
- [ ] Login works with admin credentials
- [ ] Dashboard loads all sections
- [ ] Can edit Hero headline → saves
- [ ] Can edit About bio → saves
- [ ] Can edit Triplet card → saves
- [ ] Can edit Process step → saves
- [ ] Can edit Skill → saves
- [ ] Logout button works
- [ ] After edit, public site reflects changes (hard refresh)

### Build Verification
- [ ] `npm run build` completes successfully
- [ ] No build errors or warnings (audit warnings are ok)
- [ ] `dist/` folder created

## Deployment

### Vercel Setup
- [ ] Vercel account created/logged in
- [ ] Project deployed (CLI or GitHub)
- [ ] Env vars added:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Build completes in Vercel
- [ ] Site URL generated (e.g., `portfolio-xxx.vercel.app`)

### Production Testing
- [ ] Visit production URL
- [ ] Site loads without console errors
- [ ] All sections visible
- [ ] Matrix rain active
- [ ] Globe rotating
- [ ] Footer links work
- [ ] Navigation anchors scroll correctly

### Admin Access (Production)
- [ ] Visit `your-site.vercel.app/mgmt-a7f3k9`
- [ ] Login works
- [ ] Can edit content
- [ ] Changes save
- [ ] Public site reflects edits immediately

### Content Population
- [ ] Update Hero headline (remove "silent" if not your vibe)
- [ ] Update About bio with your real info
- [ ] Set University/Degree/Year correctly
- [ ] Review/edit Triplet cards (philosophy statements)
- [ ] Review/edit Process steps
- [ ] Update Skills section
  - [ ] Category names
  - [ ] Descriptions
  - [ ] Tags
  - [ ] SVG icons if needed
- [ ] Update Footer wordmark (your name/brand)
- [ ] Set Copyright year
- [ ] Add LinkedIn URL (full URL with https://)
- [ ] Add GitHub URL (full URL with https://)

## Post-Launch

### Optional Enhancements
- [ ] Add custom domain (Vercel → Settings → Domains)
- [ ] Add Projects section to admin panel (extend `Admin.jsx`)
- [ ] Add Education section to admin panel
- [ ] Add image upload for Projects
- [ ] Add analytics (Vercel Analytics or Google Analytics)
- [ ] Add contact form backend (Supabase Edge Function or Formspree)
- [ ] Add sitemap.xml for SEO
- [ ] Add Open Graph meta tags

### Security Check
- [ ] Admin URL (`/mgmt-a7f3k9`) not linked anywhere public
- [ ] Admin URL not in sitemap
- [ ] Admin URL not shared publicly
- [ ] Supabase **service role** key NOT in code (only anon key)
- [ ] `.env` file in `.gitignore` (✓ already done)

### Performance Check
- [ ] Lighthouse score run (optional)
- [ ] Test on mobile device
- [ ] Test matrix rain performance on lower-end device
- [ ] Verify globe doesn't cause jank

### Backup
- [ ] Export Supabase data (optional, for peace of mind)
  - Supabase → Table Editor → Export (each table)
- [ ] Keep a copy of your admin credentials somewhere safe

## When Something Breaks

**Site is blank:**
1. Check browser console for errors
2. Verify Supabase URL/key in Vercel env vars
3. Check Supabase project is running (not paused)

**Admin login fails:**
1. Verify user exists in Supabase Auth panel
2. Try resetting password in Supabase
3. Check network tab for auth errors

**Content doesn't save:**
1. Check RLS policies (should allow authenticated writes)
2. Verify you're logged in (session active)
3. Check Supabase logs for errors

**Matrix rain kills performance:**
1. Reduce drop count in `MatrixRain.jsx` (lower `columns`)
2. Increase opacity fade (higher alpha in `fillRect`)
3. Consider disabling on mobile

## Done!

Your portfolio is live. Now you can:
- Edit content anytime via `/mgmt-a7f3k9`
- No redeploy needed for content changes
- Add Projects/Education sections when ready
- Share your URL

Move in silence. 🤫
