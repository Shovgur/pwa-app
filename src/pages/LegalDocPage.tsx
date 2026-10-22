import { Navigate, useLocation } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import { LEGAL_DOCS, LEGAL_REVISION } from '../content/legalDocs'
import { SELLER } from '../content/legal'
import { colors } from '../theme/tokens'

export function LegalDocPage() {
  const { pathname } = useLocation()
  const doc = LEGAL_DOCS.find((item) => item.path === pathname)
  if (!doc) return <Navigate to="/" replace />

  return (
    <div className="site-container" style={{ paddingTop: 48, paddingBottom: 72, maxWidth: 760 }}>
      <SeoHead title={doc.title} description={doc.description} path={doc.path} />
      <p style={{ margin: '0 0 12px', color: colors.green, fontSize: 13, fontWeight: 700 }}>
        Черновик. Текст заменяет владелец.
      </p>
      <h1 style={{ margin: '0 0 8px', fontSize: 32, color: colors.text }}>{doc.title}</h1>
      <p style={{ margin: '0 0 16px', color: colors.text2, fontSize: 15, lineHeight: 1.5 }}>
        Редакция {LEGAL_REVISION}
      </p>
      <p style={{ margin: '0 0 28px', color: colors.text, fontSize: 15, lineHeight: 1.6 }}>
        {SELLER.legalName}. ИНН {SELLER.inn}. ОГРНИП {SELLER.ogrnip}.{' '}
        <a href={`mailto:${SELLER.email}`} style={{ color: colors.green }}>{SELLER.email}</a>
      </p>
      {doc.sections.map((section) => (
        <section key={section.title} style={{ marginBottom: 22 }}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, color: colors.text }}>{section.title}</h2>
          <p style={{ margin: 0, color: colors.text2, fontSize: 15, lineHeight: 1.6 }}>{section.body}</p>
        </section>
      ))}
    </div>
  )
}
