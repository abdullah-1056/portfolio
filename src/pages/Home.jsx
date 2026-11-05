import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import MatrixRain from '../components/MatrixRain'
import Globe from '../components/Globe'
import AgentSwarm from '../components/AgentSwarm'
import { supabase } from '../lib/supabase'

const getExperienceValue = (content, key, fallback) => content[key] || fallback
const sanitizeTextMarkup = (value) => {
  if (!value) return ''
  try {
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
      return DOMPurify.sanitize(value, { ALLOWED_TAGS: ['br', 'span', 'b', 'strong'], ALLOWED_ATTR: ['class'] })
    }
  } catch {
    // Safe fallback
  }
  return value
}
const sanitizeIconMarkup = (value) => {
  if (!value) return ''
  try {
    if (DOMPurify && typeof DOMPurify.sanitize === 'function') {
      return DOMPurify.sanitize(value, { ALLOWED_TAGS: ['i', 'svg', 'path', 'circle', 'rect', 'line', 'polyline'], ALLOWED_ATTR: ['class', 'style', 'viewbox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2', 'points'] })
    }
  } catch {
    // Safe fallback
  }
  return value
}

export default function Home() {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('portfolio_site_content')
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  })
  const [skills, setSkills] = useState([
    {
      id: 1,
      category: "Programming & Web Development",
      description: "Languages: C, C++, SQL, PHP, HTML5, CSS3. Database design and management with MySQL, including ER modelling, schema normalization, joins, constraints, indexing, and query optimization. Server-side scripting with front-end and back-end integration, form handling, and responsive layouts.",
      tags: ["C / C++", "SQL", "PHP", "HTML5 / CSS3", "MySQL"],
      icon_svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      image_url: "", writeup_label: "", writeup_url: ""
    },
    {
      id: 2,
      category: "Security & Networking",
      description: "Linux command line proficiency across filesystem management, processes, permissions, and shell scripting. Web exploitation fundamentals, reconnaissance and enumeration, CTF methodology, and Burp Suite. Networking foundations in TCP/IP, Cisco Packet Tracer, and IoT platforms including Arduino, ESP32, Blynk, and sensor/actuator interfacing.",
      tags: ["Linux CLI", "Wireshark", "Burp Suite", "TCP/IP", "Arduino / ESP32"],
      icon_svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9a2 2 0 1 1 4 0v2"/></svg>`,
      image_url: "",
      writeup_label: "OverTheWire — Natas Writeup",
      writeup_url: "https://drive.google.com/drive/folders/1hB0qNbx0AKG3nutLKbeQI2m7ZUMp1kTa?usp=sharing"
    },
    {
      id: 3,
      category: "Tools & Practice",
      description: "Version control and collaboration with Git and GitHub. Development environments including VS Code and Eclipse. Project management with Trello following Agile/Scrum methodology. Additional proficiency in AutoCAD and Docker for design and containerization workflows.",
      tags: ["Git / GitHub", "VS Code / Eclipse", "Agile / Scrum", "Docker", "AutoCAD"],
      icon_svg: `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      image_url: "", writeup_label: "", writeup_url: ""
    }
  ])
  const [, setAchievements] = useState([])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    try {
      if (localStorage.getItem('portfolio-theme-default') !== 'blue') {
        localStorage.setItem('portfolio-theme-default', 'blue')
        localStorage.setItem('portfolio-theme', 'blue')
        return 'blue'
      }
      return localStorage.getItem('portfolio-theme') || 'blue'
    } catch {
      return 'blue'
    }
  })

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    try {
      localStorage.setItem('portfolio-theme', newTheme)
    } catch {
      // Storage unavailable in private browsing mode
    }
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const experienceCount = content.experience_count !== undefined
    ? Math.max(0, Number(content.experience_count) || 0)
    : 3
  const experienceItems = Array.from({ length: experienceCount }, (_, index) => index + 1).map((number) => ({
    period: getExperienceValue(content, `experience_${number}_period`, number === 1 ? '2024 — PRESENT' : number === 2 ? '2023 — 2024' : number === 3 ? '2022 — PRESENT' : ''),
    role: getExperienceValue(content, `experience_${number}_role`, number === 1 ? 'FULL-STACK DEVELOPER' : number === 2 ? 'CYBERSECURITY PRACTITIONER' : number === 3 ? 'TECHNICAL PROJECTS' : ''),
    company: getExperienceValue(content, `experience_${number}_company`, number === 1 ? 'INDEPENDENT WORK' : number === 2 ? 'SECURITY LABS' : number === 3 ? 'PERSONAL PORTFOLIO' : ''),
    description: getExperienceValue(content, `experience_${number}_description`, number === 1 ? 'Building responsive web experiences, portfolio systems, and practical tools from idea to deployment.' : number === 2 ? 'Developing hands-on skills through Linux, web security, networking, and capture-the-flag practice.' : number === 3 ? 'Turning academic knowledge into focused projects across development, design, and infrastructure.' : '')
  })).reverse()
  const [projects, setProjects] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [showProfileImage, setShowProfileImage] = useState(false)
  const [activeLightboxImg, setActiveLightboxImg] = useState(null)
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

  useEffect(() => {
    if (!showProfileImage) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setShowProfileImage(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showProfileImage])

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormMessage('')
    
    const formPayload = new FormData(e.target)
    formPayload.append('access_key', 'd9116e57-6a7a-48f4-9db4-e2575a8bb2ac')
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formPayload
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFormMessage('✓ Thank you! Your inquiry has been sent successfully.')
        setFormData({ fullname: '', company: '', email: '', service: '', budget: '', details: '' })
        setTimeout(() => setFormMessage(''), 6000)
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
    const loadContent = async () => {
      try {
        const [cRes, sRes, aRes, prRes] = await Promise.allSettled([
          supabase.from('site_content').select('*'),
          supabase.from('skills').select('*').order('order'),
          supabase.from('achievements').select('*').order('order'),
          supabase.from('projects').select('*').order('order')
        ])

        if (cRes.status === 'fulfilled' && !cRes.value.error && cRes.value.data) {
          const fetched = Object.fromEntries(cRes.value.data.map(r => [r.key, r.value]))
          setContent(prev => {
            const next = { ...prev, ...fetched }
            try {
              localStorage.setItem('portfolio_site_content', JSON.stringify(next))
            } catch (err) {
              console.debug(err)
            }
            return next
          })
        } else if (cRes.status === 'fulfilled' && cRes.value.error) {
          console.error('Failed to load site content:', cRes.value.error)
        }

        if (sRes.status === 'fulfilled' && !sRes.value.error && sRes.value.data && sRes.value.data.length > 0) {
          setSkills(sRes.value.data)
        }

        if (aRes.status === 'fulfilled' && !aRes.value.error && aRes.value.data) {
          setAchievements(aRes.value.data)
        }

        if (prRes.status === 'fulfilled' && !prRes.value.error && prRes.value.data) {
          const placeholderTitles = new Set(['E-Commerce Platform', 'Task Management App', 'Portfolio CMS'])
          setProjects(prRes.value.data.filter(project => !placeholderTitles.has(project.title)))
        }
      } catch (error) {
        console.error('Failed to load portfolio content:', error)
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadContent()
    }

    loadContent()
    document.addEventListener('visibilitychange', refreshWhenVisible)

    // Cross-tab real-time sync with Admin dashboard
    let bc
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('portfolio_sync_channel')
        bc.onmessage = (event) => {
          if (event.data?.content) {
            setContent(event.data.content)
          } else if (event.data?.key !== undefined) {
            setContent(prev => ({ ...prev, [event.data.key]: event.data.value }))
          }
        }
      }
    } catch (err) {
      console.debug(err)
    }

    const handleStorage = (e) => {
      if (e.key === 'portfolio_site_content' && e.newValue) {
        try {
          setContent(JSON.parse(e.newValue))
        } catch (err) {
          console.debug(err)
        }
      }
    }
    window.addEventListener('storage', handleStorage)

    const channel = supabase
      .channel('site-content-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, loadContent)
      .subscribe()

    return () => {
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.removeEventListener('storage', handleStorage)
      if (bc) bc.close()
      supabase.removeChannel(channel)
    }
  }, [])

  const get = (key, fallback = '') => content[key] || fallback
  const heroImage = get('hero_image_url') || get('profile_image_url')
  const aboutImage = get('about_image_url') || get('profile_image_url')
  const parseTags = (tags) => {
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean)
    return []
  }

  const handleBookCallSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const destination = get('footer_phone', '01701826202').replace(/[^\d+]/g, '')
    const whatsappNumber = destination.startsWith('+')
      ? destination.slice(1)
      : destination.startsWith('0') ? `880${destination.slice(1)}` : destination
    const message = [
      'New call booking request',
      `Name: ${data.get('name')}`,
      `Company: ${data.get('company') || 'Not provided'}`,
      `Email: ${data.get('email')}`,
      `WhatsApp: ${data.get('country_code')}${data.get('whatsapp') || 'Not provided'}`
    ].join('\n')

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    form.reset()
    setShowModal(false)
  }

  const achievementsDriveUrl = get('achievements_drive_url', 'https://drive.google.com/drive/folders/17sKX9tVvo2_pIFUN4Fs3Y_XUzuuk1NBo?usp=sharing')
  const certificatesDriveUrl = get('certificates_drive_url', 'https://drive.google.com/drive/folders/1QzBad3cOJzejtCeEm-VDnpjRMgkrsMyX?usp=sharing')

  return (
    <>
      {/* Background Cyber Rain & Floating Agent Swarm from Reference Video */}
      <MatrixRain theme={theme} />
      <AgentSwarm theme={theme} />
      <div className="ambient-glow" aria-hidden="true" />
      <div className="cyber-grid-overlay" aria-hidden="true" />

      <div className="content">
        <header>
          <a href="#home" className="logo" aria-label="Home">
            <span className="diamond">◆</span>
            <span className="logo-text">{get('header_name', 'ABDULLAH AL IFAQUE')}</span>
            <span className="logo-status-tag">{get('header_status_tag', 'SYS.ON')}</span>
          </a>

          <div className="header-actions">
            <nav className={mobileNavOpen ? 'nav-open' : ''}>
              <ul>
                <li><a href="#home" onClick={() => setMobileNavOpen(false)}><span className="nav-index">01</span>HOME</a></li>
                <li><a href="#about-hero" onClick={() => setMobileNavOpen(false)}><span className="nav-index">02</span>ABOUT</a></li>
                <li><a href="#process" onClick={() => setMobileNavOpen(false)}><span className="nav-index">03</span>EDUCATION</a></li>
                <li><a href="#experience" onClick={() => setMobileNavOpen(false)}><span className="nav-index">04</span>EXPERIENCE</a></li>
                <li><a href="#skillset-head" onClick={() => setMobileNavOpen(false)}><span className="nav-index">05</span>SKILLS</a></li>
                <li><a href="#projects" onClick={() => setMobileNavOpen(false)}><span className="nav-index">06</span>PROJECTS</a></li>
                <li><a href="#achievements" onClick={() => setMobileNavOpen(false)}><span className="nav-index">07</span>ACHIEVEMENTS</a></li>
                <li><a href="#contact" onClick={() => setMobileNavOpen(false)}><span className="nav-index">08</span>CONTACT</a></li>
              </ul>

              <div className="mobile-nav-theme">
                <span className="mobile-theme-label">// ACCENT COLOR</span>
                <div className="theme-toggle-pills">
                  <button
                    type="button"
                    className={`theme-btn ${theme === 'blue' ? 'active blue' : ''}`}
                    onClick={() => { handleThemeChange('blue'); setMobileNavOpen(false); }}
                  >
                    <span className="theme-indicator blue" />
                    <span>BLUE (DEFAULT)</span>
                  </button>
                  <button
                    type="button"
                    className={`theme-btn ${theme === 'red' ? 'active red' : ''}`}
                    onClick={() => { handleThemeChange('red'); setMobileNavOpen(false); }}
                  >
                    <span className="theme-indicator red" />
                    <span>RED (CRIMSON)</span>
                  </button>
                </div>
              </div>
            </nav>

            {/* Desktop & Header bar theme switcher */}
            <div className="theme-switcher" role="group" aria-label="Select accent color">
              <button
                type="button"
                className={`theme-btn ${theme === 'blue' ? 'active blue' : ''}`}
                onClick={() => handleThemeChange('blue')}
                title="Blue (Default)"
                aria-pressed={theme === 'blue'}
              >
                <span className="theme-indicator blue" />
                <span className="theme-btn-text">BLUE</span>
              </button>
              <button
                type="button"
                className={`theme-btn ${theme === 'red' ? 'active red' : ''}`}
                onClick={() => handleThemeChange('red')}
                title="Crimson Red"
                aria-pressed={theme === 'red'}
              >
                <span className="theme-indicator red" />
                <span className="theme-btn-text">RED</span>
              </button>
            </div>

            <button
              type="button"
              className="mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <span className={`bar ${mobileNavOpen ? 'open' : ''}`} />
              <span className={`bar ${mobileNavOpen ? 'open' : ''}`} />
            </button>
          </div>
        </header>

        {/* ─── 01 HERO SECTION (Animated Hero Layout matching Reference Video) ─── */}
        <section id="home">
          <div className="hero-giant-outline" aria-hidden="true">{get('hero_bg_wordmark', 'PORTFOLIO')}</div>
          <div className="wrap hero-wrap">
            <div className="home-left">
              <div className="hero-intro-header">
                <span className="hero-script-greeting">{get('hero_script_greeting', "Hello, I'm")}</span>
                <div className="hero-name-badge">
                  <span>{get('header_name', 'ABDULLAH AL IFAQUE')}</span>
                </div>
              </div>

              <div className="cyber-hud-badge">
                <span className="hud-pulse" />
                <span className="hud-text">{get('hero_hud_status', 'STATUS: ACTIVE // FULL-STACK & CYBERSECURITY')}</span>
              </div>

              <h1 dangerouslySetInnerHTML={{__html: sanitizeTextMarkup(get('hero_headline', 'YOUR SILENCE <br/><span class="accent-text">SECURED.</span>'))}} />

              <p className="lead">{get('hero_subtext', 'Voicura is a privacy-first cybersecurity service that encrypts your presence, protects your voice, and vanishes your digital footprint—elegantly.')}</p>

              <div className="btn-row">
                <a 
                  href={get('resume_url', '#')} 
                  target="_blank" 
                  rel="noopener" 
                  className="btn primary glow-btn"
                  onClick={(e) => {
                    const url = get('resume_url', '')
                    if (url && url !== '#') {
                      e.preventDefault()
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
                  <span>{get('hero_resume_btn_text', 'DOWNLOAD RESUME')}</span>
                  <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
                <a href="#projects" className="btn secondary">
                  <span>{get('hero_explore_btn_text', 'EXPLORE WORK')}</span>
                  <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </a>
              </div>
            </div>

            {/* Right Side: Portrait Card matching video */}
            <div className="hero-card-side">
              <div 
                className="hero-portrait-card" 
                onClick={() => {
                  if (heroImage) {
                    setActiveLightboxImg(heroImage)
                    setShowProfileImage(true)
                  }
                }} 
                role="button"
                tabIndex={0}
                aria-label="Enlarge portrait"
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && heroImage) {
                    setActiveLightboxImg(heroImage)
                    setShowProfileImage(true)
                  }
                }}
              >
                <div className="card-top-tag">{get('hero_portrait_tag', '# SOVEREIGN SILICON ACTIVE')}</div>
                {heroImage ? (
                  <img src={heroImage} alt="Profile" className="hero-portrait-img" />
                ) : (
                  <div className="hero-portrait-fallback">
                    <svg viewBox="0 0 120 120" className="hero-avatar-svg" fill="none">
                      <circle cx="60" cy="46" r="26" stroke="var(--accent-red)" strokeWidth="2" strokeDasharray="4 2" />
                      <circle cx="60" cy="46" r="18" fill="var(--accent-red)" fillOpacity="0.12" />
                      <path d="M24 102c0-20 16-36 36-36s36 16 36 36" stroke="var(--accent-red)" strokeWidth="2" />
                      <line x1="10" y1="60" x2="110" y2="60" stroke="var(--accent-red)" strokeWidth="0.8" strokeDasharray="2 4" strokeOpacity="0.5" />
                    </svg>
                    <span className="fallback-hud-text">{get('hero_portrait_fallback_tag', 'CYBERSECURITY PRACTITIONER')}</span>
                  </div>
                )}
                <div className="card-bottom-tag">
                  <span className="status-dot green" />
                  <span>{get('hero_identity_tag', 'IDENTITY: IFAQUE // VERIFIED')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 02 ABOUT SECTION (Exact Match to User Reference Screenshot) ─── */}
        <section id="about-hero">
          <div className="wrap">
            <div className="section-label">02 — ABOUT</div>
            <div className="about-content">
              <div className="name-block">
                <h1 dangerouslySetInnerHTML={{__html: sanitizeTextMarkup(get('about_name', 'ABDULLAH AL<br/>IFAQUE'))}} />
                <p>{get('about_bio', 'A dedicated student at Bangladesh University of Professionals, passionate about technology, design, and building impactful digital experiences—elegantly')}</p>
                <div className="about-stats-card">
                  <div className="about-stat-item">
                    <div className="stat-value">{get('stat_degree', 'CSE')}</div>
                    <div className="stat-label">{get('stat_degree_label', 'STUDENT')}</div>
                  </div>
                  <div className="stat-slash" aria-hidden="true">/</div>
                  <div className="about-stat-item">
                    <div className="stat-value">{get('stat_university', 'BUP')}</div>
                    <div className="stat-label">{get('stat_university_label', 'UNIVERSITY')}</div>
                  </div>
                  <div className="stat-slash" aria-hidden="true">/</div>
                  <div className="about-stat-item">
                    <div className="stat-value">{get('stat_year', '2022')}</div>
                    <div className="stat-label">{get('stat_year_label', 'BATCH')}</div>
                  </div>
                </div>
              </div>

              {aboutImage && (
                <div className="profile-image-container">
                  <button
                    type="button"
                    className="profile-image-button"
                    aria-label="Enlarge profile photo"
                    onClick={() => {
                      setActiveLightboxImg(aboutImage)
                      setShowProfileImage(true)
                    }}
                  >
                    <img src={aboutImage} alt="Profile" className="profile-image" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── 03 EDUCATION SECTION (Holographic 3D Globe Animation) ─── */}
        <section id="process">
          <div className="wrap">
            <div className="section-label"><span className="label-prefix">// 03</span> EDUCATION</div>

            <div className="edu-layout">
              {/* Left: heading + holographic 3D globe animation */}
              <div className="edu-left">
                <h2 className="edu-heading" dangerouslySetInnerHTML={{__html: sanitizeTextMarkup(get('edu_heading', 'ACADEMIC<br/><span class="accent">BACKGROUND</span>'))}} />
                <div className="globe-frame">
                  <div className="globe-hud-header">
                    <span className="hud-dot" />
                    <span className="hud-title">{get('edu_globe_title', '3D HOLOGRAPHIC // GLOBE')}</span>
                    <span className="hud-coord">{get('edu_globe_coord', 'LOC: 23.81°N, 90.41°E')}</span>
                  </div>
                  <Globe theme={theme} />
                  <div className="globe-corner-tl" />
                  <div className="globe-corner-tr" />
                  <div className="globe-corner-bl" />
                  <div className="globe-corner-br" />
                </div>
              </div>

              {/* Right: education card & thesis */}
              <div className="edu-right">
                <div className="edu-card">
                  <div className="card-cyber-accent" />
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
                      <div className="edu-meta-value">{get('edu_meta_degree', 'Bachelor of Science')}</div>
                    </div>
                    <div className="edu-meta-item">
                      <div className="edu-meta-label">DEPARTMENT</div>
                      <div className="edu-meta-value">{get('edu_meta_dept', get('edu_inst_abbr', 'CSE'))}</div>
                    </div>
                    <div className="edu-meta-item">
                      <div className="edu-meta-label">STATUS</div>
                      <div className="edu-meta-value edu-status-active">
                        <span className="pulse-dot" />
                        {get('edu_status', 'ONGOING')}
                      </div>
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
                    <div className="thesis-badge">{get('thesis_badge', 'THESIS DOCUMENT')}</div>
                    <svg className="thesis-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </div>
                  <div className="thesis-title">{get('thesis_title', 'University Thesis')}</div>
                  <div className="thesis-desc">{get('thesis_desc', 'Full thesis document available on Google Drive. Click to view and download.')}</div>
                  <div className="thesis-footer">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm7 1.5L18.5 8H13V3.5zM12 17l-4-4h2.5v-3h3v3H16l-4 4z"/></svg>
                    <span>View on Google Drive →</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 04 WORKING EXPERIENCE SECTION ─── */}
        <section id="experience">
          <div className="wrap">
            <div className="section-label"><span className="label-prefix">// 04</span> WORKING EXPERIENCE</div>
            <h2 dangerouslySetInnerHTML={{__html: sanitizeTextMarkup(get('experience_heading', 'WORKING<br/><span class="accent">EXPERIENCE</span>'))}} />
            <div className="experience-list">
              {experienceItems.map((item, index) => (
                <article className="experience-item" key={item.role + index}>
                  <div className="experience-index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="experience-period">{item.period}</div>
                  <div className="experience-main">
                    <div className="experience-role">{item.role}</div>
                    <div className="experience-company">{item.company}</div>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 05 SKILLS SECTION ─── */}
        <section id="skills-section">
          <div id="skillset-head" className="wrap">
            <div className="section-label"><span className="label-prefix">// 05</span> SKILLS</div>
            <h3>{get('skills_heading', 'THREE-LAYER SKILL SET')}</h3>
          </div>

          <div className="skills-list">
            {skills.map((skill, i) => (
              <div key={skill.id} className="skill-row">
                <div className="wrap skill-row-inner">
                  <div className="left-col">
                    <div className="skill-num-wrapper">
                      <span className="skill-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="skill-layer-tag">LAYER // 0{i + 1}</span>
                    </div>
                    <div className="skill-cat">{skill.category}</div>
                    <p>{skill.description}</p>
                    <div className="tag-row">
                      {parseTags(skill.tags).map((tag, idx) => (
                        <div key={idx} className="tag">{tag}</div>
                      ))}
                    </div>
                    {/* Support both new writeups array and legacy single writeup */}
                    {Array.isArray(skill.writeups) && skill.writeups.length > 0 ? (
                      skill.writeups.map((writeup, idx) => (
                        writeup.url && writeup.url !== '#' && (
                          <a key={idx} href={writeup.url} target="_blank" rel="noopener" className="skill-writeup-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            <span>{writeup.label || 'View Writeup'}</span>
                            <svg className="writeup-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                          </a>
                        )
                      ))
                    ) : (skill.writeup_url || (skill.writeup && skill.writeup.url)) ? (
                      <a href={skill.writeup_url || skill.writeup.url} target="_blank" rel="noopener" className="skill-writeup-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        <span>{skill.writeup_label || (skill.writeup && skill.writeup.label) || 'View Writeup'}</span>
                        <svg className="writeup-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      </a>
                    ) : null}
                  </div>
                  <div className="right-col">
                    <div className="icon-box">
                      {skill.image_url ? (
                        <img src={skill.image_url} alt={skill.category} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                      ) : (
                        <div className="icon-svg-wrapper" dangerouslySetInnerHTML={{__html: sanitizeIconMarkup(skill.icon_svg)}} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 06 FEATURED PROJECTS SECTION ─── */}
        <section id="projects">
          <div className="wrap">
            <div className="section-label"><span className="label-prefix">// 06</span> PROJECTS</div>
            <h2>FEATURED<br/><span className="accent">PROJECTS</span></h2>
            <div className="projects-grid">
              {projects.map((project, i) => (
                <div key={project.id} className="project-card">
                  <div className="project-card-header">
                    <div className="project-number">{String(i + 1).padStart(2, '0')}</div>
                    <div className="project-type-badge">DEPLOYED</div>
                  </div>
                  {project.image_url && (
                    <div className="project-media">
                      <img src={project.image_url} alt={project.title} className="project-img" />
                    </div>
                  )}
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tags">
                    {parseTags(project.tags).map((tag, idx) => (
                      <span key={idx} className="project-tag">{tag}</span>
                    ))}
                    {Array.isArray(project.images) && project.images.length > 0 && (
                      <button 
                        type="button"
                        className="project-tag project-tag-images" 
                        onClick={() => { setCurrentProject(project); setShowGallery(true); }}
                      >
                        📸 Images ({project.images.length})
                      </button>
                    )}
                  </div>
                  <div className="project-links">
                    {project.live_url && project.live_url !== '#' && (
                      <a href={project.live_url} target="_blank" rel="noopener" className="project-link primary-link">
                        <span>Live Demo</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      </a>
                    )}
                    {Array.isArray(project.links) && project.links.length > 0 && project.links.map((link, idx) => (
                      link.url && link.url !== '#' && (
                        <a key={idx} href={link.url} target="_blank" rel="noopener" className="project-link">
                          <span>{link.label || 'Link'}</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                        </a>
                      )
                    ))}
                    {(!Array.isArray(project.links) || project.links.length === 0) && project.repo_url && project.repo_url !== '#' && (
                      <a href={project.repo_url} target="_blank" rel="noopener" className="project-link">
                        <span>GitHub</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 07 ACHIEVEMENTS & CERTIFICATES SECTION ─── */}
        <section id="achievements">
          <div className="wrap">
            <div className="section-label"><span className="label-prefix">// 07</span> ACHIEVEMENTS</div>
            <h2>ACHIEVEMENTS &amp;<br/><span className="accent">CERTIFICATES</span></h2>
            <div className="achievement-overview">
              <a className="overview-card overview-card-primary" href={achievementsDriveUrl} target="_blank" rel="noopener">
                <div className="overview-card-top">
                  <span className="overview-card-index">01</span>
                  <span className="overview-pill">{get('achievements_card_badge', 'DRIVE REPOSITORY')}</span>
                </div>
                <h3>{get('achievements_card_title', 'Achievements')}</h3>
                <p>{get('achievements_card_desc', 'Open my Google Drive repository to view verified achievement files, competition certificates, and proof of work.')}</p>
                <span className="overview-card-cta">
                  <span>Open Drive</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>
              <a className="overview-card" href={certificatesDriveUrl} target="_blank" rel="noopener">
                <div className="overview-card-top">
                  <span className="overview-card-index">02</span>
                  <span className="overview-pill">{get('certificates_card_badge', 'ACADEMIC & CTF')}</span>
                </div>
                <h3>{get('certificates_card_title', 'Certificates')}</h3>
                <p>{get('certificates_card_desc', 'Open my verified certificate folder on Google Drive to view academic recognitions, course credentials, and certifications.')}</p>
                <span className="overview-card-cta">
                  <span>Open Certificates</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                </span>
              </a>
            </div>

            <div className="ach-lists">
              <div className="ach-list">
                <div className="ach-list-title"><span className="ach-num">1.</span> ACHIEVEMENTS LIST</div>
                <ul>
                  {(get('achievements_list', ''))
                    .split('\n').filter(l => l.trim()).map((item, i) => <li key={i}>{item}</li>)}
                  {get('achievements_list', '').trim() === '' && (
                    <li style={{color: 'var(--text-faint)', fontStyle: 'italic'}}>No achievements added yet. Add them in the admin panel.</li>
                  )}
                </ul>
              </div>
              <div className="ach-list">
                <div className="ach-list-title"><span className="ach-num">2.</span> CERTIFICATES LIST</div>
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

        {/* ─── 08 CONTACT SECTION ─── */}
        <section id="contact">
          <div className="wrap">
            <div className="cta-grid">
              <div className="cta-left">
                <div className="section-label"><span className="label-prefix">// 08</span> CONTACT</div>
                <h2 dangerouslySetInnerHTML={{__html: sanitizeTextMarkup(get('contact_headline', 'Have a project idea<br/>in mind? Let\'s get<br/><span class="accent-text">started.</span>'))}} />
                <p>{get('contact_subtext', "We'll schedule a call to discuss your idea. After discovery sessions, we'll send a proposal, and upon approval, we'll get started.")}</p>
                <div className="contact-info-pills">
                  <div className="info-pill"><span className="dot red" /> {get('contact_pill_1', 'RESPONSE TIME: < 24H')}</div>
                  <div className="info-pill"><span className="dot green" /> {get('contact_pill_2', 'AVAILABILITY: SELECT PROJECTS')}</div>
                </div>
              </div>
              <div className="contact-form-panel">
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  {formMessage && (
                    <div className={`form-alert ${formMessage.startsWith('Error') ? 'form-alert-error' : 'form-alert-success'}`}>
                      {formMessage}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="fullname">Full Name <span className="req">*</span></label>
                    <input type="text" id="fullname" name="name" placeholder="Jane Cooper" required 
                      value={formData.fullname} 
                      onChange={e => setFormData({...formData, fullname: e.target.value})} />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="company">Company Name <span className="req">*</span></label>
                      <input type="text" id="company" name="company" placeholder="Ex. Tesla Inc" required 
                        value={formData.company} 
                        onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email <span className="req">*</span></label>
                      <input type="email" id="email" name="email" placeholder="you@example.com" required 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="service">Service Required <span className="req">*</span></label>
                      <select id="service" name="service" required 
                        value={formData.service} 
                        onChange={e => setFormData({...formData, service: e.target.value})}>
                        <option value="">Select Your Service</option>
                        <option value="Web Development">Web Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Security Consulting">Security Consulting</option>
                        <option value="Full-Stack Application">Full-Stack Application</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="budget">Project Budget <span className="req">*</span></label>
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
                    <label htmlFor="details">Project Details <span className="req">*</span></label>
                    <textarea id="details" name="message" rows="4" placeholder="Tell us more about your project goals and scope..." required 
                      value={formData.details} 
                      onChange={e => setFormData({...formData, details: e.target.value})} />
                  </div>

                  <button type="submit" className="btn-submit glow-btn" disabled={formSubmitting}>
                    <span>{formSubmitting ? 'TRANSMITTING INQUIRY...' : 'SEND INQUIRY →'}</span>
                  </button>
                  
                  <p className="form-footer">
                    {get('contact_call_prompt', 'Prefer direct scheduling?')} <button type="button" onClick={() => setShowModal(true)} className="book-call-btn">{get('contact_call_btn_text', 'Book A Call Directly →')}</button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Book a Call Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>
              <div className="modal-header">
                <h3>Schedule a Direct Call</h3>
                <p>Fill out the form below to initiate a private consultation over WhatsApp.</p>
              </div>
              <form onSubmit={handleBookCallSubmit}>
                <div className="form-group">
                  <label htmlFor="call-name">Your Name</label>
                  <input id="call-name" type="text" name="name" required placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label htmlFor="call-company">Company</label>
                  <input id="call-company" type="text" name="company" placeholder="Acme Inc." />
                </div>
                <div className="form-group">
                  <label htmlFor="call-email">Email Address</label>
                  <input id="call-email" type="email" name="email" required placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="call-whatsapp">WhatsApp Number</label>
                  <div className="phone-input-group">
                    <select name="country_code" defaultValue="+880">
                      <option value="+880">BD (+880)</option>
                      <option value="+1">US (+1)</option>
                      <option value="+44">UK (+44)</option>
                      <option value="+971">UAE (+971)</option>
                      <option value="+91">IN (+91)</option>
                    </select>
                    <input id="call-whatsapp" type="tel" name="whatsapp" required placeholder="1701826202" />
                  </div>
                </div>
                <button type="submit" className="btn primary glow-btn" style={{ width: '100%', marginTop: '1rem' }}>
                  <span>DISPATCH ON WHATSAPP →</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Screenshot Gallery Modal */}
        {showGallery && currentProject && currentProject.images && (
          <div className="modal-overlay" onClick={() => setShowGallery(false)}>
            <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="modal-close" onClick={() => setShowGallery(false)} aria-label="Close gallery">✕</button>
              <div className="gallery-header">
                <h3>{currentProject.title} — Screenshot Archive</h3>
                <p>{currentProject.images.length} verified project screenshots</p>
              </div>
              <div className="gallery-grid">
                {currentProject.images.map((imgUrl, idx) => (
                  <div key={idx} className="gallery-item">
                    <a href={imgUrl} target="_blank" rel="noopener">
                      <img src={imgUrl} alt={`${currentProject.title} - Screenshot ${idx+1}`} className="gallery-thumb" />
                    </a>
                    <div className="gallery-caption">SCREENSHOT 0{idx+1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Image Lightbox */}
        {showProfileImage && (activeLightboxImg || aboutImage || heroImage || get('profile_image_url')) && (
          <div
            className="profile-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged profile photo"
            onClick={() => setShowProfileImage(false)}
          >
            <button
              type="button"
              className="profile-lightbox-close"
              aria-label="Close enlarged profile photo"
              onClick={() => setShowProfileImage(false)}
            >
              ✕
            </button>
            <div className="profile-lightbox-wrap" onClick={(e) => e.stopPropagation()}>
              <img
                src={activeLightboxImg || aboutImage || heroImage || get('profile_image_url')}
                alt="Profile"
                className="profile-lightbox-image"
              />
              <div className="profile-lightbox-hud">{get('hero_identity_tag', 'ABDULLAH AL IFAQUE // VERIFIED IDENTITY')}</div>
            </div>
          </div>
        )}

        {/* ─── FOOTER ─── */}
        <footer>
          <div className="wrap">
            <div className="foot-links">
              <a href="#about-hero">ABOUT</a>
              <a href="#process">EDUCATION</a>
              <a href="#experience">WORKING EXPERIENCE</a>
              <a href="#skillset-head">SKILLS</a>
              <a href="#projects">PROJECTS</a>
              <a href="#achievements">ACHIEVEMENTS</a>
              <a href="#contact">CONTACT</a>
            </div>

            <div className="foot-top">
              <div className="foot-wordmark">
                <h2>{get('footer_wordmark', 'IFAQUE')}</h2>
                <div className="wordmark-tagline">{get('footer_tagline', 'CYBERSECURITY PRACTITIONER & DEVELOPER')}</div>
              </div>

              <div className="foot-contact">
                <div className="foot-contact-label">CONTACT CHANNEL</div>
                <a href={`mailto:${get('footer_email', 'mdabdullah2002111@gmail.com')}`} className="foot-email">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                  <span>{get('footer_email', 'mdabdullah2002111@gmail.com')}</span>
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
                      <path d="M20.5 14.9c-1.2 0-2.4-.2-3.5-.6-.3-.1-.6 0-.8.2l-1.6 1.6c-2.5-1.3-4.6-3.4-5.9-5.9l1.6-1.6c.2-.2.3-.5.2-.8-.4-1.1-.6-2.3-.6-3.5 0-.4-.3-.7-.7-.7H6.2c-.4 0-.7.3-.7.7 0 7.8 6.3 14.1 14.1 14.1.4 0 .7-.3.7-.7v-2.2c0-.4-.3-.7-.7-.7Z" fill="var(--accent-red)"/>
                    </svg>
                  </span>
                  <span>{get('footer_phone', '01701826202')}</span>
                </div>
              </div>
            </div>

            <div className="foot-bottom">
              <div className="foot-copyright">{get('footer_copyright', '©2024 — ALL RIGHTS RESERVED')}</div>
              <div className="socials">
                <a href={get('social_linkedin', 'https://www.linkedin.com/in/abdullah-al-ifaque-951065288/')} target="_blank" rel="noopener">LINKEDIN ↗</a>
                <a href={get('social_github', 'https://github.com/abdullah-1056')} target="_blank" rel="noopener">GITHUB ↗</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
