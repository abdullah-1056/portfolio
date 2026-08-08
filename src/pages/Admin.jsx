import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Admin UI color constants — change these to update admin editing colors
const ADMIN_BG = '#f9f9f6'
const ADMIN_BG_ALT = '#26e815'
const ADMIN_TEXT = '#000'

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
    // DEV BYPASS — remove before deploying to production
    if (import.meta.env.DEV) return <AdminDashboard logout={() => {}} />
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
  const [achievements, setAchievements] = useState([])
  const [projects, setProjects]         = useState([])
  const [msg, setMsg]                   = useState('')
  const [activeSection, setActiveSection] = useState('header')
  const [achTab, setAchTab] = useState('achievements')

  useEffect(() => { load() }, [])

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
    const { data, error } = await supabase.from(table).insert(defaults).select()
    if (error) return toast(error)
    toast(null)
    load()
  }

  // Upload a file to Supabase Storage and return public URL
  const uploadFileToStorage = async (bucket, path, file) => {
    if (!file) return null
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true })
    if (error) { toast(error); return null }
    // get public URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)
    return publicData?.publicUrl || null
  }

  // handlers for project image file selection and upload
  const handleProjectFileSelect = (projectId, file) => {
    setProjects(rows => rows.map(r => r.id === projectId ? { ...r, _file: file } : r))
  }

  const uploadProjectImage = async (project) => {
    const file = project._file
    if (!file) return toast(new Error('No file selected'))
    const path = `projects/${project.id}/${Date.now()}_${file.name.replace(/[^a-z0-9._-]/gi,'')}`
    const publicUrl = await uploadFileToStorage('project-images', path, file)
    if (publicUrl) {
      // update local row and DB
      updateRow('projects', projects, setProjects, project.id, 'image_url', publicUrl)
      // clear _file
      setProjects(rows => rows.map(r => r.id === project.id ? { ...r, _file: undefined } : r))
    }
  }

  // delete row
  const deleteRow = async (table, id, setRows, rows) => {
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
          </Section>
        )}

        {/* ── HOME ── */}
        {activeSection === 'home' && (
          <Section title="01 — Home Hero">
            <Field label="Headline (HTML allowed)" value={content.hero_headline || ''} onChange={v => sc('hero_headline', v)} hint="Use <br/> for line breaks" />
            <Field label="Subtext" value={content.hero_subtext || ''} onChange={v => sc('hero_subtext', v)} multiline />
            <Field label="Primary Button Text" value={content.hero_btn1 || ''} onChange={v => sc('hero_btn1', v)} hint="Default: GET STARTED →" />
            <Field label="Secondary Button Text" value={content.hero_btn2 || ''} onChange={v => sc('hero_btn2', v)} hint="Default: EXPLORE MORE →" />
          </Section>
        )}

        {/* ── ABOUT ── */}
        {activeSection === 'about' && (
          <Section title="02 — About">
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
                <Field label="Image URL (shows in black box)" value={s.image_url || ''} onChange={v => updateRow('skills', skills, setSkills, s.id, 'image_url', v)} hint="Paste any image URL or leave blank for SVG icon" />
                <Field label="Icon SVG / HTML (fallback)" value={s.icon_svg || ''} onChange={v => updateRow('skills', skills, setSkills, s.id, 'icon_svg', v)} multiline hint="Raw SVG or <i> tag — used when Image URL is empty" />
                <Divider label="Writeup Links (optional)" />
                {(() => {
                  const existing = s._writeups_edit !== undefined ? s._writeups_edit : (
                    Array.isArray(s.writeups) ? s.writeups : (
                      s.writeup ? [s.writeup] : (
                        (s.writeup_label || s.writeup_url) ? [{ label: s.writeup_label || '', url: s.writeup_url || '' }] : []
                      )
                    )
                  )
                  return (
                    <div style={{marginBottom:'12px'}}>
                      {existing.map((w, wi) => (
                        <div key={wi} style={{display:'grid',gridTemplateColumns:'1fr 360px 80px',gap:'8px',marginBottom:'8px'}}>
                            <input placeholder="Label" value={w.label || ''} onChange={e => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _writeups_edit: (r._writeups_edit || existing).map((x,ii) => ii===wi ? { ...x, label: e.target.value } : x) } : r))} style={{padding:'8px',background:ADMIN_BG_ALT,color:ADMIN_TEXT,border:'1px solid rgba(88, 221, 39, 0.12)'}} />
                            <input placeholder="URL" value={w.url || ''} onChange={e => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _writeups_edit: (r._writeups_edit || existing).map((x,ii) => ii===wi ? { ...x, url: e.target.value } : x) } : r))} style={{padding:'8px',background:ADMIN_BG,color:ADMIN_TEXT,border:'1px solid rgba(35, 245, 39, 0.12)'}} />
                          <button onClick={() => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _writeups_edit: (r._writeups_edit || existing).filter((_,ii) => ii!==wi) } : r))} style={{padding:'6px 10px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>Remove</button>
                        </div>
                      ))}
                      <div style={{display:'flex',gap:'8px'}}>
                        <button onClick={() => setSkills(rows => rows.map(r => r.id === s.id ? { ...r, _writeups_edit: [...(r._writeups_edit || existing), { label: '', url: '' }] } : r))} style={{padding:'8px 12px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>+ Add Writeup</button>
                        <button onClick={() => saveWriteups('skills', skills, setSkills, s.id, (s._writeups_edit !== undefined ? s._writeups_edit : existing))} style={{padding:'8px 12px',cursor:'pointer',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none'}}>Save Writeups</button>
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
                <Field label="Image URL (optional)" value={pr.image_url || ''} onChange={v => updateRow('projects', projects, setProjects, pr.id, 'image_url', v)} hint="Project screenshot or banner" />
                <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'12px'}}>
                  <input type="file" accept="image/*" onChange={e => handleProjectFileSelect(pr.id, e.target.files[0])} />
                  <button onClick={() => uploadProjectImage(pr)} style={{padding:'8px 12px',background:'var(--accent-blue)',color:ADMIN_TEXT,border:'none',cursor:'pointer'}}>Upload Image</button>
                  <div style={{fontSize:'12px',color:'var(--text-faint)'}}>{pr._file ? pr._file.name : ''}</div>
                </div>
                <Row>
                  <Field label="Live Demo URL" value={pr.live_url || ''} onChange={v => updateRow('projects', projects, setProjects, pr.id, 'live_url', v)} />
                  <Field label="GitHub / Repo URL" value={pr.repo_url || ''} onChange={v => updateRow('projects', projects, setProjects, pr.id, 'repo_url', v)} />
                </Row>
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

            <Divider label="Individual Achievement Cards (DB rows)" />
            {achievements.map((a, i) => (
              <div key={a.id} style={{border:'1px solid var(--line)',padding:'28px',marginBottom:'24px',background:'rgba(13, 196, 246, 0.01)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
                  <Label>ACHIEVEMENT {i + 1}</Label>
                  <DeleteButton onClick={() => deleteRow('achievements', a.id, setAchievements, achievements)} />
                </div>
                <Field label="Title" value={a.title || ''} onChange={v => updateRow('achievements', achievements, setAchievements, a.id, 'title', v)} />
                <Row>
                  <Field label="Issuer" value={a.issuer || ''} onChange={v => updateRow('achievements', achievements, setAchievements, a.id, 'issuer', v)} />
                  <Field label="Date" value={a.date || ''} onChange={v => updateRow('achievements', achievements, setAchievements, a.id, 'date', v)} />
                </Row>
                <Field label="Description" value={a.description || ''} onChange={v => updateRow('achievements', achievements, setAchievements, a.id, 'description', v)} multiline />
                <Field label="Credential URL" value={a.credential_url || ''} onChange={v => updateRow('achievements', achievements, setAchievements, a.id, 'credential_url', v)} />
              </div>
            ))}
            <AddButton onClick={() => addRow('achievements', { order: achievements.length + 1, title: 'New Achievement', issuer: '', date: '', description: '', credential_url: '' }, setAchievements)}>
              + Add Achievement
            </AddButton>
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
