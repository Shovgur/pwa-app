import { useEffect, useState } from 'react'

/**
 * Брендированная пилюля под Dynamic Island / notch — как у Т-банка.
 *
 * В ОБЫЧНОМ РЕЖИМЕ: opacity: 0 — полностью невидима.
 * При СВАЙПЕ ВВЕРХ (app-switcher): visibilitychange / blur →
 *   opacity: 1 — зелёная пилюля "BookinGo" становится видна
 *   за долю секунды до полного перехода в многозадачность.
 *
 * Почему NOT position:fixed top:0 всегда видимая:
 *   DI и notch не начинаются с точного y=0 — над ними есть
 *   несколько px дисплея, куда вылезает наш элемент в normal mode.
 *   Единственный надёжный способ — показывать только в нужный момент.
 *
 * Размеры пилюли по моделям (CSS points, portrait):
 *   iPhone 12 mini / 13 mini  (375 pt, notch, sat≈47) → 112 × 33
 *   iPhone 12 / 12 Pro / 13 / 13 Pro / 14  (390 pt, notch) → 155 × 33
 *   iPhone 12 Pro Max / 13 Pro Max  (428 pt, notch) → 155 × 33
 *   iPhone 14 Plus  (430 pt, notch) → 155 × 33
 *   iPhone 14 Pro / 15 Pro / 16 Pro  (393 pt, DI, sat≈59) → 133 × 37
 *   iPhone 15 / 16  (390 pt, DI, sat≈59) → 126 × 34
 *   iPhone 14 Pro Max / 15 Plus / 16 Plus  (430 pt, DI) → 126–138 × 37
 *   iPhone 15 Pro Max  (430 pt, DI, tall) → 138 × 37
 *   iPhone 16 Pro Max  (440 pt, DI) → 140 × 37
 *   iPhone 17+ → fallback по тем же правилам
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

function resolve(sat: number): Pill | null {
  // Только Dynamic Island (iPhone 14 Pro → 16 Pro Max, 15/16 базовые)
  // sat ≈ 59 px; notch-iPhones и Android — не поддерживаем (sat < 55)
  if (sat < 55) return null

  const vw = window.innerWidth
  if (vw >= 440) return { w: 140, h: 37 }          // 16 Pro Max
  if (vw >= 428) {
    const tall = window.innerHeight >= 930
    return { w: tall ? 138 : 126, h: 37 }           // 15 Pro Max vs 14 Pro Max / 15 Plus / 16 Plus
  }
  if (vw >= 393) return { w: 133, h: 37 }           // 14 Pro / 15 Pro / 16 Pro
  return            { w: 126, h: 34 }                // 15 / 16 (390 pt)
}

export function PwaSafeArea() {
  const [pill, setPill]       = useState<Pill | null>(null)
  const [show, setShow]       = useState(false)  // видимость: только в момент свайпа

  // Определяем модель один раз после монтирования
  useEffect(() => {
    const t = setTimeout(() => setPill(resolve(readSat())), 120)
    const onResize = () => setPill(resolve(readSat()))
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize) }
  }, [])

  // Показываем пилюлю в нужные моменты
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>

    const reveal = () => { clearTimeout(hideTimer); setShow(true) }
    const conceal = () => { hideTimer = setTimeout(() => setShow(false), 350) }

    // ── 1. touchstart в нижней зоне экрана (home-indicator area) ──────────
    // Срабатывает в самом начале свайпа вверх — раньше любых system-событий.
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      const fromBottom = window.innerHeight - t.clientY
      // Касание в нижних ~50 px (зона home indicator + небольшой запас)
      if (fromBottom <= 50) reveal()
      else conceal()
    }

    // ── 2. Page Visibility / blur — страховка на случай быстрого свайпа ───
    const onVis = () => { if (document.hidden) reveal(); else conceal() }

    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchend',   conceal,  { passive: true })
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('blur',  reveal)
    window.addEventListener('focus', conceal)

    return () => {
      clearTimeout(hideTimer)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchend',   conceal)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('blur',  reveal)
      window.removeEventListener('focus', conceal)
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
            // Полная капсула: наши скругления > скруглений DI (~10 px)
            // → углы пилюли всегда внутри DI-вырезa, не вылезают в видимые зазоры
            borderRadius: pill.h,
            background: '#22C55E',
            zIndex: 99999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            opacity: show ? 1 : 0,
            transition: show
              ? 'opacity 0.03s linear'       // почти мгновенно при свайпе
              : 'opacity 0.35s ease 0.05s',  // плавно гаснет при возврате
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
          background: 'linear-gradient(to top, rgba(34,197,94,0.14) 0%, transparent 100%)',
          zIndex: 99998,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
