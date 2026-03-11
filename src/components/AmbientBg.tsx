import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#7c3aed', '#06b6d4', '#a855f7']

function MiniParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.3 + 0.05,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
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
        p.pulse += 0.008
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

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}

export function AmbientBg() {
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 0, pointerEvents: 'none', overflow: 'hidden',
      }}
    >
      <MiniParticles />

      {/* Орб 1 — фиолетовый, левый верх */}
      <motion.div
        style={{
          position: 'absolute', width: 600, height: 600,
          top: '-20%', left: '-15%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
        }}
        animate={{ scale: [1, 1.25, 1], x: [0, 40, 0], y: [0, -25, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Орб 2 — циан, правый низ */}
      <motion.div
        style={{
          position: 'absolute', width: 500, height: 500,
          bottom: '-15%', right: '-10%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
        }}
        animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Орб 3 — пинк, центр */}
      <motion.div
        style={{
          position: 'absolute', width: 350, height: 350,
          top: '35%', left: '45%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
          filter: 'blur(70px)',
          borderRadius: '50%',
        }}
        animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
    </div>
  )
}
