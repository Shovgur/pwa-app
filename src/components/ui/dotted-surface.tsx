import { cn } from '@/lib/utils'
import { useEffect, useRef, type ComponentProps } from 'react'
import * as THREE from 'three'

type DottedSurfaceProps = Omit<ComponentProps<'div'>, 'ref'>

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const SEPARATION = 150
    const AMOUNTX = 40
    const AMOUNTY = 60

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0a0e17, 2000, 10000)

    const camera = new THREE.PerspectiveCamera(60, 1, 1, 10000)
    camera.position.set(0, 355, 1220)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x0a0e17, 0)

    const canvas = renderer.domElement
    canvas.className = 'site-dotted-canvas'
    container.appendChild(canvas)

    const positions: number[] = []
    const colors: number[] = []

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
        positions.push(x, 0, z)
        // THREE expects 0–1; soft light dots on dark bg
        colors.push(0.55, 0.62, 0.7)
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true,
    })

    scene.add(new THREE.Points(geometry, material))

    let count = 0
    let animationId = 0

    function resize() {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    function animate() {
      animationId = requestAnimationFrame(animate)

      if (!reduced) {
        const positionAttribute = geometry.attributes.position
        const arr = positionAttribute.array as Float32Array
        let i = 0
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
            const index = i * 3
            arr[index + 1] =
              Math.sin((ix + count) * 0.3) * 50 +
              Math.sin((iy + count) * 0.5) * 50
            i++
          }
        }
        positionAttribute.needsUpdate = true
        count += 0.1
      }

      renderer.render(scene, camera)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (canvas.parentElement === container) {
        container.removeChild(canvas)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn('site-dotted-surface pointer-events-none', className)}
      aria-hidden
      {...props}
    />
  )
}
