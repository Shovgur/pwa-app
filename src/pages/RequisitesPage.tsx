import { SeoHead } from '../components/SeoHead'
import { SELLER } from '../content/legal'
import { colors } from '../theme/tokens'

const ROWS: { label: string; value: string }[] = [
  { label: 'Наименование', value: SELLER.legalName },
  { label: 'ФИО', value: SELLER.fullName },
  { label: 'ИНН', value: SELLER.inn },
  { label: 'ОГРНИП', value: SELLER.ogrnip },
  { label: 'Email', value: SELLER.email },
]

export function RequisitesPage() {
  return (
    <div className="site-container" style={{ paddingTop: 48, paddingBottom: 72, maxWidth: 760 }}>
      <SeoHead
        title="Реквизиты"
        description={`${SELLER.legalName}. ИНН ${SELLER.inn}, ОГРНИП ${SELLER.ogrnip}.`}
        path="/requisites"
      />
      <h1 style={{ margin: '0 0 8px', fontSize: 32, color: colors.text }}>Реквизиты</h1>
      <p style={{ margin: '0 0 28px', color: colors.text2, fontSize: 15, lineHeight: 1.5 }}>
        Продавец сервиса BookinGo — {SELLER.shortName}.
      </p>
      <dl
        style={{
          margin: 0,
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {ROWS.map((row, index) => (
          <div
            key={row.label}
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(140px, 220px) 1fr',
              gap: 12,
              padding: '14px 18px',
              borderTop: index === 0 ? 'none' : `1px solid ${colors.border}`,
            }}
          >
            <dt style={{ margin: 0, color: colors.muted, fontSize: 13 }}>{row.label}</dt>
            <dd style={{ margin: 0, color: colors.text, fontSize: 15, wordBreak: 'break-word' }}>
              {row.label === 'Email' ? (
                <a href={`mailto:${row.value}`} style={{ color: colors.green, textDecoration: 'none' }}>
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
