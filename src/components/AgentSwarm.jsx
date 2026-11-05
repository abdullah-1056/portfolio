import { useEffect, useRef, useState } from 'react'

const AGENTS = [
  { id: 1, name: 'Lead.AI', color: '#00d2ff', speed: 0.038 },
  { id: 2, name: 'Sentinel', color: '#00f0ff', speed: 0.032 },
  { id: 3, name: 'Architect', color: '#00ff88', speed: 0.035 },
  { id: 4, name: 'Kernel', color: '#ffb700', speed: 0.042 },
  { id: 5, name: 'Neural', color: '#c054ff', speed: 0.034 }
]

export default function AgentSwarm({ theme = 'blue' }) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [layerCount, setLayerCount] = useState(48)
  const [wireframeMode, setWireframeMode] = useState(false)
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 960 : true)

  const isPlayingRef = useRef(true)

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    if (agentsRef.current && agentsRef.current[0]) {
      agentsRef.current[0].color = theme === 'blue' ? '#00d2ff' : '#ff1e44'
    }
  }, [theme])

  const agentsRef = useRef(
    AGENTS.map((a, i) => ({
      ...a,
      x: typeof window !== 'undefined' ? (window.innerWidth * (0.25 + i * 0.12)) : 300,
      y: 220 + (i % 3) * 140,
      tx: 300,
      ty: 200,
      angle: (i / AGENTS.length) * Math.PI * 2,
      orbitRadius: 90 + (i % 3) * 35,
      inspecting: null,
      inspectTimer: 0
    }))
  )

  const inspectBoxRef = useRef(null)

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 960)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isDesktop) return

    let frameId
    let running = true
    let cachedTargets = []
    let lastTargetScan = 0
    let lastDraw = 0
    const targetFpsInterval = 1000 / 35 // 35 FPS: smooth motion with zero frame drops

    const agentEls = AGENTS.map((_, i) => document.getElementById(`agent-cursor-${i}`))
    const inspectEl = inspectBoxRef.current

    // Scan interactive DOM elements once every 3 seconds - eliminates layout thrashing!
    function scanTargets() {
      try {
        const elements = document.querySelectorAll(
          '.hero-name-badge, .cyber-hud-badge, .metric-pill, .hero-portrait-card, .btn, .stat-box, .edu-card, .thesis-card, .skill-row, .project-card, .overview-card, .contact-form, .info-pill'
        )
        const vh = window.innerHeight
        const rects = []

        elements.forEach(el => {
          const r = el.getBoundingClientRect()
          if (r.top >= -50 && r.bottom <= vh + 50 && r.width > 20 && r.height > 20) {
            rects.push({
              left: r.left,
              top: r.top,
              width: r.width,
              height: r.height,
              label: `${Math.round(r.width)} × ${Math.round(r.height)} // ${el.tagName.toLowerCase()}`
            })
          }
        })
        cachedTargets = rects
      } catch {
        cachedTargets = []
      }
    }

    scanTargets()

    // Pick target from cached coordinates
    function pickTarget(agent) {
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (cachedTargets.length > 0 && Math.random() > 0.35) {
        const target = cachedTargets[Math.floor(Math.random() * cachedTargets.length)]
        agent.tx = target.left + target.width * (0.2 + Math.random() * 0.6)
        agent.ty = target.top + target.height * (0.2 + Math.random() * 0.6)
        agent.inspecting = target
        agent.inspectTimer = 75
      } else {
        agent.tx = Math.max(50, Math.min(vw - 80, Math.random() * vw))
        agent.ty = Math.max(90, Math.min(vh - 120, Math.random() * vh))
        agent.inspecting = null
      }
    }

    agentsRef.current.forEach(a => pickTarget(a))

    function animate(now) {
      if (!running) return

      frameId = requestAnimationFrame(animate)

      if (document.hidden || !isPlayingRef.current) return

      const elapsed = now - lastDraw
      if (elapsed < targetFpsInterval) return
      lastDraw = now - (elapsed % targetFpsInterval)

      // Refresh target rects every 3 seconds
      if (now - lastTargetScan > 3000) {
        lastTargetScan = now
        scanTargets()
      }

      // Calculate scroll progress & layer indicator
      const scrollY = window.scrollY
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const ratio = Math.min(1, Math.max(0, scrollY / maxScroll))
      setScrollProgress(Math.round(ratio * 100))
      setLayerCount(Math.min(252, Math.max(12, Math.round(12 + ratio * 240))))

      const isNearBottom = ratio > 0.8
      let activeInspector = null

      agentsRef.current.forEach((a, i) => {
        const el = agentEls[i]
        if (!el) return

        if (isNearBottom) {
          // Bottom area: Orbital swarm circular dance as seen in video frame 50!
          const cx = window.innerWidth * 0.76
          const cy = window.innerHeight * 0.48
          a.angle += 0.025
          const tx = cx + Math.cos(a.angle) * a.orbitRadius
          const ty = cy + Math.sin(a.angle) * (a.orbitRadius * 0.7)
          a.x += (tx - a.x) * 0.06
          a.y += (ty - a.y) * 0.06
        } else {
          // Autonomous roaming & element inspection
          const dx = a.tx - a.x
          const dy = a.ty - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 18 || Math.random() < 0.007) {
            pickTarget(a)
          } else {
            a.x += dx * a.speed
            a.y += dy * a.speed
          }

          if (a.inspecting && a.inspectTimer > 0) {
            a.inspectTimer--
            if (a.inspectTimer > 25) {
              activeInspector = a.inspecting
            }
          }
        }

        // Apply hardware-accelerated transform
        el.style.transform = `translate3d(${a.x}px, ${a.y}px, 0)`
      })

      // Update cyan inspection bounding box
      if (inspectEl) {
        if (activeInspector && !isNearBottom) {
          inspectEl.style.opacity = '1'
          inspectEl.style.transform = `translate3d(${activeInspector.left}px, ${activeInspector.top}px, 0)`
          inspectEl.style.width = `${activeInspector.width}px`
          inspectEl.style.height = `${activeInspector.height}px`
          const tag = inspectEl.querySelector('.inspect-dim-tag')
          if (tag) tag.textContent = activeInspector.label
        } else {
          inspectEl.style.opacity = '0'
        }
      }
    }

    frameId = requestAnimationFrame(animate)

    return () => {
      running = false
      cancelAnimationFrame(frameId)
    }
  }, [isDesktop])

  // Toggle wireframe mode from bottom dock
  useEffect(() => {
    if (wireframeMode) {
      document.body.classList.add('hud-wireframe-active')
    } else {
      document.body.classList.remove('hud-wireframe-active')
    }
    return () => {
      document.body.classList.remove('hud-wireframe-active')
    }
  }, [wireframeMode])

  if (!isDesktop) return null

  return (
    <>
      {/* Floating Autonomous Multi-Agent Cursors */}
      <div className="agent-swarm-overlay" aria-hidden="true">
        {AGENTS.map((agent, i) => (
          <div
            key={agent.id}
            id={`agent-cursor-${i}`}
            className="agent-cursor"
            style={{ willChange: 'transform' }}
          >
            <svg
              className="agent-pointer-svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={agent.color}
              stroke="#050508"
              strokeWidth="1.6"
            >
              <polygon points="3 3 10 21 13 13 21 10 3 3" />
            </svg>
            <div className="agent-badge" style={{ borderColor: `${agent.color}66` }}>
              <span className="agent-dot" style={{ background: agent.color }} />
              <span className="agent-name">{agent.name}</span>
            </div>
          </div>
        ))}

        {/* Figma/DevTools-Style Cyan Inspection Bounding Box */}
        <div ref={inspectBoxRef} className="agent-inspect-box">
          <span className="inspect-corner tl">+</span>
          <span className="inspect-corner tr">+</span>
          <span className="inspect-corner bl">+</span>
          <span className="inspect-corner br">+</span>
          <div className="inspect-dim-tag">284 × 42 // Layer_01</div>
        </div>
      </div>

      {/* Futuristic Bottom Player / Agent Swarm Dock */}
      <div className="agent-dock-bar">
        <div className="dock-pips">
          {AGENTS.map(a => (
            <span
              key={a.id}
              className="dock-pip"
              style={{ background: a.color, boxShadow: `0 0 6px ${a.color}88` }}
              title={a.name}
            />
          ))}
        </div>

        <div className="dock-label">
          <span className="dock-count">5 AGENTS</span>
          <span className="dock-layers">// {layerCount} / 252 LAYERS</span>
        </div>

        <div className="dock-progress-track" title={`Scroll Position: ${scrollProgress}%`}>
          <div className="dock-progress-fill" style={{ width: `${Math.max(6, scrollProgress)}%` }} />
        </div>

        <div className="dock-status-pill">
          <span className="dock-live-dot" />
          <span>{isPlaying ? 'SENTRY' : 'PAUSED'}</span>
        </div>

        <button
          type="button"
          className={`dock-btn dock-wireframe-btn ${wireframeMode ? 'active' : ''}`}
          onClick={() => setWireframeMode(!wireframeMode)}
          title="Toggle Wireframe HUD Mode"
          aria-label="Toggle wireframe inspector"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <span>HUD</span>
        </button>

        <button
          type="button"
          className="dock-btn dock-toggle-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause swarm' : 'Play swarm'}
          title={isPlaying ? 'Pause Swarm' : 'Resume Swarm'}
        >
          {isPlaying ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
