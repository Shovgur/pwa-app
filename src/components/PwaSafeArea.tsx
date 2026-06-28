import { useEffect, useState } from 'react'

/**
 * Брендированная пилюля точно под notch / Dynamic Island на iPhone.
 *
 * В нормальном режиме элемент физически скрыт за вырезом.
 * При свайпе вверх (многозадачность) вырез убирается — пилюля видна.
 *
 * Идентификация устройства:
 *  • safe-area-inset-top (sat) читается через DOM-зонд (в JS нельзя
 *    получить env() через getComputedStyle — возвращает строку)
 *  • sat ≥ 55 px  → Dynamic Island (iPhone 14 Pro → 16 Pro Max, 15/16 базовые)
 *  • sat 35–54 px → Notch (iPhone 12, 12 mini, 13, 13 mini, 14, 14 Plus)
 *  • sat < 35 px  → нет выреза, элемент не рендерится
 *  • Модель уточняется по window.innerWidth (CSS points, portrait)
 *
 * Ширина пилюли всегда ≤ ширины notch → в обычном режиме скрыта.
 */

interface Pill { w: number; h: number }

function readSat(): number {
  const d = document.createElement('div')
  d.style.cssText =
    'position:fixed;top:0;left:0;width:1px;' +
    'height:env(safe-area-inset-top,0px);' +
    'visibility:hidden;pointer-events:none;z-index:-9999'
  document.body.appendChild(d)
  const v = d.getBoundingClientRect().height
  document.body.removeChild(d)
  return v
}

/**
 * Полная карта по моделям (CSS points, portrait orientation):
 *
 * ── Dynamic Island ──────────────────────────────────────────────────
 * iPhone 15 / 16           390 pt   DI ≈ 126 × 34
 * iPhone 14 Pro            393 pt   DI ≈ 126 × 37
 * iPhone 15 Pro / 16 Pro   393 pt   DI ≈ 133 × 37
 * iPhone 14 Pro Max        430 pt   DI ≈ 126 × 37
 * iPhone 15 Plus / 16 Plus 430 pt   DI ≈ 126 × 37
 * iPhone 15 Pro Max        430 pt   DI ≈ 138 × 37
 * iPhone 16 Pro Max        440 pt   DI ≈ 140 × 37
 * iPhone 17 / 17 Pro (est) 390/393  same rules as 15/16 gen
 * iPhone 17 Pro Max (est)  440+     fallback → 140 × 37
 *
 * ── Notch ───────────────────────────────────────────────────────────
 * iPhone 12 mini / 13 mini  375 pt  notch min ≈ 119 pt → pill 112 × 33
 * iPhone 12 / 12 Pro        390 pt  notch ≈ 209 pt     → pill 155 × 33
 * iPhone 13 / 13 Pro        390 pt  notch ≈ 162 pt     → pill 155 × 33
 * iPhone 14                 390 pt  notch ≈ 198 pt     → pill 155 × 33
 * iPhone 12 Pro Max         428 pt  notch ≈ 234 pt     → pill 155 × 33
 * iPhone 13 Pro Max         428 pt  notch ≈ 162 pt     → pill 155 × 33
 * iPhone 14 Plus            430 pt  notch ≈ 198 pt     → pill 155 × 33
 * (пилюля всегда у́же notch → не вылезает)
 */
function resolve(sat: number): Pill | null {
  const vw = window.innerWidth

  // ── Dynamic Island ─────────────────────────────────────────────────
  if (sat >= 55) {
    // iPhone 16 Pro Max (≥440 pt)
    if (vw >= 440) return { w: 140, h: 37 }
    // iPhone 15 Pro Max / 14 Pro Max / 15 Plus / 16 Plus (430 pt)
    // 15 Pro Max DI чуть шире — определяем по высоте экрана:
    if (vw >= 428) {
      const vh = window.innerHeight
      // 15 Pro Max: 932pt;  14 Pro Max / 15 Plus / 16 Plus: 844–932 pt
      // Все имеют схожий DI, берём безопасный максимум
      return vh >= 930 ? { w: 138, h: 37 } : { w: 126, h: 37 }
    }
    // iPhone 14 Pro / 15 Pro / 16 Pro (393 pt)
    if (vw >= 393) return { w: 133, h: 37 }
    // iPhone 15 / 16 / 17 базовые (390 pt) и будущие ≤ 392 pt
    return { w: 126, h: 34 }
  }

  // ── Notch ──────────────────────────────────────────────────────────
  if (sat >= 35) {
    // Mini (375 pt): 12 mini (notch 162 pt) / 13 mini (notch 119 pt)
    // Берём наименьший notch (119) → pill 112 pt
    if (vw <= 380) return { w: 112, h: 33 }
    // Все остальные notch-модели (390–430 pt):
    // Наименьший notch среди них — iPhone 13/13 Pro ≈ 162 pt
    // → pill 155 pt (безопасно для всех notch-моделей)
    return { w: 155, h: 33 }
  }

  // Нет выреза (SE, старые iPhone, Android)
  return null
}

export function PwaSafeArea() {
  const [pill, setPill] = useState<Pill | null>(null)

  useEffect(() => {
    function update() {
      setPill(resolve(readSat()))
    }
    // iOS PWA иногда раскрывает env() чуть позже монтирования
    const t = setTimeout(update, 100)
    window.addEventListener('resize', update)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <>
      {pill && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: pill.w,
            height: pill.h,
            // Верхние углы — 0 (край экрана), нижние — скруглённые
            borderRadius: `0 0 ${Math.round(pill.h * 0.62)}px ${Math.round(pill.h * 0.62)}px`,
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

      {/* Home indicator zone */}
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
