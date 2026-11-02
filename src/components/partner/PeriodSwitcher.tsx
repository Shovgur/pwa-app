import type { StatsPeriod } from '../../utils/partnerStats'
import { STATS_PERIOD_OPTIONS } from '../../utils/partnerStats'

export function PeriodSwitcher({
  value,
  onChange,
}: {
  value: StatsPeriod
  onChange: (p: StatsPeriod) => void
}) {
  return (
    <div
      role="group"
      aria-label="Период"
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        borderRadius: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
      }}
    >
      {STATS_PERIOD_OPTIONS.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 700,
              background: active ? 'rgba(34,197,94,0.2)' : 'transparent',
              color: active ? '#86efac' : '#94a3b8',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
