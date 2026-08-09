# Resume Upload Setup Instructions

## Step 1: Create the `resumes` bucket in Supabase

1. Open your Supabase project: https://kvlblcgllmjeworkrivx.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `create-resumes-bucket.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

## Step 2: Test Resume Upload

1. Make sure your dev server is running: `npm run dev`
2. Go to admin panel: http://localhost:5173/mgmt-a7f3k9
3. Click **◆ Header** in the left sidebar
4. Scroll down to the **Resume** section
5. Click **Choose File** and select your resume PDF
6. The file will upload automatically
7. You should see "✓ Resume uploaded successfully"

## Step 3: Test Resume Download

1. Go to your homepage: http://localhost:5173
2. Look for the **DOWNLOAD RESUME →** button in the hero section
3. Click it - your resume should download

## Step 4: Delete and Re-upload (Optional)

1. Go back to admin panel: http://localhost:5173/mgmt-a7f3k9 → **◆ Header**
2. You'll see the current resume with a **View Resume →** link
3. Click **DELETE** button to remove it from storage
4. Upload a new one using **Choose File** again

---

## How It Works

- Resume is stored in Supabase Storage bucket: `resumes`
- Filename is always: `Abdullah_Al_Ifaque_Resume.pdf` (overwrites on re-upload)
- Public URL is saved in `site_content` table with key `resume_url`
- Anyone can download from your homepage
- Only admin panel can upload/delete

## Troubleshooting

**Error: "Bucket 'resumes' not found"**
- Run the SQL in Step 1 again

**Resume not downloading on homepage**
- Check if `resume_url` exists in admin panel
- Make sure you uploaded a PDF file
- Try opening the "View Resume →" link directly

**Upload fails silently**
- Check browser console (F12) for errors
- Make sure file is PDF format
- File should be under 50MB
