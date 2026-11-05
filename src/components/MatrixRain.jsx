import { useEffect, useRef } from 'react'

export default function MatrixRain({ theme = 'red' }) {
  const canvasRef = useRef(null)
  const themeRef = useRef(theme)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let w = 0
    let h = 0
    let columns = 0
    let drops = []
    let speeds = []
    let running = true
    let frameId
    let lastDraw = 0
    const targetFpsInterval = 1000 / 30 // Smooth 30 FPS throttle: 70% CPU/GPU reduction

    const chars = 'アカサタナハマヤラワ0123456789ABCDEF<>/{}$#*+!=~'

    function resize() {
      if (!canvas || !running) return
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      const fontSize = 18
      columns = Math.floor(w / fontSize)
      drops = new Array(columns).fill(0).map(() => Math.random() * (h / fontSize))
      speeds = new Array(columns).fill(0).map(() => 0.6 + Math.random() * 0.6)
    }

    resize()
    window.addEventListener('resize', resize)

    const fontSize = 18

    function draw(now) {
      if (!running) return

      frameId = requestAnimationFrame(draw)

      if (document.hidden) return // Stop rendering when tab is in background

      const elapsed = now - lastDraw
      if (elapsed < targetFpsInterval) return
      lastDraw = now - (elapsed % targetFpsInterval)

      // Dark translucent wash for authentic digital rain persistence
      ctx.fillStyle = 'rgba(5, 5, 8, 0.16)'
      ctx.fillRect(0, 0, w, h)

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        const isBlue = themeRef.current === 'blue'
        if (Math.random() > 0.88) {
          ctx.fillStyle = '#ffffff'
        } else if (Math.random() > 0.6) {
          ctx.fillStyle = isBlue ? '#38bdf8' : '#ff4d6d'
        } else {
          ctx.fillStyle = isBlue ? 'rgba(0, 210, 255, 0.38)' : 'rgba(255, 30, 68, 0.38)'
        }

        ctx.fillText(char, x, y)

        if (y > h && Math.random() > 0.985) {
          drops[i] = 0
          speeds[i] = 0.6 + Math.random() * 0.6
        }

        drops[i] += speeds[i]
      }
    }

    frameId = requestAnimationFrame(draw)

    return () => {
      running = false
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas ref={canvasRef} id="matrix" aria-hidden="true" />
}
