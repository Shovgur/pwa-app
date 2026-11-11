import { AlertTriangle } from 'lucide-react'
import type { ClientRisk } from '../../lib/clientReviews'

interface ClientRiskBadgeProps {
  risk: ClientRisk | null | undefined
}

export function ClientRiskBadge({ risk }: ClientRiskBadgeProps) {
  if (!risk?.warning) return null
  const title = risk.networkWarning
    ? 'Уточните условия — в сети есть негативные оценки'
    : 'Есть негативные оценки этого клиента у вас'
  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 999,
        background: 'rgba(245,158,11,0.15)',
        border: '1px solid rgba(245,158,11,0.35)',
        color: '#fbbf24',
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      <AlertTriangle size={12} />
      Внимание
    </span>
  )
}
