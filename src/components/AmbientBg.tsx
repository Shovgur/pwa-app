import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function MiniParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1 + 0.3,
      alpha: Math.random() * 0.2 + 0.05,
      color: ['#22c55e', '#3b82f6', '#f97316'][Math.floor(Math.random() * 3)],
      pulse: Math.random() * Math.PI * 2,
    }))

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.pulse += 0.006
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, '0')
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

export function AmbientBg() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <MiniParticles />
      <motion.div style={{ position: 'absolute', width: 700, height: 700, top: '-20%', right: '-15%', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 65%)', filter: 'blur(100px)', borderRadius: '50%' }}
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div style={{ position: 'absolute', width: 600, height: 600, bottom: '-15%', left: '-10%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', filter: 'blur(100px)', borderRadius: '50%' }}
        animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
    </div>
  )
}
