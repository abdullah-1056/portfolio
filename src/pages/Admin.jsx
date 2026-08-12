import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Admin UI color constants — change these to update admin editing colors
const ADMIN_BG = '#f9f9f6'
const ADMIN_BG_ALT = '#26e815'
const ADMIN_TEXT = '#000'
// Supabase storage buckets (set VITE_SUPABASE_BUCKET in env or dashboard)
const SUPABASE_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'project-images'
const WRITEUPS_BUCKET = 'writeups' // Separate bucket for writeup PDFs

// ─── Auth Shell ────────────────────────────────────────────────────────────────
export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else setMsg('Logged in!')
    setLoading(false)
  }

  if (!session) {
    // Require sign-in to avoid anonymous requests being blocked by RLS.
    // (Previously there was a DEV bypass here; it was removed to prevent RLS errors.)
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)'}}>
        <form onSubmit={login} style={{width:'340px',border:'1px solid var(--line)',padding:'48px',background:'var(--bg-alt)'}}>
          <h2 style={{marginBottom:'8px',fontSize:'18px',textTransform:'uppercase',letterSpacing:'0.06em'}}>Admin Login</h2>
          <p style={{fontSize:'12px',color:'var(--text-faint)',marginBottom:'32px'}}>Portfolio CMS</p>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{width:'100%',padding:'12px',marginBottom:'12px',background:'var(--bg)',border:'1px solid var(--line)',color:'var(--text-primary)',fontFamily:'var(--mono)',fontSize:'13px'}} required />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
            style={{width:'100%',padding:'12px',marginBottom:'24px',background:'var(--bg)',border:'1px solid var(--line)',color:'var(--text-primary)',fontFamily:'var(--mono)',fontSize:'13px'}} required />
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'13px',background:'var(--accent-blue)',color:'#000',border:'none',fontFamily:'var(--mono)',fontSize:'12px',fontWeight:'700',letterSpacing:'0.06em',cursor:'pointer',textTransform:'uppercase'}}>
            {loading ? 'Loading...' : 'Login'}
          </button>
          {msg && <div style={{marginTop:'12px',fontSize:'11px',color:'#ff4444'}}>{msg}</div>}
        </form>
      </div>
    )
  }

  return <AdminDashboard logout={() => supabase.auth.signOut()} />
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function AdminDashboard({ logout }) {
  const [content, setContent]           = useState({})
  const [triplets, setTriplets]         = useState([])
  const [skills, setSkills]             = useState([])
  const [, setAchievements] = useState([])
  const [projects, setProjects]         = useState([])
  const [msg, setMsg]                   = useState('')
  const [activeSection, setActiveSection] = useState('header')
  const [achTab, setAchTab] = useState('achievements')

 const load = () => {
    Promise.all([
      supabase.from('site_content').select('*'),
      supabase.from('triplet_items').select('*').order('order'),
      supabase.from('skills').select('*').order('order'),
      supabase.from('achievements').select('*').order('order'),
      supabase.from('projects').select('*').order('order'),
    ]).then(([c, t, s, a, pr]) => {
      setContent(Object.fromEntries((c.data || []).map(r => [r.key, r.value])))
      setTriplets(t.data || [])
      setSkills(s.data || [])
      setAchievements(a.data || [])
      setProjects(pr.data || [])
    })
  }

  useEffect(() => { load() }, [])

  const toast = (err) => {
    if (err) setMsg('Error: ' + err.message)
    else { setMsg('✓ Saved'); setTimeout(() => setMsg(''), 2000) }
  }

  // site_content upsert
  const sc = (key, value) => {
    setContent(c => ({ ...c, [key]: value }))
    supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() }).then(({ error }) => toast(error))
  }

  // generic table row update
  const updateRow = (table, rows, setRows, id, field, raw) => {
    // For tags: convert to array only when the existing row stores tags as an array
    let value = raw
    if (field === 'tags') {
      const existing = rows.find(r => r.id === id)
      const existingIsArray = existing && Array.isArray(existing.tags)
      if (existingIsArray) {
        value = typeof raw === 'string' ? raw.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(raw) ? raw : [])
      } else {
        // keep raw string (or whatever was passed) when DB expects a string
        value = raw
      }
    }
    const updated = rows.map(r => r.id === id ? { ...r, [field]: value } : r)
    setRows(updated)
    const row = updated.find(r => r.id === id)
    supabase.from(table).update(row).eq('id', id).then(({ error }) => toast(error))
  }

  // save a field value after editing (used for tags to avoid converting on every keystroke)
  const saveField = (table, rows, setRows, id, field, raw) => {
    let value = raw
    if (field === 'tags') {
      const existing = rows.find(r => r.id === id)
      const existingIsArray = existing && Array.isArray(existing.tags)
      if (existingIsArray) value = typeof raw === 'string' ? raw.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(raw) ? raw : [])
    }
    const updated = rows.map(r => r.id === id ? { ...r, [field]: value, _tags_edit: undefined } : r)
    setRows(updated)
    const row = updated.find(r => r.id === id)
    supabase.from(table).update(row).eq('id', id).then(({ error }) => toast(error))
  }

  // save writeups (array of {label,url}). Persists to `writeups` column if existing row has it,
  // otherwise falls back to storing the first writeup in `writeup_label`/`writeup_url`.
  const saveWriteups = (table, rows, setRows, id, rawArray) => {
    const existing = rows.find(r => r.id === id) || {}
    const existingHasWriteups = Array.isArray(existing.writeups)
    const valueForUpdate = {}
    if (existingHasWriteups) {
      valueForUpdate.writeups = rawArray
    } else {
      // fallback: set first item into legacy fields
      const first = (rawArray && rawArray.length > 0) ? rawArray[0] : { label: '', url: '' }
      valueForUpdate.writeup_label = first.label || ''
      valueForUpdate.writeup_url = first.url || ''
    }
    // update local rows
    const updated = rows.map(r => r.id === id ? { ...r, writeups: rawArray, _writeups_edit: undefined, writeup_label: valueForUpdate.writeup_label ?? r.writeup_label, writeup_url: valueForUpdate.writeup_url ?? r.writeup_url } : r)
    setRows(updated)
    const row = { ...updated.find(r => r.id === id), ...valueForUpdate }
    supabase.from(table).update(row).eq('id', id).then(({ error }) => toast(error))
  }

  // save custom links for projects (array of {label,url})
  const saveProjectLinks = (id, rawArray) => {
    const updated = projects.map(r => r.id === id ? { ...r, links: rawArray, _links_edit: undefined } : r)
    setProjects(updated)
    supabase.from('projects').update({ links: rawArray }).eq('id', id).then(({ error }) => toast(error))
  }

  // Small ListEditor component moved here so hooks are used at top-level of AdminDashboard
  function ListEditor({ contentKey }) {
    const raw = content[contentKey] || ''
    const items = typeof raw === 'string' ? raw.split('\n').filter(l => l.trim()) : Array.isArray(raw) ? raw : []
    const [local, setLocal] = useState(items)
    useEffect(() => setLocal(items), [raw])
    return (
      <div style={{border:'1px solid var(--line)',padding:'12px',marginBottom:'16px',background:'rgba(255,255,255,0.01)'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            {local.map((it, idx) => (
              <div key={idx} style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <div style={{width:18,textAlign:'center',color:'var(--accent-blue)',fontWeight:700}}>•</div>
                <input value={it} onChange={e => setLocal(l => l.map((x,i) => i===idx ? e.target.value : x))} style={{padding:'8px',minWidth:'320px',background:ADMIN_BG,color:ADMIN_TEXT,border:'1px solid rgba(0,0,0,0.12)'}} />
                <button onClick={() => {
                  if (!window.confirm('Remove this bullet?')) return
                  const next = local.filter((_,i) => i!==idx)
                  setLocal(next)
                  sc(contentKey, next.join('\n'))
                }} style={{padding:'6px 10px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>Remove</button>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={() => setLocal(l => [...l, ''])} style={{padding:'8px 12px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>+ Add Bullet</button>
            <button onClick={() => sc(contentKey, local.join('\n'))} style={{padding:'8px 12px',background:'var(--accent-blue)',cursor:'pointer',color:ADMIN_TEXT,border:'none'}}>Save</button>
          </div>
          <div style={{fontSize:'11px',color:'var(--text-faint)'}}>Hint: press Save to persist bullets.</div>
        </div>
      </div>
    )
  }

  // add new row
  const addRow = async (table, defaults, setRows) => {
    // attach owner_id from current session when available to satisfy RLS owner policies
    const { data: sessionData } = await supabase.auth.getSession()
    const uid = sessionData?.session?.user?.id
    const payload = uid ? { ...defaults, owner_id: uid } : defaults
    const { data, error } = await supabase.from(table).insert(payload).select()
    if (error) return toast(error)
    toast(null)
    load()
  }

  // Upload a file to Supabase Storage and return public URL
  const uploadFileToStorage = async (bucket, path, file) => {
    if (!file) return null
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true })
    if (error) {
      // Provide clearer guidance when bucket is missing
      if (error.message && error.message.toLowerCase().includes('bucket not found')) {
        toast(new Error(`Bucket "${bucket}" not found. Create a storage bucket named '${bucket}' in your Supabase project (Storage → Buckets) and make it public or adjust permissions.`))
      } else {
        toast(error)
      }
      return null
    }
    // get public URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicData?.publicUrl || null
  }

  // Extract storage path from Supabase public URL
  const getStoragePathFromUrl = (url) => {
    if (!url) return null
    try {
      // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
      return match ? match[1] : null
    } catch (e) {
      return null
    }
  }

  // Delete file from Supabase Storage
  const deleteFileFromStorage = async (bucket, url) => {
    const path = getStoragePathFromUrl(url)
    if (!path) return
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) console.error('Failed to delete file from storage:', error)
  }

  // handlers for project image file selection and upload
  const handleProjectFileSelect = (projectId, file) => {
    setProjects(rows => rows.map(r => r.id === projectId ? { ...r, _file: file } : r))
  }

  const handleProjectMultipleFilesSelect = (projectId, files) => {
    setProjects(rows => rows.map(r => r.id === projectId ? { ...r, _files: Array.from(files) } : r))
  }

  const uploadProjectImage = async (project) => {
    const file = project._file
    if (!file) return toast(new Error('No file selected'))
    const path = `projects/${project.id}/${Date.now()}_${file.name.replace(/[^a-z0-9._-]/gi,'')}`
    const publicUrl = await uploadFileToStorage(SUPABASE_BUCKET, path, file)
    if (publicUrl) {
      // update DB with the new image_url (exclude _file from update)
      const { _file, ...cleanRow } = project
      await supabase.from('projects').update({ image_url: publicUrl }).eq('id', project.id)
      // update local state
      setProjects(rows => rows.map(r => r.id === project.id ? { ...r, image_url: publicUrl, _file: undefined } : r))
      toast(null)
    }
  }

  const uploadProjectImages = async (project) => {
    const files = project._files
    if (!files || files.length === 0) return toast(new Error('No files selected'))
    
    setMsg(`Uploading ${files.length} images...`)
    const uploadedUrls = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setMsg(`Uploading image ${i + 1} of ${files.length}...`)
      const path = `projects/${project.id}/${Date.now()}_${file.name.replace(/[^a-z0-9._-]/gi,'')}`
      const publicUrl = await uploadFileToStorage(SUPABASE_BUCKET, path, file)
      if (publicUrl) uploadedUrls.push(publicUrl)
      // small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    if (uploadedUrls.length > 0) {
      // append to existing images array
      const existingImages = Array.isArray(project.images) ? project.images : []
      const newImages = [...existingImages, ...uploadedUrls]
      await supabase.from('projects').update({ images: newImages }).eq('id', project.id)
      setProjects(rows => rows.map(r => r.id === project.id ? { ...r, images: newImages, _files: undefined } : r))
      setMsg(`✓ Uploaded ${uploadedUrls.length} images successfully`)
      setTimeout(() => setMsg(''), 3000)
    } else {
      toast(new Error('No images were uploaded'))
    }
  }

  const removeProjectImage = async (projectId, imageUrl) => {
    if (!window.confirm('Delete this image from storage?')) return
    const project = projects.find(p => p.id === projectId)
    if (!project) return
    
    // Delete from Storage
    await deleteFileFromStorage(SUPABASE_BUCKET, imageUrl)
    
    // Remove from DB
    const newImages = (project.images || []).filter(img => img !== imageUrl)
    await supabase.from('projects').update({ images: newImages }).eq('id', projectId)
    setProjects(rows => rows.map(r => r.id === projectId ? { ...r, images: newImages } : r))
    toast(null)
  }

  const removeSingleProjectImage = async (projectId) => {
    if (!window.confirm('Delete featured image from storage and database?')) return
    const project = projects.find(p => p.id === projectId)
    if (!project || !project.image_url) return
    
    // Delete from Storage
    await deleteFileFromStorage(SUPABASE_BUCKET, project.image_url)
    
    // Remove from DB
    await supabase.from('projects').update({ image_url: null }).eq('id', projectId)
    setProjects(rows => rows.map(r => r.id === projectId ? { ...r, image_url: null } : r))
    toast(null)
  }

  // delete row - special handling for projects to clean up images
  const deleteRow = async (table, id, setRows, rows) => {
    // Special handling for projects: delete all images from Storage
    if (table === 'projects') {
      const project = rows.find(r => r.id === id)
      if (project) {
        if (!window.confirm(`Delete project "${project.title}" and all its images from storage?`)) return
        
        // Delete featured image
        if (project.image_url) {
          await deleteFileFromStorage(SUPABASE_BUCKET, project.image_url)
        }
        
        // Delete all gallery images
        if (Array.isArray(project.images)) {
          for (const imgUrl of project.images) {
            await deleteFileFromStorage(SUPABASE_BUCKET, imgUrl)
          }
        }
        
        setMsg('Deleting project and images...')
      }
    }
    
    // Special handling for skills: delete image and writeups from Storage
    if (table === 'skills') {
      const skill = rows.find(r => r.id === id)
      if (skill) {
        if (!window.confirm(`Delete skill "${skill.category}" and all its files?`)) return
        
        // Delete skill image if exists
        if (skill.image_url) {
          await deleteFileFromStorage(SUPABASE_BUCKET, skill.image_url)
        }
        
        // Delete all writeup PDFs from Storage (if they're hosted in Supabase)
        if (Array.isArray(skill.writeups)) {
          for (const writeup of skill.writeups) {
            if (writeup.url && writeup.url.includes('/storage/v1/object/public/')) {
              // Detect which bucket the file is in from the URL
              const bucket = writeup.url.includes('/writeups/') ? WRITEUPS_BUCKET : SUPABASE_BUCKET
              await deleteFileFromStorage(bucket, writeup.url)
            }
          }
        }
        
        setMsg('Deleting skill, image, and writeups...')
      }
    }
    
    // Delete from database
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return toast(error)
    setRows(rows.filter(r => r.id !== id))
    toast(null)
  }

  const navItems = [
    { id: 'header',       label: '◆ Header' },
    { id: 'home',         label: '01 Home' },
    { id: 'about',        label: '02 About' },
    { id: 'education',    label: '03 Education' },
    { id: 'skills',       label: '04 Skills' },
    { id: 'projects',     label: '05 Projects' },
    { id: 'achievements', label: '06 Achievements' },
    { id: 'triplets',     label: 'Statement Cards' },
    { id: 'contact',      label: '07 Contact' },
    { id: 'footer',       label: 'Footer' },
  ]

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)',color:'var(--text-primary)',fontFamily:'var(--mono)'}}>

      {/* Sidebar */}
      <aside style={{width:'220px',borderRight:'1px solid var(--line)',padding:'32px 0',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflowY:'auto',flexShrink:0}}>
        <div style={{padding:'0 24px 32px',fontSize:'12px',fontWeight:'700',letterSpacing:'0.08em',color:'var(--text-faint)'}}>ADMIN PANEL</div>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setActiveSection(n.id)}
            style={{textAlign:'left',padding:'12px 24px',background: activeSection===n.id ? 'rgba(94,200,248,0.08)' : 'transparent',
              border:'none',borderLeft: activeSection===n.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
              color: activeSection===n.id ? 'var(--accent-blue)' : 'var(--text-dim)',
              fontFamily:'var(--mono)',fontSize:'12px',letterSpacing:'0.04em',cursor:'pointer',transition:'all 0.2s'}}>
            {n.label}
          </button>
        ))}
        <div style={{marginTop:'auto',padding:'24px'}}>
          <button onClick={logout}
            style={{width:'100%',padding:'10px',border:'none',background:'var(--accent-blue)',color:ADMIN_TEXT,fontFamily:'var(--mono)',fontSize:'11px',cursor:'pointer',letterSpacing:'0.04em'}}>
            LOGOUT
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,padding:'48px 60px',overflowY:'auto',maxWidth:'900px'}}>
        {msg && (
          <div style={{position:'fixed',top:'24px',right:'24px',padding:'12px 20px',background: msg.startsWith('Error') ? '#ff4444' : 'var(--accent-blue)',
            color:'#000',fontSize:'12px',fontWeight:'700',zIndex:999,letterSpacing:'0.04em'}}>
            {msg}
          </div>
        )}

        {/* ── HEADER ── */}
        {activeSection === 'header' && (
          <Section title="Header">
            <Field label="Logo Name" value={content.header_name || ''} onChange={v => sc('header_name', v)} hint="Shown next to the ◆ diamond in the top-left" />
            <Divider label="Resume" />
            
            {content.resume_url && (
              <div style={{marginBottom:'16px',border:'1px solid var(--line)',padding:'16px',background:'rgba(0,0,0,0.02)'}}>
                <div style={{fontSize:'13px',color:'var(--text-dim)',marginBottom:'8px'}}>Current Resume:</div>
                <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                  <a href={content.resume_url} target="_blank" rel="noopener" style={{color:'var(--accent-blue)',fontSize:'13px',textDecoration:'underline'}}>
                    View Resume →
                  </a>
                  <button 
                    onClick={async () => {
                      if (!window.confirm('Delete current resume from storage?')) return
                      await deleteFileFromStorage('resumes', content.resume_url)
                      sc('resume_url', '')
                      toast(null)
                    }}
                    style={{padding:'6px 12px',background:'#ff4444',color:'#fff',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:'700'}}>
                    DELETE
                  </button>
                </div>
              </div>
            )}
            
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'12px',marginBottom:'8px',color:'var(--text-dim)'}}>Upload Resume (PDF)</label>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <input 
                  type="file" 
                  accept=".pdf,application/pdf" 
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    
                    if (!file.type.includes('pdf')) {
                      toast(new Error('Please upload a PDF file'))
                      return
                    }
                    
                    setMsg('Uploading resume...')
                    const path = `Abdullah_Al_Ifaque_Resume.pdf`
                    const publicUrl = await uploadFileToStorage('resumes', path, file)
                    
                    if (publicUrl) {
                      sc('resume_url', publicUrl)
                      setMsg('✓ Resume uploaded successfully')
                      setTimeout(() => setMsg(''), 3000)
                    }
                    e.target.value = '' // Reset input
                  }}
                />
              </div>
              <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'8px'}}>PDF files only. Will be saved to Supabase Storage.</div>
            </div>
          </Section>
        )}

        {/* ── HOME ── */}
        {activeSection === 'home' && (
          <Section title="01 — Home Hero">
            <Field label="Headline (HTML allowed)" value={content.hero_headline || ''} onChange={v => sc('hero_headline', v)} hint="Use <br/> for line breaks" />
            <Field label="Subtext" value={content.hero_subtext || ''} onChange={v => sc('hero_subtext', v)} multiline />
          </Section>
        )}

        {/* ── ABOUT ── */}
        {activeSection === 'about' && (
          <Section title="02 — About">
            <Divider label="Profile Picture" />
            
            {content.profile_image_url && (
              <div style={{marginBottom:'16px',border:'1px solid var(--line)',padding:'16px',background:'rgba(0,0,0,0.02)'}}>
                <div style={{fontSize:'13px',color:'var(--text-dim)',marginBottom:'8px'}}>Current Profile Picture:</div>
                <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                  <img src={content.profile_image_url} alt="Profile" style={{width:'120px',height:'120px',objectFit:'cover',border:'2px solid var(--accent-blue)',borderRadius:'4px'}} />
                  <button 
                    onClick={async () => {
                      if (!window.confirm('Delete profile picture from storage?')) return
                      await deleteFileFromStorage(SUPABASE_BUCKET, content.profile_image_url)
                      sc('profile_image_url', '')
                      toast(null)
                    }}
                    style={{padding:'6px 12px',background:'#ff4444',color:'#fff',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:'700'}}>
                    DELETE
                  </button>
                </div>
              </div>
            )}
            
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'12px',marginBottom:'8px',color:'var(--text-dim)'}}>Upload Profile Picture</label>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp" 
                  onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    
                    if (!file.type.startsWith('image/')) {
                      toast(new Error('Please upload an image file (JPG, PNG, WebP)'))
                      return
                    }
                    
                    setMsg('Uploading profile picture...')
                    const path = `profile/profile_${Date.now()}.${file.name.split('.').pop()}`
                    const publicUrl = await uploadFileToStorage(SUPABASE_BUCKET, path, file)
                    
                    if (publicUrl) {
                      // Delete old image if exists
                      if (content.profile_image_url) {
                        await deleteFileFromStorage(SUPABASE_BUCKET, content.profile_image_url)
                      }
                      sc('profile_image_url', publicUrl)
                      setMsg('✓ Profile picture uploaded successfully')
                      setTimeout(() => setMsg(''), 3000)
                    }
                    e.target.value = '' // Reset input
                  }}
                />
              </div>
              <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'8px'}}>Recommended: 200x200px or larger, square image. JPG, PNG, or WebP.</div>
            </div>
            
            <Divider label="About Info" />
            <Field label="Name (HTML allowed)" value={content.about_name || ''} onChange={v => sc('about_name', v)} hint="Use <br> for line breaks" />
            <Field label="Bio" value={content.about_bio || ''} onChange={v => sc('about_bio', v)} multiline />
            <Divider label="Side Stats" />
            <Row>
              <Field label="University (stat)" value={content.stat_university || ''} onChange={v => sc('stat_university', v)} hint="e.g. BUP" />
              <Field label="Degree (stat)" value={content.stat_degree || ''} onChange={v => sc('stat_degree', v)} hint="e.g. CSE" />
              <Field label="Batch Year (stat)" value={content.stat_year || ''} onChange={v => sc('stat_year', v)} hint="e.g. 2022" />
            </Row>
          </Section>
        )}

        {/* ── EDUCATION ── */}
        {activeSection === 'education' && (
          <Section title="03 — Education">
            <Divider label="Degree Card" />
            <Row>
              <Field label="Degree Badge" value={content.edu_degree_badge || ''} onChange={v => sc('edu_degree_badge', v)} hint="e.g. B.Sc." />
              <Field label="Year Range" value={content.edu_year_range || ''} onChange={v => sc('edu_year_range', v)} hint="e.g. 2022 — 2026" />
            </Row>
            <Field label="Institution Full Name" value={content.edu_inst_name || ''} onChange={v => sc('edu_inst_name', v)} hint="e.g. Bangladesh University of Professionals" />
            <Row>
              <Field label="Abbreviation" value={content.edu_inst_abbr || ''} onChange={v => sc('edu_inst_abbr', v)} hint="e.g. BUP" />
              <Field label="Department/Program" value={content.edu_program || ''} onChange={v => sc('edu_program', v)} hint="e.g. Computer Science & Engineering" />
            </Row>
            <Row>
              <Field label="CGPA" value={content.edu_cgpa || ''} onChange={v => sc('edu_cgpa', v)} hint="e.g. 3.39" />
              <Field label="CGPA Max" value={content.edu_cgpa_max || ''} onChange={v => sc('edu_cgpa_max', v)} hint="e.g. 4.00" />
              <Field label="Status" value={content.edu_status || ''} onChange={v => sc('edu_status', v)} hint="e.g. ONGOING / COMPLETED" />
            </Row>
            <Divider label="Thesis Card" />
            <Field label="Thesis Title" value={content.thesis_title || ''} onChange={v => sc('thesis_title', v)} hint="e.g. University Thesis" />
            <Field label="Thesis Description" value={content.thesis_desc || ''} onChange={v => sc('thesis_desc', v)} multiline />
            <Field label="Thesis Google Drive URL" value={content.thesis_url || ''} onChange={v => sc('thesis_url', v)} hint="Full https://drive.google.com/... link" />
          </Section>
        )}

        {/* ── SKILLS ── */}
        {activeSection === 'skills' && (
          <Section title="04 — Skills">
            <Field label="Section Heading" value={content.skills_heading || ''} onChange={v => sc('skills_heading', v)} hint="e.g. THREE-LAYER SKILL SET" />
            {skills.map((s, i) => (
                <div key={s.id} style={{border:'1px solid var(--line)',padding:'28px',marginBottom:'24px',background:'rgba(12, 11, 11, 0.01)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                    <Label>SKILL {i + 1}</Label>
                    <DeleteButton onClick={() => deleteRow('skills', s.id, setSkills, skills)} />
                  </div>
                <Field label="Category Name" value={s.category || ''} onChange={v => updateRow('skills', skills, setSkills, s.id, 'category', v)} />
                <Field label="Description" value={s.description || ''} onChange={v => updateRow('skills', skills, setSkills, s.id, 'description', v)} multiline />
                <Field label="Tags (comma separated)"
                  value={s._tags_edit !== undefined ? s._tags_edit : (Array.isArray(s.tags) ? s.tags.join(', ') : (s.tags || ''))}
                  onChange={v => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _tags_edit: v } : r))}
                  onBlur={v => saveField('skills', skills, setSkills, s.id, 'tags', v)}
                  hint="e.g. React, TypeScript, CSS" />
                
                <Divider label="Skill Image (shows in black box)" />
                
                {s.image_url && (
                  <div style={{marginBottom:'16px',border:'1px solid var(--line)',padding:'16px',background:'rgba(0,0,0,0.02)'}}>
                    <div style={{fontSize:'13px',color:'var(--text-dim)',marginBottom:'8px'}}>Current Image:</div>
                    <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                      <img src={s.image_url} alt={s.category} style={{width:'100px',height:'100px',objectFit:'cover',border:'2px solid var(--accent-blue)'}} />
                      <button 
                        onClick={async () => {
                          if (!window.confirm('Delete this skill image from storage?')) return
                          await deleteFileFromStorage(SUPABASE_BUCKET, s.image_url)
                          updateRow('skills', skills, setSkills, s.id, 'image_url', '')
                          toast(null)
                        }}
                        style={{padding:'6px 12px',background:'#ff4444',color:'#fff',border:'none',cursor:'pointer',fontSize:'11px',fontWeight:'700'}}>
                        DELETE IMAGE
                      </button>
                    </div>
                  </div>
                )}
                
                <div style={{marginBottom:'16px'}}>
                  <label style={{display:'block',fontSize:'12px',marginBottom:'8px',color:'var(--text-dim)'}}>Upload Skill Image</label>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/webp" 
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        
                        if (!file.type.startsWith('image/')) {
                          toast(new Error('Please upload an image file (JPG, PNG, WebP)'))
                          return
                        }
                        
                        setMsg('Uploading skill image...')
                        const path = `skills/${s.id}_${Date.now()}.${file.name.split('.').pop()}`
                        const publicUrl = await uploadFileToStorage(SUPABASE_BUCKET, path, file)
                        
                        if (publicUrl) {
                          // Delete old image if exists
                          if (s.image_url) {
                            await deleteFileFromStorage(SUPABASE_BUCKET, s.image_url)
                          }
                          updateRow('skills', skills, setSkills, s.id, 'image_url', publicUrl)
                          setMsg('✓ Skill image uploaded successfully')
                          setTimeout(() => setMsg(''), 3000)
                        }
                        e.target.value = '' // Reset input
                      }}
                    />
                  </div>
                  <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'8px'}}>Upload an image to show in the black box. JPG, PNG, or WebP. Leave empty to use SVG icon below.</div>
                </div>
                
                <Field label="Icon SVG / HTML (fallback)" value={s.icon_svg || ''} onChange={v => updateRow('skills', skills, setSkills, s.id, 'icon_svg', v)} multiline hint="Raw SVG or <i> tag — used when no image is uploaded" />
                <Divider label="Writeup Links (optional)" />
                
                {(() => {
                  const existing = s._writeups_edit !== undefined ? s._writeups_edit : (
                    Array.isArray(s.writeups) ? s.writeups : (
                      s.writeup ? [s.writeup] : (
                        (s.writeup_label || s.writeup_url) ? [{ label: s.writeup_label || '', url: s.writeup_url || '' }] : []
                      )
                    )
                  )
                  
                  // Helper to check if URL is from Supabase Storage
                  const isSupabaseStorageUrl = (url) => {
                    if (!url) return false
                    return url.includes('/storage/v1/object/public/')
                  }
                  
                  return (
                    <div style={{marginBottom:'12px'}}>
                      {existing.map((w, wi) => (
                        <div key={wi} style={{marginBottom:'8px'}}>
                          <div style={{display:'grid',gridTemplateColumns:'1fr 360px 80px',gap:'8px'}}>
                            <input placeholder="Label" value={w.label || ''} onChange={e => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _writeups_edit: (r._writeups_edit || existing).map((x,ii) => ii===wi ? { ...x, label: e.target.value } : x) } : r))} style={{padding:'8px',background:ADMIN_BG_ALT,color:ADMIN_TEXT,border:'1px solid rgba(88, 221, 39, 0.12)'}} />
                            <input placeholder="URL" value={w.url || ''} onChange={e => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _writeups_edit: (r._writeups_edit || existing).map((x,ii) => ii===wi ? { ...x, url: e.target.value } : x) } : r))} style={{padding:'8px',background:ADMIN_BG,color:ADMIN_TEXT,border:'1px solid rgba(35, 245, 39, 0.12)'}} />
                            <button 
                              onClick={async () => {
                                if (!window.confirm('Remove this writeup? (Files in Supabase Storage will be deleted)')) return
                                
                                // Delete from storage if it's a Supabase Storage URL
                                if (isSupabaseStorageUrl(w.url)) {
                                  // Detect which bucket the file is in from the URL
                                  const bucket = w.url.includes('/writeups/') ? WRITEUPS_BUCKET : SUPABASE_BUCKET
                                  await deleteFileFromStorage(bucket, w.url)
                                }
                                
                                // Remove from array
                                const updatedWriteups = (s._writeups_edit || existing).filter((_,ii) => ii!==wi)
                                
                                // Save to database immediately
                                const { error } = await supabase.from('skills').update({ writeups: updatedWriteups }).eq('id', s.id)
                                if (error) {
                                  toast(error)
                                  return
                                }
                                
                                // Update local state
                                setSkills(rows => rows.map(r => r.id === s.id ? { ...r, writeups: updatedWriteups, _writeups_edit: undefined } : r))
                                toast(null)
                              }} 
                              style={{padding:'6px 10px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>
                              Remove
                            </button>
                          </div>
                          {isSupabaseStorageUrl(w.url) && (
                            <div style={{fontSize:'10px',color:'var(--accent-blue)',marginTop:'4px',marginLeft:'4px'}}>
                              📁 Stored in Supabase (will be deleted when removed)
                            </div>
                          )}
                          {w.url && w.url.includes('drive.google.com') && (
                            <div style={{fontSize:'10px',color:'var(--text-faint)',marginTop:'4px',marginLeft:'4px'}}>
                              🔗 External Google Drive link (not stored in Supabase)
                            </div>
                          )}
                        </div>
                      ))}
                      <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                        <button onClick={() => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _writeups_edit: [...(r._writeups_edit || existing), { label: '', url: '' }] } : r))} style={{padding:'8px 12px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>+ Add Manual Link</button>
                        <button onClick={() => saveWriteups('skills', skills, setSkills, s.id, (s._writeups_edit !== undefined ? s._writeups_edit : existing))} style={{padding:'8px 12px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>Save Writeups</button>
                      </div>
                      <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'8px'}}>
                        Click "+ Add Manual Link" to add external URLs like Google Drive, PDFs, or articles.
                      </div>
                    </div>
                  )
                })()}
              </div>
            ))}
            <AddButton onClick={() => addRow('skills', { order: skills.length + 1, category: 'New Skill', description: '', tags: [], icon_svg: '', image_url: '' }, setSkills)}>
              + Add Skill
            </AddButton>
          </Section>
        )}

        {/* ── PROJECTS ── */}
        {activeSection === 'projects' && (
          <Section title="05 — Projects">
            {projects.map((pr, i) => (
              <div key={pr.id} style={{border:'1px solid var(--line)',padding:'28px',marginBottom:'24px',background:'rgba(255,255,255,0.01)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                  <Label>PROJECT {i + 1}</Label>
                  <DeleteButton onClick={() => deleteRow('projects', pr.id, setProjects, projects)} />
                </div>
                <Field label="Title" value={pr.title || ''} onChange={v => updateRow('projects', projects, setProjects, pr.id, 'title', v)} />
                <Field label="Description" value={pr.description || ''} onChange={v => updateRow('projects', projects, setProjects, pr.id, 'description', v)} multiline />
                <Field label="Tags (comma separated)"
                  value={pr._tags_edit !== undefined ? pr._tags_edit : (Array.isArray(pr.tags) ? pr.tags.join(', ') : (pr.tags || ''))}
                  onChange={v => setProjects(rows => rows.map(r => r.id === pr.id ? { ...r, _tags_edit: v } : r))}
                  onBlur={v => saveField('projects', projects, setProjects, pr.id, 'tags', v)} />
                
                <Divider label="Project Logo/Thumbnail (shows on home page)" />
                <Field label="Image URL (optional)" value={pr.image_url || ''} onChange={v => updateRow('projects', projects, setProjects, pr.id, 'image_url', v)} hint="Main project image shown on homepage" />
                
                {pr.image_url && (
                  <div style={{marginBottom:'12px',border:'1px solid var(--line)',padding:'8px',background:'rgba(0,0,0,0.02)',display:'inline-block'}}>
                    <div style={{position:'relative',display:'inline-block'}}>
                      <img src={pr.image_url} alt="Featured" style={{width:'200px',height:'120px',objectFit:'cover',display:'block'}} />
                      <button onClick={() => removeSingleProjectImage(pr.id)} 
                        style={{position:'absolute',top:'8px',right:'8px',padding:'4px 8px',background:'#ff4444',color:'#fff',border:'none',cursor:'pointer',fontSize:'10px',fontWeight:'700'}}>
                        DELETE
                      </button>
                    </div>
                  </div>
                )}
                
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'12px'}}>
                  <input type="file" accept="image/*" onChange={e => handleProjectFileSelect(pr.id, e.target.files[0])} />
                  <button onClick={() => uploadProjectImage(pr)} style={{padding:'8px 12px',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none',cursor:'pointer'}}>Upload Single Image</button>
                  <div style={{fontSize:'12px',color:'var(--text-faint)'}}>{pr._file ? pr._file.name : ''}</div>
                </div>

                <Divider label="Project Gallery (click 'Images' tag on homepage to view)" />
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'12px'}}>
                  <input type="file" accept="image/*" multiple onChange={e => handleProjectMultipleFilesSelect(pr.id, e.target.files)} />
                  <button onClick={() => uploadProjectImages(pr)} style={{padding:'8px 12px',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none',cursor:'pointer'}}>Upload Multiple Images</button>
                  <div style={{fontSize:'12px',color:'var(--text-faint)'}}>{pr._files ? `${pr._files.length} file(s) selected` : ''}</div>
                </div>
                {Array.isArray(pr.images) && pr.images.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))',gap:'12px',marginBottom:'12px'}}>
                    {pr.images.map((imgUrl, idx) => (
                      <div key={idx} style={{position:'relative',border:'1px solid var(--line)',padding:'4px',background:'rgba(0,0,0,0.05)'}}>
                        <img src={imgUrl} alt={`Project ${i+1} - ${idx+1}`} style={{width:'100%',height:'100px',objectFit:'cover',display:'block'}} />
                        <button onClick={() => removeProjectImage(pr.id, imgUrl)} 
                          style={{position:'absolute',top:'8px',right:'8px',padding:'4px 8px',background:'#ff4444',color:'#fff',border:'none',cursor:'pointer',fontSize:'10px'}}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Row>
                  <Field label="Live Demo URL" value={pr.live_url || ''} onChange={v => updateRow('projects', projects, setProjects, pr.id, 'live_url', v)} hint="Live project/demo URL" />
                </Row>

                <Divider label="Custom Links (GitHub, YouTube, Documentation, etc.)" />
                {(() => {
                  const existing = pr._links_edit !== undefined ? pr._links_edit : (
                    Array.isArray(pr.links) ? pr.links : []
                  )
                  return (
                    <div style={{marginBottom:'12px'}}>
                      {existing.map((link, li) => (
                        <div key={li} style={{display:'grid',gridTemplateColumns:'200px 1fr 80px',gap:'8px',marginBottom:'8px'}}>
                          <input placeholder="Label (e.g. GitHub)" value={link.label || ''} 
                            onChange={e => setProjects(rows => rows.map(r => r.id === pr.id ? { ...r, _links_edit: (r._links_edit || existing).map((x,ii) => ii===li ? { ...x, label: e.target.value } : x) } : r))} 
                            style={{padding:'8px',background:ADMIN_BG,color:ADMIN_TEXT,border:'1px solid rgba(0,0,0,0.12)'}} />
                          <input placeholder="URL" value={link.url || ''} 
                            onChange={e => setProjects(rows => rows.map(r => r.id === pr.id ? { ...r, _links_edit: (r._links_edit || existing).map((x,ii) => ii===li ? { ...x, url: e.target.value } : x) } : r))} 
                            style={{padding:'8px',background:ADMIN_BG,color:ADMIN_TEXT,border:'1px solid rgba(0,0,0,0.12)'}} />
                          <button onClick={() => setProjects(rows => rows.map(r => r.id === pr.id ? { ...r, _links_edit: (r._links_edit || existing).filter((_,ii) => ii!==li) } : r))} 
                            style={{padding:'6px 10px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>Remove</button>
                        </div>
                      ))}
                      <div style={{display:'flex',gap:'8px'}}>
                        <button onClick={() => setProjects(rows => rows.map(r => r.id === pr.id ? { ...r, _links_edit: [...(r._links_edit || existing), { label: '', url: '' }] } : r))} 
                          style={{padding:'8px 12px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>+ Add Link</button>
                        <button onClick={() => saveProjectLinks(pr.id, (pr._links_edit !== undefined ? pr._links_edit : existing))} 
                          style={{padding:'8px 12px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>Save Links</button>
                      </div>
                      <div style={{fontSize:'11px',color:'var(--text-faint)',marginTop:'8px'}}>Examples: GitHub, YouTube Demo, Live Site, Documentation, etc.</div>
                    </div>
                  )
                })()}
              </div>
            ))}
            <AddButton onClick={() => addRow('projects', { order: projects.length + 1, title: 'New Project', description: '', tags: [], live_url: '', repo_url: '' }, setProjects)}>
              + Add Project
            </AddButton>
          </Section>
        )}

        {/* ── ACHIEVEMENTS ── */}
        {activeSection === 'achievements' && (
          <Section title="06 — Achievements & Certificates" titleColor={'var(--accent-blue)'}>
            <Divider label="Drive Folder Links (overview cards)" />
            <Field label="Achievements Drive URL" value={content.achievements_drive_url || ''} onChange={v => sc('achievements_drive_url', v)} hint="Google Drive folder for achievements" />
            <Field label="Certificates Drive URL" value={content.certificates_drive_url || ''} onChange={v => sc('certificates_drive_url', v)} hint="Google Drive folder for certificates" />

            <Divider label="Achievements / Certificates" />
            <div>
              <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                <button onClick={() => setAchTab('achievements')}
                  style={{padding:'8px 12px',background: achTab==='achievements' ? 'var(--accent-blue)' : 'transparent',border:'1px solid var(--line)',cursor:'pointer',color: achTab==='achievements' ? ADMIN_TEXT : 'var(--text-dim)'}}>Achievements</button>
                <button onClick={() => setAchTab('certificates')}
                  style={{padding:'8px 12px',background: achTab==='certificates' ? 'var(--accent-blue)' : 'transparent',border:'1px solid var(--line)',cursor:'pointer',color: achTab==='certificates' ? ADMIN_TEXT : 'var(--text-dim)'}}>Certificates</button>
              </div>
              {achTab === 'achievements' ? <ListEditor contentKey={'achievements_list'} /> : <ListEditor contentKey={'certificates_list'} />}
            </div>
          </Section>
        )}

        {/* ── TRIPLET STATEMENT CARDS ── */}
        {activeSection === 'triplets' && (
          <Section title="Statement Cards (Philosophy)">
            {triplets.map((t, i) => (
              <div key={t.id} style={{border:'1px solid var(--line)',padding:'28px',marginBottom:'24px',background:'rgba(255,255,255,0.01)'}}>
                <Label>CARD {i + 1}</Label>
                <Field label="Title" value={t.title || ''} onChange={v => updateRow('triplet_items', triplets, setTriplets, t.id, 'title', v)} />
                <Field label="Body" value={t.body || ''} onChange={v => updateRow('triplet_items', triplets, setTriplets, t.id, 'body', v)} multiline />
              </div>
            ))}
          </Section>
        )}

        {/* ── CONTACT ── */}
        {activeSection === 'contact' && (
          <Section title="07 — Contact">
            <Field label="Section Headline (HTML allowed)" value={content.contact_headline || ''} onChange={v => sc('contact_headline', v)} hint="Use <br/> for line breaks. e.g. Have a project idea<br/>in mind?" />
            <Field label="Section Subtext" value={content.contact_subtext || ''} onChange={v => sc('contact_subtext', v)} multiline />
          </Section>
        )}

        {/* ── FOOTER ── */}
        {activeSection === 'footer' && (
          <Section title="Footer">
            <Field label="Wordmark (big text)" value={content.footer_wordmark || ''} onChange={v => sc('footer_wordmark', v)} hint="e.g. IFAQUE" />
            <Field label="Copyright" value={content.footer_copyright || ''} onChange={v => sc('footer_copyright', v)} hint="e.g. ©2026" />
            <Divider label="Contact Info" />
            <Field label="Email" value={content.footer_email || ''} onChange={v => sc('footer_email', v)} hint="e.g. mdabdullah2002111@gmail.com" />
            <Field label="Phone / WhatsApp" value={content.footer_phone || ''} onChange={v => sc('footer_phone', v)} hint="e.g. 01701826202" />
            <Field label="Location" value={content.footer_location || ''} onChange={v => sc('footer_location', v)} hint="e.g. Dhaka, Bangladesh" />
            <Divider label="Social Links" />
            <Field label="LinkedIn URL" value={content.social_linkedin || ''} onChange={v => sc('social_linkedin', v)} />
            <Field label="GitHub URL" value={content.social_github || ''} onChange={v => sc('social_github', v)} />
          </Section>
        )}
      </main>
    </div>
  )
}

// ─── UI Primitives ──────────────────────────────────────────────────────────────
function Section({ title, children, titleColor }) {
  return (
    <div>
      <h2 style={{fontSize:'20px',fontWeight:'800',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'8px',color: titleColor || 'var(--text-primary)'}}>{title}</h2>
      <div style={{height:'2px',background:'var(--accent-blue)',width:'40px',marginBottom:'40px'}} />
      {children}
    </div>
  )
}

function Divider({ label }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:'12px',margin:'28px 0 20px'}}>
      <div style={{fontSize:'10px',color:'var(--accent-blue)',letterSpacing:'0.1em',fontWeight:'700',whiteSpace:'nowrap'}}>{label}</div>
      <div style={{flex:1,height:'1px',background:'var(--line)'}} />
    </div>
  )
}

function Row({ children }) {
  return <div style={{display:'grid',gridTemplateColumns:`repeat(${Array.isArray(children) ? children.length : 1}, 1fr)`,gap:'16px'}}>{children}</div>
}

function Label({ children }) {
  return <div style={{fontSize:'10px',color:'var(--text-faint)',letterSpacing:'0.1em',marginBottom:'16px',fontWeight:'700'}}>{children}</div>
}

function Field({ label, value, onChange, onBlur, hint, multiline }) {
  const base = {width:'100%',padding:'10px 12px',background:ADMIN_BG,border:'1px solid rgba(0,0,0,0.12)',color:ADMIN_TEXT,fontSize:'13px',fontFamily:'var(--mono)',boxSizing:'border-box',outline:'none',transition:'border-color 0.2s'}
  return (
    <div style={{marginBottom:'20px'}}>
      <label style={{display:'block',fontSize:'11px',marginBottom:'6px',color:'var(--text-dim)',letterSpacing:'0.04em'}}>{label}</label>
      {multiline
        ? <textarea value={value || ''} onChange={e => onChange(e.target.value)} onBlur={e => onBlur && onBlur(e.target.value)}
            style={{...base,minHeight:'90px',resize:'vertical'}} />
        : <input value={value || ''} onChange={e => onChange(e.target.value)} onBlur={e => onBlur && onBlur(e.target.value)}
            style={base} />
      }
      {hint && <div style={{fontSize:'10px',color:'var(--text-faint)',marginTop:'5px'}}>{hint}</div>}
    </div>
  )
}

function AddButton({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{padding:'12px 24px',border:'none',background:'var(--accent-blue)',color:ADMIN_TEXT,fontFamily:'var(--mono)',fontSize:'12px',letterSpacing:'0.06em',cursor:'pointer',transition:'all 0.2s',width:'100%',marginTop:'8px'}}>
      {children}
    </button>
  )
}

function DeleteButton({ onClick }) {
  return (
    <button onClick={() => { if (window.confirm('Delete this item?')) onClick() }}
      style={{padding:'6px 14px',border:'none',background:'var(--accent-blue)',color:ADMIN_TEXT,fontFamily:'var(--mono)',fontSize:'10px',letterSpacing:'0.06em',cursor:'pointer'}}>
      DELETE
    </button>
  )
}
