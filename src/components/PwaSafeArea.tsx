import { useEffect, useState } from 'react'

/**
 * Брендированная пилюля точно под Dynamic Island iPhone.
 *
 * Принцип (как у Т-банка):
 *  - Элемент рендерится в `position:fixed; top:0` — физически скрыт
 *    за Dynamic Island в нормальном режиме.
 *  - При свайпе вверх (многозадачность/закрытие) вырез убирается
 *    и пилюля становится видна как брендированный элемент.
 *
 * Размеры Dynamic Island по моделям iPhone (CSS px = точки):
 *  iPhone 14 Pro / 15 / 15 Pro (390pt):  126 × 34
 *  iPhone 15 Pro / 16 Pro (393pt):        133 × 37
 *  iPhone 14 Pro Max / 15 Plus (430pt):   126 × 34
 *  iPhone 15 Pro Max (430pt, sat≈59):     138 × 37
 *  iPhone 16 Pro Max (440pt):             140 × 37
 *
 * Определяем модель по ширине вьюпорта + safe-area-inset-top.
 */

interface IslandSize { w: number; h: number }

function detectIsland(): IslandSize | null {
  // Читаем CSS-переменную --sat (= env(safe-area-inset-top)) заданную в :root
  const satStr = getComputedStyle(document.documentElement)
    .getPropertyValue('--sat').trim()
  const sat = parseFloat(satStr) || 0

  // Dynamic Island iPhones: safe-area-inset-top ≥ 50px
  // Обычный notch: ~44px  |  Нет выреза: 0-20px
  if (sat < 50) return null

  const vw = window.innerWidth // CSS пиксели (points)

  if (vw >= 440) return { w: 140, h: 37 }  // iPhone 16 Pro Max
  if (vw >= 430) return { w: 138, h: 37 }  // 15 Pro Max / 16 Plus
  if (vw >= 393) return { w: 133, h: 37 }  // 15 Pro / 16 Pro
  return { w: 126, h: 34 }                  // 14 Pro / 15 / 15 Plus / 16
}

export function PwaSafeArea() {
  const [island, setIsland] = useState<IslandSize | null>(null)

  useEffect(() => {
    // После монтирования CSS-переменные уже разрешены
    setIsland(detectIsland())

    const onResize = () => setIsland(detectIsland())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <>
      {/* Dynamic Island brand pill — visible only during multitasking swipe */}
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
            /* Округление снизу повторяет форму Dynamic Island */
            borderRadius: `0 0 ${island.h * 0.65}px ${island.h * 0.65}px`,
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
            fontSize: 8.5,
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

      {/* Bottom strip — home indicator safe area (subtle brand gradient) */}
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
