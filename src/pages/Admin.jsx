import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
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

  const logout = () => supabase.auth.signOut()

  if (!session) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <form onSubmit={login} style={{width:'320px',border:'1px solid var(--line)',padding:'40px'}}>
          <h2 style={{marginBottom:'24px',fontSize:'18px',textTransform:'uppercase'}}>Admin Login</h2>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            style={{width:'100%',padding:'12px',marginBottom:'12px',background:'var(--bg-alt)',border:'1px solid var(--line)',color:'var(--text-primary)'}}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            style={{width:'100%',padding:'12px',marginBottom:'18px',background:'var(--bg-alt)',border:'1px solid var(--line)',color:'var(--text-primary)'}}
            required
          />
          <button type="submit" disabled={loading} className="btn primary" style={{width:'100%'}}>
            {loading ? 'Loading...' : 'Login'}
          </button>
          {msg && <div style={{marginTop:'12px',fontSize:'11px',color:msg.includes('error')?'#ff4444':'var(--accent-blue)'}}>{msg}</div>}
        </form>
      </div>
    )
  }

  return <AdminDashboard logout={logout} />
}

function AdminDashboard({ logout }) {
  const [content, setContent] = useState({})
  const [triplets, setTriplets] = useState([])
  const [steps, setSteps] = useState([])
  const [skills, setSkills] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = () => {
    Promise.all([
      supabase.from('site_content').select('*'),
      supabase.from('triplet_items').select('*').order('order'),
      supabase.from('process_steps').select('*').order('order'),
      supabase.from('skills').select('*').order('order')
    ]).then(([c, t, p, s]) => {
      setContent(Object.fromEntries((c.data || []).map(r => [r.key, r.value])))
      setTriplets(t.data || [])
      setSteps(p.data || [])
      setSkills(s.data || [])
    })
  }

  const updateContent = async (key, value) => {
    const { error } = await supabase.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() })
    if (error) setMsg(error.message)
    else { setMsg('Saved!'); setTimeout(() => setMsg(''), 2000) }
  }

  const updateTriplet = async (id, field, value) => {
    const item = triplets.find(t => t.id === id)
    const { error } = await supabase.from('triplet_items').update({ ...item, [field]: value }).eq('id', id)
    if (error) setMsg(error.message)
    else { setMsg('Saved!'); setTimeout(() => setMsg(''), 2000); load() }
  }

  const updateStep = async (id, field, value) => {
    const item = steps.find(s => s.id === id)
    const { error } = await supabase.from('process_steps').update({ ...item, [field]: value }).eq('id', id)
    if (error) setMsg(error.message)
    else { setMsg('Saved!'); setTimeout(() => setMsg(''), 2000); load() }
  }

  const updateSkill = async (id, field, value) => {
    const item = skills.find(s => s.id === id)
    const updated = { ...item, [field]: field === 'tags' ? value.split(',').map(t => t.trim()) : value }
    const { error } = await supabase.from('skills').update(updated).eq('id', id)
    if (error) setMsg(error.message)
    else { setMsg('Saved!'); setTimeout(() => setMsg(''), 2000); load() }
  }

  return (
    <div style={{padding:'60px',maxWidth:'1200px',margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'40px'}}>
        <h1 style={{fontSize:'24px',textTransform:'uppercase'}}>Admin Dashboard</h1>
        <button onClick={logout} className="btn">Logout</button>
      </div>
      {msg && <div style={{padding:'12px',background:'var(--accent-blue)',color:'#000',marginBottom:'20px',fontSize:'11px'}}>{msg}</div>}

      <Section title="Hero">
        <Input label="Headline" value={content.hero_headline || ''} onChange={v => { setContent({...content, hero_headline: v}); updateContent('hero_headline', v) }} />
        <Input label="Subtext" value={content.hero_subtext || ''} onChange={v => { setContent({...content, hero_subtext: v}); updateContent('hero_subtext', v) }} />
      </Section>

      <Section title="About">
        <Input label="Name" value={content.about_name || ''} onChange={v => { setContent({...content, about_name: v}); updateContent('about_name', v) }} />
        <Textarea label="Bio" value={content.about_bio || ''} onChange={v => { setContent({...content, about_bio: v}); updateContent('about_bio', v) }} />
        <Input label="University" value={content.stat_university || ''} onChange={v => { setContent({...content, stat_university: v}); updateContent('stat_university', v) }} />
        <Input label="Degree" value={content.stat_degree || ''} onChange={v => { setContent({...content, stat_degree: v}); updateContent('stat_degree', v) }} />
        <Input label="Year" value={content.stat_year || ''} onChange={v => { setContent({...content, stat_year: v}); updateContent('stat_year', v) }} />
      </Section>

      <Section title="Triplet Cards">
        {triplets.map((t, i) => (
          <div key={t.id} style={{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid var(--line)'}}>
            <div style={{fontSize:'10px',color:'var(--text-faint)',marginBottom:'8px'}}>CARD {i + 1}</div>
            <Input label="Title" value={t.title} onChange={v => updateTriplet(t.id, 'title', v)} />
            <Textarea label="Body" value={t.body} onChange={v => updateTriplet(t.id, 'body', v)} />
          </div>
        ))}
      </Section>

      <Section title="Process Steps">
        {steps.map((s, i) => (
          <div key={s.id} style={{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid var(--line)'}}>
            <div style={{fontSize:'10px',color:'var(--text-faint)',marginBottom:'8px'}}>STEP {i + 1}</div>
            <Input label="Number" value={s.step_number} onChange={v => updateStep(s.id, 'step_number', v)} />
            <Input label="Title" value={s.title} onChange={v => updateStep(s.id, 'title', v)} />
            <Textarea label="Body" value={s.body} onChange={v => updateStep(s.id, 'body', v)} />
          </div>
        ))}
      </Section>

      <Section title="Skills">
        {skills.map((s, i) => (
          <div key={s.id} style={{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid var(--line)'}}>
            <div style={{fontSize:'10px',color:'var(--text-faint)',marginBottom:'8px'}}>SKILL {i + 1}</div>
            <Input label="Category" value={s.category} onChange={v => updateSkill(s.id, 'category', v)} />
            <Textarea label="Description" value={s.description} onChange={v => updateSkill(s.id, 'description', v)} />
            <Input label="Tags (comma separated)" value={(s.tags || []).join(', ')} onChange={v => updateSkill(s.id, 'tags', v)} />
            <Textarea label="Icon SVG" value={s.icon_svg} onChange={v => updateSkill(s.id, 'icon_svg', v)} />
          </div>
        ))}
      </Section>

      <Section title="Footer">
        <Input label="Wordmark" value={content.footer_wordmark || ''} onChange={v => { setContent({...content, footer_wordmark: v}); updateContent('footer_wordmark', v) }} />
        <Input label="Copyright" value={content.footer_copyright || ''} onChange={v => { setContent({...content, footer_copyright: v}); updateContent('footer_copyright', v) }} />
        <Input label="LinkedIn URL" value={content.social_linkedin || ''} onChange={v => { setContent({...content, social_linkedin: v}); updateContent('social_linkedin', v) }} />
        <Input label="GitHub URL" value={content.social_github || ''} onChange={v => { setContent({...content, social_github: v}); updateContent('social_github', v) }} />
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:'50px'}}>
      <h2 style={{fontSize:'14px',textTransform:'uppercase',marginBottom:'20px',color:'var(--accent-blue)'}}>{title}</h2>
      {children}
    </div>
  )
}

function Input({ label, value, onChange }) {
  return (
    <div style={{marginBottom:'16px'}}>
      <label style={{display:'block',fontSize:'11px',marginBottom:'6px',color:'var(--text-dim)'}}>{label}</label>
      <input 
        value={value} 
        onChange={e => onChange(e.target.value)}
        onBlur={e => onChange(e.target.value)}
        style={{width:'100%',padding:'10px',background:'var(--bg-alt)',border:'1px solid var(--line)',color:'var(--text-primary)',fontSize:'13px'}}
      />
    </div>
  )
}

function Textarea({ label, value, onChange }) {
  return (
    <div style={{marginBottom:'16px'}}>
      <label style={{display:'block',fontSize:'11px',marginBottom:'6px',color:'var(--text-dim)'}}>{label}</label>
      <textarea 
        value={value} 
        onChange={e => onChange(e.target.value)}
        onBlur={e => onChange(e.target.value)}
        style={{width:'100%',padding:'10px',background:'var(--bg-alt)',border:'1px solid var(--line)',color:'var(--text-primary)',fontSize:'13px',minHeight:'80px',fontFamily:'var(--mono)'}}
      />
    </div>
  )
}
