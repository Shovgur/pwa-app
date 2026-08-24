const STEPS = ['Время', 'Проверка', 'Оплата'] as const

export function BookingStepProgress({ current, compact }: { current: 0 | 1 | 2; compact?: boolean }) {
  const circle = compact ? 24 : 28
  const gap = compact ? 4 : 6
  const mb = compact ? 12 : 20
  const lineMb = compact ? 14 : 18

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: mb }}>
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap, minWidth: compact ? 48 : 56 }}>
              <div style={{
                width: circle,
                height: circle,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: compact ? 11 : 12,
                fontWeight: 700,
                background: done || active ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                border: `2px solid ${done || active ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                color: done || active ? '#22c55e' : '#64748b',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: compact ? 9 : 10,
                fontWeight: active ? 700 : 500,
                color: active ? '#f1f5f9' : '#64748b',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                margin: `0 6px ${lineMb}px`,
                borderRadius: 1,
                background: i < current ? '#22c55e' : 'rgba(255,255,255,0.08)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
