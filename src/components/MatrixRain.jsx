import { useEffect, useRef } from 'react'

export default function MatrixRain() {
  const canvasRef = useRef()
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w, h, columns, drops
    const chars = "アカサタナハマヤラワ0123456789"

    function resize(){
      w = canvas.width = window.innerWidth
      h = canvas.height = document.documentElement.scrollHeight
      columns = Math.floor(w / 18)
      drops = new Array(columns).fill(0).map(()=> Math.random() * h/18)
    }
    resize()
    window.addEventListener('resize', resize)

    function draw(){
      ctx.fillStyle = 'rgba(10,10,10,0.08)'
      ctx.fillRect(0,0,w,h)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '14px monospace'
      for(let i=0;i<drops.length;i++){
        const text = chars[Math.floor(Math.random()*chars.length)]
        ctx.fillText(text, i*18, drops[i]*18)
        if(drops[i]*18 > h && Math.random() > 0.975){
          drops[i] = 0
        }
        drops[i]++
      }
      requestAnimationFrame(draw)
    }
    const frame = requestAnimationFrame(draw)
    
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} id="matrix" />
}
