import { useEffect, useState } from 'react'

/**
 * Брендированная пилюля под notch / Dynamic Island — как у Т-банка.
 *
 * В нормальном режиме элемент физически скрыт за вырезом.
 * При свайпе вверх (многозадачность) вырез убирается и пилюля видна.
 *
 * Охват:
 *  iPhone 12 / 13 / 14 (notch, sat ≈ 44 px) — pill-ширина меньше ширины notch
 *  iPhone 14 Pro → 16 Pro Max (Dynamic Island, sat ≈ 59 px) — точные размеры DI
 *
 * Читаем env(safe-area-inset-top) через DOM-зонд — единственный
 * надёжный способ получить пиксели в JS (CSS var возвращает строку).
 */

interface IslandSize {
  w: number   // ширина пилюли, px
  h: number   // высота пилюли, px
}

function readSat(): number {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:1px;' +
    'height:env(safe-area-inset-top,0px);' +
    'visibility:hidden;pointer-events:none;z-index:-9999'
  document.body.appendChild(probe)
  const val = probe.getBoundingClientRect().height
  document.body.removeChild(probe)
  return val
}

function resolve(sat: number): IslandSize | null {
  const vw = window.innerWidth   // CSS points

  // ── Dynamic Island ───────────────────────────────────────────────
  // iPhone 14 Pro / 15 / 15 Pro / 16 / 16 Pro / 16 Pro Max: sat ≈ 59 px
  if (sat >= 50) {
    if (vw >= 440) return { w: 140, h: 37 }  // 16 Pro Max
    if (vw >= 430) return { w: 138, h: 37 }  // 15 Pro Max / 16 Plus
    if (vw >= 393) return { w: 133, h: 37 }  // 15 Pro / 16 Pro
    return            { w: 126, h: 34 }       // 14 Pro / 15 / 16
  }

  // ── Notch ────────────────────────────────────────────────────────
  // iPhone 12 / 12 Pro / 13 / 13 Pro / 14: sat ≈ 44 px
  // Пилюля у́же любого notch → всегда скрыта за ним в обычном режиме:
  //   iPhone 13 notch ≈ 162 px  →  наша пилюля ≤ 155 px  ✓
  //   iPhone 12 notch ≈ 210 px  →  наша пилюля ≤ 155 px  ✓
  if (sat >= 35) {
    if (vw >= 420) return { w: 155, h: 32 }  // Plus / Pro Max (428–430 pt)
    return            { w: 126, h: 32 }       // Standard (375–393 pt)
  }

  // Нет выреза — ничего не показываем
  return null
}

export function PwaSafeArea() {
  const [island, setIsland] = useState<IslandSize | null>(null)

  useEffect(() => {
    function update() {
      setIsland(resolve(readSat()))
    }

    // iOS PWA иногда раскрывает env() немного позже монтирования
    const t = setTimeout(update, 100)
    window.addEventListener('resize', update)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <>
      {island && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: island.w,
            height: island.h,
            // Верхние углы: 0 (сливается с краем экрана)
            // Нижние углы: округлые (повторяют форму notch / DI)
            borderRadius: `0 0 ${Math.round(island.h * 0.6)}px ${Math.round(island.h * 0.6)}px`,
            background: '#22C55E',
            zIndex: 99999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <span style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#0A0E17',
            fontFamily: "'Outfit', sans-serif",
            userSelect: 'none',
            lineHeight: 1,
          }}>
            BookinGo
          </span>
        </div>
      )}

      {/* Home indicator area — тонкий зелёный градиент */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'env(safe-area-inset-bottom, 0px)',
          background: 'linear-gradient(to top, rgba(34,197,94,0.15) 0%, transparent 100%)',
          zIndex: 99998,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
