/**
 * Тонкий зелёный градиент в зоне home indicator (нижняя safe area).
 * Пилюля за Dynamic Island удалена — корректная реализация требует
 * нативного Live Activities API, недоступного в PWA.
 */
export function PwaSafeArea() {
  return (
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
  )
}
