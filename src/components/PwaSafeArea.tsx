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
  const vw = window.innerWidth

  // Dynamic Island: iPhone 14 Pro → 16 Pro Max, 15/16 базовые (sat ≥ 55 px)
  if (sat >= 55) {
    if (vw >= 440) return { w: 140, h: 37 }           // 16 Pro Max
    if (vw >= 428) {
      const tall = window.innerHeight >= 930
      return { w: tall ? 138 : 126, h: 37 }            // 15 Pro Max vs 14 Pro Max / 15 Plus / 16 Plus
    }
    if (vw >= 393) return { w: 133, h: 37 }            // 14 Pro / 15 Pro / 16 Pro
    return            { w: 126, h: 34 }                 // 15 / 16 (390 pt)
  }

  // Notch: iPhone 12 mini / 13 mini / 12 / 12 Pro / 13 / 14 / 14 Plus (sat 35–54 px)
  if (sat >= 35) {
    if (vw <= 380) return { w: 112, h: 33 }            // mini (375 pt)
    return            { w: 155, h: 33 }                 // всё остальное notch
  }

  return null // нет выреза
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

  // Показываем только в момент свайпа / перехода в app-switcher
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>

    // App уходит в фон или app-switcher
    const onHide = () => {
      clearTimeout(hideTimer)
      setShow(true)
    }

    // App возвращается на передний план
    const onShow = () => {
      // небольшая задержка: если пользователь вернулся сразу — плавно гасим
      hideTimer = setTimeout(() => setShow(false), 400)
    }

    // Page Visibility API (срабатывает при уходе в background / app-switcher)
    const onVis = () => {
      if (document.hidden) onHide()
      else onShow()
    }

    // window blur/focus — дополнительная страховка
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('blur', onHide)
    window.addEventListener('focus', onShow)

    return () => {
      clearTimeout(hideTimer)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('blur', onHide)
      window.removeEventListener('focus', onShow)
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
            borderRadius: `0 0 ${Math.round(pill.h * 0.62)}px ${Math.round(pill.h * 0.62)}px`,
            background: '#22C55E',
            zIndex: 99999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            // Ключевое: только при свайпе opacity: 1
            opacity: show ? 1 : 0,
            transition: show
              ? 'opacity 0.08s ease'        // быстро появляется
              : 'opacity 0.4s ease 0.1s',   // плавно исчезает при возврате
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
