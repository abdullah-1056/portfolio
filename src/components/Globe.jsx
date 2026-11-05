import { useEffect, useRef } from 'react'

export default function Globe({ theme = 'red' }) {
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
    let running = true
    let isVisible = true
    let frameId
    let lastDraw = 0
    const targetFpsInterval = 1000 / 35 // 35 FPS throttle for smooth holographic rotation

    // Observe visibility so we consume 0% CPU when scrolled away!
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    }, { threshold: 0.05 })
    observer.observe(canvas)

    function size() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = canvas.width = (canvas.clientWidth || 300) * dpr
      h = canvas.height = (canvas.clientHeight || 300) * dpr
    }
    size()
    window.addEventListener('resize', size)

    // Fibonacci sphere algorithm - 52 points for sharp holographic look with minimal math
    const points = []
    const N = 52
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(-1 + (2 * i) / N)
      const theta = Math.sqrt(N * Math.PI) * phi
      points.push({ phi, theta })
    }

    let rot = 0

    function draw(now) {
      if (!running) return

      frameId = requestAnimationFrame(draw)

      // Skip draw if offscreen or hidden
      if (!isVisible || document.hidden) return

      const elapsed = now - lastDraw
      if (elapsed < targetFpsInterval) return
      lastDraw = now - (elapsed % targetFpsInterval)

      ctx.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      const r = Math.min(w, h) * 0.38
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

      const isBlue = themeRef.current === 'blue'
      const rgb = isBlue ? '0, 210, 255' : '255, 30, 68'
      const ringRgb = isBlue ? '56, 189, 248' : '255, 50, 80'
      const dotAltRgb = isBlue ? '56, 189, 248' : '255, 45, 80'

      // Center holographic core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      coreGrad.addColorStop(0, `rgba(${rgb}, 0.08)`)
      coreGrad.addColorStop(0.7, `rgba(${rgb}, 0.02)`)
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = coreGrad
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      // Outer boundary sphere ring
      ctx.strokeStyle = `rgba(${rgb}, 0.28)`
      ctx.lineWidth = 1 * dpr
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()

      // Tilted tactical cyber orbit ring
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(0.35)
      ctx.strokeStyle = `rgba(${ringRgb}, 0.2)`
      ctx.setLineDash([4 * dpr, 6 * dpr])
      ctx.beginPath()
      ctx.ellipse(0, 0, r * 1.18, r * 0.38, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()

      // Project 3D points
      const projected = points.map(p => {
        const theta = p.theta + rot
        const x = r * Math.sin(p.phi) * Math.cos(theta)
        const y = r * Math.cos(p.phi)
        const z = r * Math.sin(p.phi) * Math.sin(theta)
        const scale = (z + r * 1.5) / (r * 2.5)
        return { x: cx + x, y: cy + y, z, scale }
      })

      // Draw connecting holographic mesh lines
      ctx.lineWidth = 0.8 * dpr
      const maxDist = r * 0.38
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x
          const dy = projected[i].y - projected[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < maxDist) {
            const avgZ = (projected[i].z + projected[j].z) / (2 * r)
            const lineAlpha = Math.max(0.04, 0.16 + avgZ * 0.14)
            ctx.strokeStyle = `rgba(${rgb}, ${lineAlpha})`
            ctx.beginPath()
            ctx.moveTo(projected[i].x, projected[i].y)
            ctx.lineTo(projected[j].x, projected[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw points with depth-based sizing
      projected.forEach(p => {
        const isFront = p.z > 0
        const alpha = Math.max(0.18, 0.3 + p.scale * 0.7)
        const radius = Math.max(1, 1.8 * dpr * p.scale)

        if (isFront && p.scale > 0.75) {
          ctx.fillStyle = `rgba(${rgb}, 0.35)`
          ctx.beginPath()
          ctx.arc(p.x, p.y, radius * 1.8, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = `rgba(${dotAltRgb}, ${alpha})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      rot += 0.003
    }

    frameId = requestAnimationFrame(draw)

    return () => {
      running = false
      observer.disconnect()
      window.removeEventListener('resize', size)
      cancelAnimationFrame(frameId)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}
