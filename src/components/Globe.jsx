import { useEffect, useRef } from 'react'

export default function Globe() {
  const canvasRef = useRef()
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    function size(){
      canvas.width = canvas.clientWidth * devicePixelRatio
      canvas.height = canvas.clientHeight * devicePixelRatio
    }
    size()
    window.addEventListener('resize', size)

    const points = []
    const N = 60
    for(let i=0;i<N;i++){
      const phi = Math.acos(-1 + (2*i)/N)
      const theta = Math.sqrt(N * Math.PI) * phi
      points.push({phi, theta})
    }

    let rot = 0
    function draw(){
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0,0,w,h)
      const cx = w/2, cy = h/2
      const r = Math.min(w,h)*0.38

      ctx.strokeStyle = 'rgba(94,200,248,0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx,cy,r,0,Math.PI*2)
      ctx.stroke()

      const projected = points.map(p=>{
        const theta = p.theta + rot
        const x = r * Math.sin(p.phi) * Math.cos(theta)
        const y = r * Math.cos(p.phi)
        const z = r * Math.sin(p.phi) * Math.sin(theta)
        const scale = (z + r*1.5) / (r*2.5)
        return {x: cx + x, y: cy + y, z, scale}
      })

      projected.forEach(p=>{
        const alpha = 0.3 + p.scale*0.7
        ctx.fillStyle = `rgba(94,200,248,${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.6*devicePixelRatio*p.scale, 0, Math.PI*2)
        ctx.fill()
      })

      ctx.strokeStyle = 'rgba(94,200,248,0.12)'
      for(let i=0;i<projected.length;i++){
        for(let j=i+1;j<projected.length;j++){
          const dx = projected[i].x - projected[j].x
          const dy = projected[i].y - projected[j].y
          const d = Math.sqrt(dx*dx+dy*dy)
          if(d < r*0.35){
            ctx.beginPath()
            ctx.moveTo(projected[i].x, projected[i].y)
            ctx.lineTo(projected[j].x, projected[j].y)
            ctx.stroke()
          }
        }
      }

      rot += 0.0025
      requestAnimationFrame(draw)
    }
    const frame = requestAnimationFrame(draw)
    
    return () => {
      window.removeEventListener('resize', size)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} />
}
