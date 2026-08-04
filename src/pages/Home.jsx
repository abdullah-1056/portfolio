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
  const [steps, setSteps] = useState([
    { id: 1, step_number: '01', title: 'RESEARCH & DISCOVERY', body: 'Before any code is written, the problem is deeply understood. Research drives every decision—ensuring the solution fits perfectly.' },
    { id: 2, step_number: '02', title: 'DESIGN & PROTOTYPE', body: 'Clean interfaces are designed with user experience at the core. Prototypes are built to validate ideas before full development begins.' },
    { id: 3, step_number: '03', title: 'DEVELOP & ITERATE', body: 'Code is written with precision using modern tools and frameworks. Continuous iteration ensures quality at every stage.' },
    { id: 4, step_number: '04', title: 'DELIVER & REFINE', body: 'The final product is polished and delivered with care. Feedback is welcomed to continuously improve and refine the work.' }
  ])
  const [skills, setSkills] = useState([
    { 
      id: 1, 
      category: 'WEB DEVELOPMENT', 
      description: 'Every project begins with clean, maintainable code that brings ideas to life with modern frameworks and best practices.',
      tags: ['REACT & TYPESCRIPT', 'UI/UX DESIGN'],
      icon_svg: '<svg width="90" height="90" viewBox="0 0 100 100" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1"><polygon points="50,5 95,27 95,73 50,95 5,73 5,27" /><line x1="50" y1="5" x2="50" y2="95"/><line x1="5" y1="27" x2="95" y2="73"/><line x1="95" y1="27" x2="5" y2="73"/></svg>'
    }
  ])
  const [achievements, setAchievements] = useState([
    { id: 1, title: 'React Developer Certification', issuer: 'Meta', date: '2024', description: 'Advanced React patterns and best practices certification from Meta.', credential_url: '#' },
    { id: 2, title: 'Full Stack Web Development', issuer: 'freeCodeCamp', date: '2023', description: 'Completed 300+ hours of full stack development coursework and projects.', credential_url: '#' },
    { id: 3, title: 'UI/UX Design Fundamentals', issuer: 'Google', date: '2023', description: 'User experience design principles and prototyping certification.', credential_url: '#' }
  ])

  useEffect(() => {
    Promise.all([
      supabase.from('site_content').select('*'),
      supabase.from('triplet_items').select('*').order('order'),
      supabase.from('process_steps').select('*').order('order'),
      supabase.from('skills').select('*').order('order'),
      supabase.from('achievements').select('*').order('order')
    ]).then(([c, t, p, s, a]) => {
      if (c.data && c.data.length > 0) {
        setContent(Object.fromEntries(c.data.map(r => [r.key, r.value])))
      }
      if (t.data && t.data.length > 0) setTriplets(t.data)
      if (p.data && p.data.length > 0) setSteps(p.data)
      if (s.data && s.data.length > 0) setSkills(s.data)
      if (a.data && a.data.length > 0) setAchievements(a.data)
    })
  }, [])

  const get = (key, fallback = '') => content[key] || fallback

  return (
    <>
      <MatrixRain />
      <div className="content">
        <header>
          <div className="logo"><span className="diamond">&#9670;</span> {get('header_name', 'ABDULLAH AL IFAQUE')}</div>
          <nav>
            <ul>
              <li><a href="#home"><span className="num">01</span>HOME</a></li>
              <li><a href="#about-hero"><span className="num">02</span>ABOUT</a></li>
              <li><a href="#process"><span className="num">03</span>EDUCATION</a></li>
              <li><a href="#skillset-head"><span className="num">04</span>SKILLS</a></li>
              <li><a href="#qualities"><span className="num">05</span>PROJECTS</a></li>
              <li><a href="#contact"><span className="num">06</span>CONTACT</a></li>
            </ul>
          </nav>
        </header>

        <section id="home">
          <div className="wrap">
            <div className="home-left">
              <h1 dangerouslySetInnerHTML={{__html: get('hero_headline', 'LET\'S BUILD<br>SOMETHING GREAT.<br>MOVE IN SILENCE.')}} />
              <p className="lead">{get('hero_subtext', 'Your next project deserves more than ordinary. Step into a space where quality is effortless, intentional, and always on.')}</p>
              <div className="btn-row">
                <button className="btn primary">GET IN TOUCH</button>
                <button className="btn">LEARN MORE</button>
              </div>
            </div>
            <div className="home-panel">
              <div style={{width:'460px',maxWidth:'40vw',height:'230px',border:'1px solid var(--line)',background:'#050505'}}></div>
            </div>
          </div>
        </section>

        <section id="about-hero">
          <div className="wrap">
            <div className="name-block">
              <h1 dangerouslySetInnerHTML={{__html: get('about_name', 'ABDULLAH AL<br>IFAQUE.')}} />
              <p>{get('about_bio', 'A dedicated student at Bangladesh University of Professionals, passionate about technology, design, and building impactful digital experiences—elegantly.')}</p>
              <div className="btn-row">
                <button className="btn primary">GET IN TOUCH</button>
                <button className="btn">LEARN MORE ABOUT ME</button>
              </div>
            </div>
            <div className="side-stats">
              <div><div className="n">{get('stat_university', 'BUP')}</div><div className="l">University</div></div>
              <div><div className="n">{get('stat_degree', 'CS')}</div><div className="l">Student</div></div>
              <div><div className="n">{get('stat_year', '2024')}</div><div className="l">Current Year</div></div>
            </div>
          </div>
        </section>

        <section className="statement">
          <div className="wrap">
            <div className="divider"></div>
            <div className="cursor-circle"><span></span></div>
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

        <section id="process">
          <div className="wrap">
            <div className="process-grid">
              <div>
                <div className="process-title">
                  <h2 dangerouslySetInnerHTML={{__html: get('process_title', 'SILENT BY NATURE.<br>POWERFUL BY <span class="accent">DESIGN</span>.')}} />
                </div>
                <div className="globe-frame">
                  <Globe />
                </div>
              </div>
              <div className="process-steps">
                {steps.map(s => (
                  <div key={s.id} className="step">
                    <div className="idx">{s.step_number}</div>
                    <h4>{s.title}</h4>
                    <p>{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="calm" style={{position:'relative'}}>
          <div className="wrap">
            <div className="eyebrow">{get('calm_eyebrow', 'A CALM AND DELIBERATE PRESENCE')}</div>
            <div className="calm-heading">{get('calm_heading', 'IN A DIGITAL WORLD THAT NEVER STOPS MOVING, OFFERING QUIET DEDICATION WITHOUT ASKING FOR ATTENTION.')}</div>
          </div>
          <div className="calm-arrow">&#8599;</div>
        </section>

        <div id="skillset-head" className="wrap">
          <h3>{get('skills_heading', 'THREE-LAYER SKILL SET')}</h3>
          <div className="idx">01</div>
        </div>

        {skills.map(skill => (
          <div key={skill.id} className="skill-row">
            <div className="left-col">
              <div className="skill-cat">{skill.category}</div>
              <p>{skill.description}</p>
              <div className="tag-row">
                {(skill.tags || []).map((tag, i) => (
                  <div key={i} className="tag">{tag}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="icon-box" dangerouslySetInnerHTML={{__html: skill.icon_svg}} />
            </div>
          </div>
        ))}

        <section id="qualities">
          <div className="wrap">
            <h2 dangerouslySetInnerHTML={{__html: get('qualities_heading', 'ESSENTIAL QUALITIES FOR A<br>MODERN DEVELOPER')}} />
            <div className="divider"></div>
            <div className="cursor-circle"><span></span></div>
          </div>
        </section>

        <section id="achievements">
          <div className="wrap">
            <h2>ACHIEVEMENTS &<br>CERTIFICATES</h2>
            <div className="achievements-grid">
              {achievements.map((achievement, i) => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-number">{String(i + 1).padStart(2, '0')}</div>
                  <h3>{achievement.title}</h3>
                  <div className="achievement-meta">
                    <span className="issuer">{achievement.issuer}</span>
                    <span className="date">{achievement.date}</span>
                  </div>
                  <p>{achievement.description}</p>
                  {achievement.credential_url && achievement.credential_url !== '#' && (
                    <a href={achievement.credential_url} target="_blank" rel="noopener" className="credential-link">
                      View Credential →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="wrap">
            <div className="cta-grid">
              <div className="cta-left">
                <h2 dangerouslySetInnerHTML={{__html: get('cta_headline', 'LET\'S BUILD<br>SOMETHING GREAT.<br>MOVE IN SILENCE.')}} />
                <p>{get('cta_subtext', 'Your next project deserves more than ordinary. Step into a space where quality is effortless, intentional, and always on.')}</p>
                <div className="btn-row">
                  <button className="btn primary">GET IN TOUCH</button>
                  <button className="btn">LEARN MORE</button>
                </div>
              </div>
              <div className="cta-panel"></div>
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <div className="foot-links">
              <a href="#about-hero">ABOUT</a>
              <a href="#skillset-head">SKILLS</a>
              <a href="#process">PROCESS</a>
              <a href="#contact">CONTACT</a>
            </div>
            <div className="foot-wordmark">
              <h2>{get('footer_wordmark', 'IFAQUE')}</h2>
            </div>
            <div className="foot-bottom">
              <div>{get('footer_copyright', '©2024')}</div>
              <div className="socials">
                <a href={get('social_linkedin', '#')} target="_blank" rel="noopener">LINKEDIN</a>
                <a href={get('social_github', '#')} target="_blank" rel="noopener">GITHUB</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
