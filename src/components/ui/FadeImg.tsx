import { useRef, useState, useEffect, type CSSProperties } from 'react'

interface FadeImgProps {
  src: string
  alt: string
  style?: CSSProperties
  onError?: () => void
}

const isAnimatedGif = (src: string) => /\.gif(\?|$)/i.test(src)

/**
 * Image that always fades in smoothly — handles both fresh loads and cached images.
 * Animated GIFs are frozen to their first frame via canvas, so every pool photo
 * behaves the same way regardless of how the source file itself is animated
 * (partner GIFs cycle through internal frames at inconsistent speeds).
 */
export function FadeImg({ src, alt, style, onError }: FadeImgProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const gif = isAnimatedGif(src)

  useEffect(() => {
    setVisible(false)
    setFrozen(false)

    if (!gif) {
      const img = imgRef.current
      if (img && img.complete && img.naturalWidth > 0) {
        requestAnimationFrame(() => setVisible(true))
      }
      return
    }

    // Draw the first frame onto a canvas so the GIF's built-in animation
    // (which cycles through multiple photos at speeds we can't control) never plays.
    let cancelled = false
    const loader = new Image()
    loader.onload = () => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = loader.naturalWidth
      canvas.height = loader.naturalHeight
      const ctx = canvas.getContext('2d')
      try {
        ctx?.drawImage(loader, 0, 0)
        setFrozen(true)
      } catch {
        // Extremely defensive: drawing doesn't require CORS, only pixel readback does,
        // but fall back to a plain (animated) img if the canvas draw ever fails.
        setFrozen(false)
      }
      requestAnimationFrame(() => setVisible(true))
    }
    loader.onerror = () => onError?.()
    loader.src = src

    return () => {
      cancelled = true
    }
  }, [src, gif])

  const commonStyle: CSSProperties = {
    ...style,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.55s ease',
  }

  if (gif) {
    return (
      <>
        <canvas
          ref={canvasRef}
          style={{ ...commonStyle, display: frozen ? 'block' : 'none' }}
        />
        {!frozen && (
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            style={commonStyle}
            onLoad={() => setVisible(true)}
            onError={() => {
              if (imgRef.current) imgRef.current.style.display = 'none'
              onError?.()
            }}
          />
        )}
      </>
    )
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      style={commonStyle}
      onLoad={() => setVisible(true)}
      onError={() => {
        if (imgRef.current) imgRef.current.style.display = 'none'
        onError?.()
      }}
    />
  )
}
