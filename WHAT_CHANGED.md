# What Changed - Resume Upload Feature

## Files Modified

### 1. `/src/pages/Admin.jsx`
- Changed resume upload to use separate `resumes` bucket instead of `project-images`
- Upload path simplified: `Abdullah_Al_Ifaque_Resume.pdf` (no subdirectory)
- Delete function now uses correct bucket: `'resumes'`

**Changes:**
```javascript
// Before:
uploadFileToStorage(SUPABASE_BUCKET, `resumes/Abdullah_Al_Ifaque_Resume.pdf`, file)
deleteFileFromStorage(SUPABASE_BUCKET, content.resume_url)

// After:
uploadFileToStorage('resumes', `Abdullah_Al_Ifaque_Resume.pdf`, file)
deleteFileFromStorage('resumes', content.resume_url)
```

## Files Created

### 2. `/create-resumes-bucket.sql`
- SQL script to create `resumes` storage bucket
- Sets up public read access
- Allows anyone to upload/update/delete (dev mode - insecure for production)

### 3. `/RESUME_SETUP_INSTRUCTIONS.md`
- Step-by-step guide for you
- How to run SQL in Supabase
- How to test upload/download
- Troubleshooting tips

### 4. `/WHAT_CHANGED.md` (this file)
- Summary of all changes

## What You Need to Do Now

1. **Run SQL in Supabase** (5 seconds)
   - Open: https://kvlblcgllmjeworkrivx.supabase.co
   - Go to SQL Editor → New Query
   - Copy content from `create-resumes-bucket.sql`
   - Paste and click **Run**

2. **Test Upload** (30 seconds)
   - `npm run dev` (if not running)
   - Go to: http://localhost:5173/mgmt-a7f3k9
   - Click **◆ Header**
   - Upload your resume PDF
   - Should show "✓ Resume uploaded successfully"

3. **Test Download** (10 seconds)
   - Go to: http://localhost:5173
   - Click **DOWNLOAD RESUME →** button
   - Resume should download

## How It Works

```
User clicks "DOWNLOAD RESUME →"
    ↓
Button href={get('resume_url')}
    ↓
Links to Supabase Storage public URL
    ↓
https://kvlblcgllmjeworkrivx.supabase.co/storage/v1/object/public/resumes/Abdullah_Al_Ifaque_Resume.pdf
    ↓
Browser downloads PDF
```

## Storage Structure

```
Supabase Storage
├── project-images/        (existing - for project photos)
│   └── projects/
│       ├── [project-id]/
│       │   ├── image1.jpg
│       │   └── image2.jpg
│       └── ...
│
└── resumes/               (new - for resume)
    └── Abdullah_Al_Ifaque_Resume.pdf  (always same name, overwrites on re-upload)
```

## Admin Panel Flow

1. **Upload**:
   - Admin selects PDF file
   - Uploads to `resumes/Abdullah_Al_Ifaque_Resume.pdf`
   - Gets public URL
   - Saves URL to `site_content.resume_url`

2. **Delete**:
   - Admin clicks DELETE
   - Removes file from Storage
   - Clears `site_content.resume_url`

3. **Re-upload**:
   - Upload new PDF
   - Overwrites old file (same filename)
   - Updates `site_content.resume_url` with new timestamp in URL

## Security Note

**Current setup (dev mode):**
- Anyone can upload/delete resumes ⚠️
- Fine for development
- **Change before production!**

**For production**, change SQL policies to:
```sql
-- Only authenticated users can upload/delete
CREATE POLICY "Authenticated upload resumes" ON storage.objects
FOR INSERT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete resumes" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');
```
