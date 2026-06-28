import { useEffect, useState } from 'react'

/**
 * Брендированная пилюля под Dynamic Island (как у Т-банка).
 *
 * Принцип:
 *  - Элемент рендерится в position:fixed; top:0 — физически скрыт
 *    за Dynamic Island в нормальном режиме.
 *  - При свайпе вверх (многозадачность) вырез убирается
 *    и пилюля становится видна.
 *
 * ВАЖНО: читаем env(safe-area-inset-top) через DOM-зонд — это
 * единственный надёжный способ получить пиксельное значение в JS.
 *
 * Dynamic Island по моделям (CSS points):
 *  14 Pro / 15 / 16 (390pt)   → 126 × 34
 *  15 Pro / 16 Pro (393pt)     → 133 × 37
 *  14 Pro Max / 15 Plus (430pt)→ 126 × 34
 *  15 Pro Max (430pt, sat≥59)  → 138 × 37
 *  16 Pro Max (440pt)          → 140 × 37
 *
 * Notch-iPhones (sat≈44px) и без выреза (sat<20px) → пилюля скрыта.
 */

interface IslandSize { w: number; h: number }

/** Измеряем env(safe-area-inset-top) через временный DOM-элемент */
function readSafeAreaTop(): number {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:1px;' +
    'height:env(safe-area-inset-top,0px);' +
    'visibility:hidden;pointer-events:none;z-index:-1'
  document.body.appendChild(probe)
  const sat = probe.getBoundingClientRect().height
  document.body.removeChild(probe)
  return sat
}

function getIslandSize(sat: number): IslandSize | null {
  // Dynamic Island iPhones: safe-area-inset-top ≥ 50 px
  // Notch iPhones: ~44 px | без выреза: 0–20 px
  if (sat < 50) return null

  const vw = window.innerWidth
  if (vw >= 440) return { w: 140, h: 37 }  // iPhone 16 Pro Max
  if (vw >= 430) return { w: 138, h: 37 }  // 15 Pro Max / 16 Plus
  if (vw >= 393) return { w: 133, h: 37 }  // 15 Pro / 16 Pro
  return { w: 126, h: 34 }                  // 14 Pro / 15 / 16
}

export function PwaSafeArea() {
  const [island, setIsland] = useState<IslandSize | null>(null)

  useEffect(() => {
    function update() {
      const sat = readSafeAreaTop()
      setIsland(getIslandSize(sat))
    }

    // Небольшая задержка — iOS PWA иногда раскрывает env() чуть позже
    const t = setTimeout(update, 80)
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
            borderRadius: `0 0 ${Math.round(island.h * 0.65)}px ${Math.round(island.h * 0.65)}px`,
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

      {/* Home indicator zone — subtle brand gradient */}
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
