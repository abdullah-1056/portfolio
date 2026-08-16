import { useEffect, useState } from 'react'
import MatrixRain from '../components/MatrixRain'
import Globe from '../components/Globe'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [content, setContent] = useState({})
  const [triplets, setTriplets] = useState([
    { id: 1, title: 'NO SHORTCUTS. NO EXCUSES.', body: 'All work is crafted with attention to detail, ensuring nothing is left half-finished. Every line of code is intentional—built to last.' },
    { id: 2, title: 'BLOCK THE NOISE.', body: 'Focused and deliberate in approach. Every action is purposeful, with zero distractions and clear direction.' },
    { id: 3, title: 'ONE SKILL. MANY DOORS.', body: 'From web development to design, each skill opens new possibilities and creates unique value in every project undertaken.' }
  ])
  const [, setSteps] = useState([
    { id: 1, step_number: '01', title: 'RESEARCH & DISCOVERY', body: 'Before any code is written, the problem is deeply understood. Research drives every decision—ensuring the solution fits perfectly.' },
    { id: 2, step_number: '02', title: 'DESIGN & PROTOTYPE', body: 'Clean interfaces are designed with user experience at the core. Prototypes are built to validate ideas before full development begins.' },
    { id: 3, step_number: '03', title: 'DEVELOP & ITERATE', body: 'Code is written with precision using modern tools and frameworks. Continuous iteration ensures quality at every stage.' },
    { id: 4, step_number: '04', title: 'DELIVER & REFINE', body: 'The final product is polished and delivered with care. Feedback is welcomed to continuously improve and refine the work.' }
  ])
  const [skills, setSkills] = useState([
    {
      id: 1,
      category: "Programming & Web Development",
      description: "Languages: C, C++, SQL, PHP, HTML5, CSS3. Database design and management with MySQL, including ER modelling, schema normalization, joins, constraints, indexing, and query optimization. Server-side scripting with front-end and back-end integration, form handling, and responsive layouts.",
      tags: ["C / C++", "SQL", "PHP", "HTML5 / CSS3", "MySQL"],
      icon_svg: `<i class="ti ti-code" style="font-size:48px;color:var(--accent-blue)"></i>`,
      image_url: "", writeup_label: "", writeup_url: ""
    },
    {
      id: 2,
      category: "Security & Networking",
      description: "Linux command line proficiency across filesystem management, processes, permissions, and shell scripting. Web exploitation fundamentals, reconnaissance and enumeration, CTF methodology, and Burp Suite. Networking foundations in TCP/IP, Cisco Packet Tracer, and IoT platforms including Arduino, ESP32, Blynk, and sensor/actuator interfacing.",
      tags: ["Linux CLI", "Wireshark", "Burp Suite", "TCP/IP", "Arduino / ESP32"],
      icon_svg: `<i class="ti ti-shield-lock" style="font-size:48px;color:var(--accent-blue)"></i>`,
      image_url: "",
      writeup_label: "OverTheWire — Natas Writeup",
      writeup_url: "https://drive.google.com/drive/folders/1hB0qNbx0AKG3nutLKbeQI2m7ZUMp1kTa?usp=sharing"
    },
    {
      id: 3,
      category: "Tools & Practice",
      description: "Version control and collaboration with Git and GitHub. Development environments including VS Code and Eclipse. Project management with Trello following Agile/Scrum methodology. Additional proficiency in AutoCAD and Docker for design and containerization workflows.",
      tags: ["Git / GitHub", "VS Code / Eclipse", "Agile / Scrum", "Docker", "AutoCAD"],
      icon_svg: `<i class="ti ti-tools" style="font-size:48px;color:var(--accent-blue)"></i>`,
      image_url: "", writeup_label: "", writeup_url: ""
    }
  ])
  const [, setAchievements] = useState([])
  const [projects, setProjects] = useState([
    { id: 1, title: 'E-Commerce Platform', description: 'Full-stack online shopping platform with payment integration, inventory management, and admin dashboard.', tags: ['React', 'Node.js', 'MongoDB'], live_url: '#', repo_url: '#' },
    { id: 2, title: 'Task Management App', description: 'Collaborative project management tool with real-time updates, team collaboration, and progress tracking.', tags: ['React', 'Firebase', 'Tailwind'], live_url: '#', repo_url: '#' },
    { id: 3, title: 'Portfolio CMS', description: 'Self-editable portfolio website with admin panel for content management without touching code.', tags: ['React', 'Supabase', 'Vite'], live_url: '#', repo_url: '#' }
  ])
  const [showModal, setShowModal] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [formData, setFormData] = useState({
    fullname: '',
    company: '',
    email: '',
    service: '',
    budget: '',
    details: ''
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormMessage('')
    
    // Web3Forms configuration
    const formData = new FormData(e.target)
    formData.append('access_key', 'd9116e57-6a7a-48f4-9db4-e2575a8bb2ac')
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFormMessage('✓ Thank you! Your inquiry has been sent successfully.')
        setFormData({ fullname: '', company: '', email: '', service: '', budget: '', details: '' })
        setTimeout(() => setFormMessage(''), 5000)
      } else {
        setFormMessage('Error: ' + (data.message || 'Failed to send message'))
      }
    } catch (error) {
      console.error('Form Error:', error)
      setFormMessage('Error: Failed to send message. Please try again.')
    } finally {
      setFormSubmitting(false)
    }
  }

  useEffect(() => {
    Promise.all([
      supabase.from('site_content').select('*'),
      supabase.from('triplet_items').select('*').order('order'),
      supabase.from('process_steps').select('*').order('order'),
      supabase.from('skills').select('*').order('order'),
      supabase.from('achievements').select('*').order('order'),
      supabase.from('projects').select('*').order('order')
    ]).then(([c, t, p, s, a, pr]) => {
      if (c.data && c.data.length > 0) {
        setContent(Object.fromEntries(c.data.map(r => [r.key, r.value])))
      }
      if (t.data && t.data.length > 0) setTriplets(t.data)
      if (p.data && p.data.length > 0) setSteps(p.data)
      if (s.data && s.data.length > 0) setSkills(s.data)
      if (a.data && a.data.length > 0) setAchievements(a.data)
      if (pr.data && pr.data.length > 0) setProjects(pr.data)
    })
  }, [])

  const get = (key, fallback = '') => content[key] || fallback
  const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean)
    return []
  }
  const achievementsDriveUrl = get('achievements_drive_url', 'https://drive.google.com/drive/folders/17sKX9tVvo2_pIFUN4Fs3Y_XUzuuk1NBo?usp=sharing')
  const certificatesDriveUrl = get('certificates_drive_url', 'https://drive.google.com/drive/folders/1QzBad3cOJzejtCeEm-VDnpjRMgkrsMyX?usp=sharing')
  return (
    <>
      <MatrixRain />
      <div className="content">
        <header>
          <div className="logo"><span className="diamond">&#9670;</span> {get('header_name', 'ABDULLAH AL IFAQUE')}</div>
          <nav>
            <ul>
              <li><a href="#home">HOME</a></li>
              <li><a href="#about-hero">ABOUT</a></li>
              <li><a href="#process">EDUCATION</a></li>
              <li><a href="#skillset-head">SKILLS</a></li>
              <li><a href="#projects">PROJECTS</a></li>
              <li><a href="#achievements">ACHIEVEMENTS</a></li>
              <li><a href="#contact">CONTACT</a></li>
            </ul>
          </nav>
        </header>

        <section id="home">
          <div className="wrap">
            <div className="home-left">
              <h1 dangerouslySetInnerHTML={{__html: get('hero_headline', 'YOUR SILENCE <br/>SECURED.')}} />
              <p className="lead">{get('hero_subtext', 'Voicura is a privacy-first cybersecurity service that encrypts your presence, protects your voice, and vanishes your digital footprint—elegantly.')}</p>
              <div className="btn-row">
                <a 
                  href={get('resume_url', '#')} 
                  target="_blank" 
                  rel="noopener" 
                  className="btn primary"
                  onClick={(e) => {
                    const url = get('resume_url', '')
                    if (url && url !== '#') {
                      e.preventDefault()
                      // Fetch and download
                      fetch(url)
                        .then(res => res.blob())
                        .then(blob => {
                          const blobUrl = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = blobUrl
                          a.download = 'Abdullah_Al_Ifaque_Resume.pdf'
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          window.URL.revokeObjectURL(blobUrl)
                        })
                        .catch(err => console.error('Download failed:', err))
                    }
                  }}
                >
                  DOWNLOAD RESUME →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="about-hero">
          <div className="wrap">
            <div className="section-label">02 — ABOUT</div>
            <div className="about-content">
              <div className="name-block">
                <h1 dangerouslySetInnerHTML={{__html: get('about_name', 'ABDULLAH AL<br>IFAQUE.')}} />
                <p>{get('about_bio', 'A dedicated student at Bangladesh University of Professionals, passionate about technology, design, and building impactful digital experiences—elegantly.')}</p>
                <div className="side-stats">
                  <div><div className="n">{get('stat_university', 'BUP')}</div><div className="l">University</div></div>
                  <div><div className="n">{get('stat_degree', 'CSE')}</div><div className="l">Student</div></div>
                  <div><div className="n">{get('stat_year', '2022')}</div><div className="l">Batch</div></div>
                </div>
              </div>
              {get('profile_image_url') && (
                <div className="profile-image-container">
                  <img src={get('profile_image_url')} alt="Profile" className="profile-image" />
                </div>
              )}
            </div>
          </div>
        </section>



        <section id="process">
          <div className="wrap">
            <div className="section-label">03 — EDUCATION</div>

            <div className="edu-layout">
              {/* Left: heading + globe */}
              <div className="edu-left">
                <h2 className="edu-heading">ACADEMIC<br/><span className="accent">BACKGROUND</span></h2>
                <div className="globe-frame">
                  <Globe />
                </div>
              </div>

              {/* Right: education card */}
              <div className="edu-right">
                <div className="edu-card">
                  <div className="edu-card-top">
                    <div className="edu-degree-badge">{get('edu_degree_badge', 'B.Sc.')}</div>
                    <div className="edu-year-badge">{get('edu_year_range', '17 Jul 2022 — 20 Jul 2026')}</div>
                  </div>

                  <div className="edu-institution">
                    <div className="edu-inst-name">{get('edu_inst_name', 'Bangladesh University of Professionals')}</div>
                    <div className="edu-inst-abbr">{get('edu_inst_abbr', 'BUP')}</div>
                  </div>

                  <div className="edu-divider" />

                  <div className="edu-program">{get('edu_program', 'Computer Science & Engineering')}</div>

                  <div className="edu-cgpa">
                    <div className="edu-cgpa-value">{get('edu_cgpa', '3.39')}</div>
                    <div className="edu-cgpa-label">CGPA / {get('edu_cgpa_max', '4.00')}</div>
                  </div>

                  <div className="edu-divider" />

                  <div className="edu-meta-row">
                    <div className="edu-meta-item">
                      <div className="edu-meta-label">DEGREE</div>
                      <div className="edu-meta-value">Bachelor of Science</div>
                    </div>
                    <div className="edu-meta-item">
                      <div className="edu-meta-label">DEPARTMENT</div>
                      <div className="edu-meta-value">{get('edu_inst_abbr', 'CSE')}</div>
                    </div>
                    <div className="edu-meta-item">
                      <div className="edu-meta-label">STATUS</div>
                      <div className="edu-meta-value edu-status-active">{get('edu_status', 'ONGOING')}</div>
                    </div>
                  </div>
                </div>

                {/* Thesis Card */}
                <a
                  href={get('thesis_url', 'https://drive.google.com/drive/folders/17LBH5V-hV2_c_g6zSR-MrqHj85ao72_K?usp=sharing')}
                  target="_blank"
                  rel="noopener"
                  className="thesis-card"
                >
                  <div className="thesis-top">
                    <div className="thesis-badge">THESIS</div>
                    <svg className="thesis-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </div>
                  <div className="thesis-title">{get('thesis_title', 'University Thesis')}</div>
                  <div className="thesis-desc">{get('thesis_desc', 'Full thesis document available on Google Drive. Click to view and download.')}</div>
                  <div className="thesis-footer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 1.5L18.5 8H13V3.5zM12 17l-4-4h2.5v-3h3v3H16l-4 4z"/></svg>
                    View on Google Drive →
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

       

        <section id="skills-section">
          <div id="skillset-head" className="wrap">
            <div className="section-label">04 — SKILLS</div>
            <h3>{get('skills_heading', 'THREE-LAYER SKILL SET')}</h3>
          </div>

          <div className="skills-list">
            {skills.map((skill, i) => (
              <div key={skill.id} className="skill-row">
                <div className="wrap skill-row-inner">
                  <div className="left-col">
                    <div className="skill-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="skill-cat">{skill.category}</div>
                    <p>{skill.description}</p>
                    <div className="tag-row">
                      {parseTags(skill.tags).map((tag, idx) => (
                        <div key={idx} className="tag">{tag}</div>
                      ))}
                    </div>
                    {/* Support both new writeups array and legacy single writeup */}
                    {Array.isArray(skill.writeups) && skill.writeups.length > 0 ? (
                      // New format: multiple writeups
                      skill.writeups.map((writeup, idx) => (
                        writeup.url && writeup.url !== '#' && (
                          <a key={idx} href={writeup.url} target="_blank" rel="noopener" className="skill-writeup-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            {writeup.label || 'View Writeup'}
                            <svg className="writeup-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                          </a>
                        )
                      ))
                    ) : (skill.writeup_url || (skill.writeup && skill.writeup.url)) ? (
                      // Legacy format: single writeup
                      <a href={skill.writeup_url || skill.writeup.url} target="_blank" rel="noopener" className="skill-writeup-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        {skill.writeup_label || (skill.writeup && skill.writeup.label) || 'View Writeup'}
                        <svg className="writeup-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      </a>
                    ) : null}
                  </div>
                  <div className="right-col">
                    <div className="icon-box">
                      {skill.image_url
                        ? <img src={skill.image_url} alt={skill.category} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                        : <div dangerouslySetInnerHTML={{__html: skill.icon_svg}} />
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>



        <section id="projects">
          <div className="wrap">
            <div className="section-label">05 — PROJECTS</div>
            <h2>FEATURED<br/>PROJECTS</h2>
            <div className="projects-grid">
              {projects.map((project, i) => (
                <div key={project.id} className="project-card">
                  {project.image_url && (
                    <div className="project-media">
                      <img src={project.image_url} alt={project.title} style={{width:'100%',height:'160px',objectFit:'cover',display:'block',marginBottom:'12px'}} />
                    </div>
                  )}
                  <div className="project-number">{String(i + 1).padStart(2, '0')}</div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tags">
                    {parseTags(project.tags).map((tag, idx) => (
                      <span key={idx} className="project-tag">{tag}</span>
                    ))}
                    {Array.isArray(project.images) && project.images.length > 0 && (
                      <button 
                        className="project-tag project-tag-images" 
                        onClick={() => { setCurrentProject(project); setShowGallery(true); }}
                        style={{cursor:'pointer',background:'var(--accent-blue)',color:'#000',border:'none',fontFamily:'inherit'}}
                      >
                        📸 Images ({project.images.length})
                      </button>
                    )}
                  </div>
                  <div className="project-links">
                    {/* Live Demo (always shown first if exists) */}
                    {project.live_url && project.live_url !== '#' && (
                      <a href={project.live_url} target="_blank" rel="noopener" className="project-link">
                        Live Demo →
                      </a>
                    )}
                    {/* Custom links (GitHub, YouTube, etc.) */}
                    {Array.isArray(project.links) && project.links.length > 0 && project.links.map((link, idx) => (
                      link.url && link.url !== '#' && (
                        <a key={idx} href={link.url} target="_blank" rel="noopener" className="project-link">
                          {link.label || 'Link'} →
                        </a>
                      )
                    ))}
                    {/* Legacy repo URL fallback */}
                    {(!Array.isArray(project.links) || project.links.length === 0) && project.repo_url && project.repo_url !== '#' && (
                      <a href={project.repo_url} target="_blank" rel="noopener" className="project-link">
                        GitHub →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="achievements">
          <div className="wrap">
            <div className="section-label">06 — ACHIEVEMENTS</div>
            <h2>ACHIEVEMENTS &amp;<br/>CERTIFICATES</h2>
            <div className="achievement-overview">
              <a className="overview-card overview-card-primary" href={achievementsDriveUrl} target="_blank" rel="noopener">
                <div className="overview-card-index">01</div>
                <h3>Achievements</h3>
                <p>Open my Google Drive folder to view all achievement files and proof of work.</p>
                <span className="overview-card-cta">Open Drive →</span>
              </a>
              <a className="overview-card" href={certificatesDriveUrl} target="_blank" rel="noopener">
                <div className="overview-card-index">02</div>
                <h3>Certificates</h3>
                <p>Open my certificate folder on Google Drive to view all certificates.</p>
                <span className="overview-card-cta">Open Certificates →</span>
              </a>
            </div>

            <div className="ach-lists">
              <div className="ach-list">
                <div className="ach-list-title">1. ACHIEVEMENTS</div>
                <ul>
                  {(get('achievements_list', ''))
                    .split('\n').filter(l => l.trim()).map((item, i) => <li key={i}>{item}</li>)}
                  {get('achievements_list', '').trim() === '' && (
                    <li style={{color: 'var(--text-faint)', fontStyle: 'italic'}}>No achievements added yet. Add them in the admin panel.</li>
                  )}
                </ul>
              </div>
              <div className="ach-list">
                <div className="ach-list-title">2. CERTIFICATES</div>
                <ul>
                  {(get('certificates_list', ''))
                    .split('\n').filter(l => l.trim()).map((item, i) => <li key={i}>{item}</li>)}
                  {get('certificates_list', '').trim() === '' && (
                    <li style={{color: 'var(--text-faint)', fontStyle: 'italic'}}>No certificates added yet. Add them in the admin panel.</li>
                  )}
                </ul>
              </div>
            </div>

          </div>
        </section>

                <section className="statement">
          <div className="wrap">
            <div className="divider">statement</div>
            <div className="triplet">
              {triplets.map(t => (
                <div key={t.id}>
                  <h3>{t.title}</h3>
                  <p>{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="wrap">
            <div className="cta-grid">
              <div className="cta-left">
                <div className="contact-label">07 — CONTACT</div>
                <h2 dangerouslySetInnerHTML={{__html: get('contact_headline', 'Have a project idea<br/>in mind? Let\'s get<br/>started')}} />
                <p>{get('contact_subtext', "We'll schedule a call to discuss your idea. After discovery sessions, we'll send a proposal, and upon approval, we'll get started.")}</p>
              </div>
              <div className="contact-form-panel">
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  {formMessage && (
                    <div style={{padding:'12px',marginBottom:'16px',background: formMessage.startsWith('Error') ? '#ff4444' : '#4ade80',color:'#000',fontSize:'13px',fontWeight:'600',borderRadius:'4px'}}>
                      {formMessage}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="fullname">Full Name*</label>
                    <input type="text" id="fullname" name="name" placeholder="Jane Cooper" required 
                      value={formData.fullname} 
                      onChange={e => setFormData({...formData, fullname: e.target.value})} />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="company">Company name*</label>
                      <input type="text" id="company" name="company" placeholder="Ex. Tesla Inc" required 
                        value={formData.company} 
                        onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email*</label>
                      <input type="email" id="email" name="email" placeholder="You@Example.Com" required 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="service">Service required*</label>
                      <select id="service" name="service" required 
                        value={formData.service} 
                        onChange={e => setFormData({...formData, service: e.target.value})}>
                        <option value="">Select Your Service</option>
                        <option value="Web Development">Web Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="budget">Project budget*</label>
                      <select id="budget" name="budget" required 
                        value={formData.budget} 
                        onChange={e => setFormData({...formData, budget: e.target.value})}>
                        <option value="">Select Your Range</option>
                        <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                        <option value="$25,000+">$25,000+</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="details">Project details*</label>
                    <textarea id="details" name="message" rows="4" placeholder="Tell us more about your idea" required 
                      value={formData.details} 
                      onChange={e => setFormData({...formData, details: e.target.value})}></textarea>
                  </div>

                  <button type="submit" className="btn-submit" disabled={formSubmitting}>
                    {formSubmitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                  
                  <p className="form-footer">
                    Not interested to <span className="dim">submit the form?</span> <a href="#" onClick={(e) => { e.preventDefault(); setShowModal(true); }} className="book-call">Book A Call Directly</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              <h3>Book a Call</h3>
              <p className="modal-subtitle">We'll reach out to schedule a time</p>
              
              <form className="modal-form" onSubmit={(e) => { e.preventDefault(); alert('Call booking submitted!'); setShowModal(false); }}>
                <div className="modal-form-group">
                  <label htmlFor="modal-name">Name*</label>
                  <input type="text" id="modal-name" placeholder="Your name" required />
                </div>
                
                <div className="modal-form-group">
                  <label htmlFor="modal-company">Company</label>
                  <input type="text" id="modal-company" placeholder="Your company (optional)" />
                </div>
                
                <div className="modal-form-group">
                  <label htmlFor="modal-email">Email*</label>
                  <input type="email" id="modal-email" placeholder="you@example.com" required />
                </div>
                
                <div className="modal-form-group">
                  <label htmlFor="modal-whatsapp">WhatsApp Number</label>
                  <div className="phone-input">
                    <select className="country-code">
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+91">+91</option>
                      <option value="+880" selected>+880</option>
                    </select>
                    <input type="tel" id="modal-whatsapp" placeholder="234 567 8900" />
                  </div>
                </div>
                
                <button type="submit" className="modal-submit">Submit</button>
              </form>
            </div>
          </div>
        )}

        {showGallery && currentProject && (
          <div className="modal-overlay" onClick={() => setShowGallery(false)} style={{zIndex:1001}}>
            <div className="modal-content gallery-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth:'900px',maxHeight:'90vh',overflowY:'auto'}}>
              <button className="modal-close" onClick={() => setShowGallery(false)}>✕</button>
              <h3>{currentProject.title}</h3>
              <p className="modal-subtitle">Project Gallery ({currentProject.images.length} images)</p>
              
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:'16px',marginTop:'24px'}}>
                {currentProject.images.map((imgUrl, idx) => (
                  <div key={idx} style={{border:'1px solid var(--line)',padding:'8px',background:'rgba(0,0,0,0.05)',borderRadius:'4px'}}>
                    <a href={imgUrl} target="_blank" rel="noopener">
                      <img src={imgUrl} alt={`${currentProject.title} - Image ${idx+1}`} style={{width:'100%',height:'200px',objectFit:'cover',display:'block',borderRadius:'2px'}} />
                    </a>
                    <div style={{marginTop:'8px',fontSize:'11px',color:'var(--text-faint)',textAlign:'center'}}>Image {idx+1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <footer>
          <div className="wrap">
            <div className="foot-links">
              <a href="#about-hero">ABOUT</a>
              <a href="#skillset-head">SKILLS</a>
              <a href="#process">PROCESS</a>
              <a href="#contact">CONTACT</a>
            </div>
            <div className="foot-top">
              <div className="foot-wordmark">
                <h2>{get('footer_wordmark', 'IFAQUE')}</h2>
              </div>
              <div className="foot-contact">
                <div className="foot-contact-label">GET IN TOUCH</div>
              <a href={`mailto:${get('footer_email', 'mdabdullah2002111@gmail.com')}`} className="foot-email">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                {get('footer_email', 'mdabdullah2002111@gmail.com')}
              </a>
                <div className="foot-contact-row">
                  <span className="foot-icon foot-flag" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <circle cx="11" cy="12" r="7" fill="#006a4e" />
                      <circle cx="13.8" cy="12" r="3.5" fill="#f42a41" />
                    </svg>
                  </span>
                  <span>{get('footer_location', 'Dhaka, Bangladesh')}</span>
                </div>
                <div className="foot-contact-row">
                  <span className="foot-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img" focusable="false">
                      <path d="M20.5 14.9c-1.2 0-2.4-.2-3.5-.6-.3-.1-.6 0-.8.2l-1.6 1.6c-2.5-1.3-4.6-3.4-5.9-5.9l1.6-1.6c.2-.2.3-.5.2-.8-.4-1.1-.6-2.3-.6-3.5 0-.4-.3-.7-.7-.7H6.2c-.4 0-.7.3-.7.7 0 7.8 6.3 14.1 14.1 14.1.4 0 .7-.3.7-.7v-2.2c0-.4-.3-.7-.7-.7Z" fill="#25D366"/>
                    </svg>
                  </span>
                  <span>{get('footer_phone', '01701826202')}</span>
                </div>
              </div>
            </div>
            <div className="foot-bottom">
              <div>{get('footer_copyright', '©2022')}</div>
              <div className="socials">
                <a href={get('social_linkedin', 'https://www.linkedin.com/in/abdullah-al-ifaque-951065288/')} target="_blank" rel="noopener">LINKEDIN</a>
                <a href={get('social_github', 'https://github.com/abdullah-1056')} target="_blank" rel="noopener">GITHUB</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
