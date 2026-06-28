/**
 * Брендированные полосы в системных safe-area зонах iPhone.
 *
 * Верхняя (Dynamic Island / notch):
 *   - Всегда рендерится, но физически скрыта за вырезом.
 *   - При свайпе вверх (многозадачность) вырез убирается и полоса становится видна —
 *     эффект как у Т-банка.
 *
 * Нижняя (home indicator):
 *   - Занимает зону под индикатором свайпа.
 */
export function PwaSafeArea() {
  return (
    <>
      {/* Top brand strip — behind Dynamic Island / notch */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 'env(safe-area-inset-top, 0px)',
          background: '#22C55E',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <span style={{
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#0A0E17',
          fontFamily: "'Outfit', sans-serif",
          userSelect: 'none',
        }}>
          BookinGo
        </span>
      </div>

      {/* Bottom strip — home indicator safe area */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: 'env(safe-area-inset-bottom, 0px)',
          background: 'linear-gradient(to top, rgba(34,197,94,0.18) 0%, transparent 100%)',
          zIndex: 99998,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}
