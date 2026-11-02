import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatMoney } from '../../utils/partnerCrmFormat'
import { PARTNER_BOOKINGS_PATH } from '../../utils/partnerAccess'
import type { VenueEarningsRow } from '../../utils/partnerStats'

function CountLink({
  to,
  children,
  color,
}: {
  to: string
  children: ReactNode
  color: string
}) {
  return (
    <Link
      to={to}
      style={{
        color,
        fontWeight: 700,
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </Link>
  )
}

function formatAvg(avg: number | null): string {
  if (avg == null || !Number.isFinite(avg)) return '—'
  return formatMoney(Math.round(avg))
}

export function VenueEarningsTable({ rows }: { rows: VenueEarningsRow[] }) {
  if (rows.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
        Нет данных за выбранный период
      </p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#64748b' }}>
            <th style={{ padding: '10px 8px', fontWeight: 600 }}>Площадка</th>
            <th style={{ padding: '10px 8px', fontWeight: 600 }}>Оплачено</th>
            <th style={{ padding: '10px 8px', fontWeight: 600 }}>Отменено</th>
            <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'right' }}>Выручка</th>
            <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'right' }}>Средний чек</th>
            <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'right' }}>Просмотры</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const venueParam = r.venueId.startsWith('name:')
              ? ''
              : `&venueId=${encodeURIComponent(r.venueId)}`
            return (
              <tr
                key={r.venueId}
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <td style={{ padding: '12px 8px', color: '#e2e8f0', fontWeight: 600 }}>
                  {r.venueName}
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <CountLink
                    to={`${PARTNER_BOOKINGS_PATH}?status=paid${venueParam}`}
                    color="#86efac"
                  >
                    {r.paidCount}
                  </CountLink>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <CountLink
                    to={`${PARTNER_BOOKINGS_PATH}?status=cancelled${venueParam}`}
                    color="#fca5a5"
                  >
                    {r.cancelledCount}
                  </CountLink>
                </td>
                <td style={{ padding: '12px 8px', color: '#f1f5f9', fontWeight: 700, textAlign: 'right' }}>
                  {formatMoney(r.revenue)}
                </td>
                <td style={{ padding: '12px 8px', color: '#cbd5e1', fontWeight: 600, textAlign: 'right' }}>
                  {formatAvg(r.avgCheck)}
                </td>
                <td style={{ padding: '12px 8px', color: '#93c5fd', fontWeight: 700, textAlign: 'right' }}>
                  {r.views}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
