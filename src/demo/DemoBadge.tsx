import { isDemoMode } from './demoMode'
import { resetDemoStore } from './demoStore'

export function DemoBadge() {
  if (!isDemoMode()) return null

  function handleReset() {
    resetDemoStore()
    window.location.reload()
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 10,
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        fontSize: 12,
        color: '#e2e8f0',
      }}
    >
      <span
        style={{
          fontWeight: 800,
          letterSpacing: '0.06em',
          color: '#fbbf24',
          textTransform: 'uppercase',
        }}
      >
        Демо
      </span>
      <button
        type="button"
        onClick={handleReset}
        style={{
          padding: '4px 10px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.06)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        Сбросить данные
      </button>
    </div>
  )
}
