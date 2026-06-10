import { useEffect, useRef } from 'react'

const COLORS = ['#22C55E', '#3B82F6', '#F97316', '#A855F7']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  alpha: number
  color: string
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animId = 0
    let alive = true
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const particles: Particle[] = []

    function resize() {
      if (!canvas || !ctx) return
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    function seed() {
      particles.length = 0
      const n = reduced ? 18 : 38
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * (reduced ? 0.06 : 0.22),
          vy: (Math.random() - 0.5) * (reduced ? 0.06 : 0.22),
          r: Math.random() * 1.4 + 0.6,
          alpha: Math.random() * 0.35 + 0.15,
          color: COLORS[i % COLORS.length],
        })
      }
    }

    resize()
    seed()
    const onResize = () => { resize(); seed() }
    window.addEventListener('resize', onResize)

    function frame() {
      if (!alive || !ctx || !canvas) return
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()

        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0
      }

      animId = requestAnimationFrame(frame)
    }

    frame()
    return () => {
      alive = false
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="site-ambient-canvas" aria-hidden />
}

export function SiteAmbientBg() {
  return (
    <div className="site-ambient" aria-hidden>
      <div className="site-ambient-mesh" />
      <div className="site-ambient-orb site-ambient-orb--green" />
      <div className="site-ambient-orb site-ambient-orb--blue" />
      <div className="site-ambient-orb site-ambient-orb--orange" />
      <ParticleCanvas />
    </div>
  )
}
