import { Link, Navigate, useParams } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import { LEGAL_EDITION } from '../content/legal'
import { getLegalDocument } from '../content/legal/catalog'
import { colors } from '../theme/tokens'

export function LegalDocumentPage() {
  const { slug } = useParams()
  const doc = slug ? getLegalDocument(slug) : undefined

  if (!doc) {
    return <Navigate to="/requisites" replace />
  }

  return (
    <div className="site-container" style={{ paddingTop: 48, paddingBottom: 72, maxWidth: 760 }}>
      <SeoHead title={doc.title} description={doc.description} path={`/legal/${doc.slug}`} />

      <p style={{ margin: '0 0 12px' }}>
        <Link to="/requisites" style={{ color: colors.muted, fontSize: 13, textDecoration: 'none' }}>
          ← Реквизиты и документы
        </Link>
      </p>

      <h1 style={{ margin: '0 0 8px', fontSize: 32, color: colors.text, lineHeight: 1.2 }}>
        {doc.title}
      </h1>
      <p style={{ margin: '0 0 12px', color: colors.text2, fontSize: 15, lineHeight: 1.5 }}>
        {doc.description}
      </p>
      <p style={{ margin: '0 0 28px', color: colors.muted, fontSize: 13, lineHeight: 1.45 }}>
        Редакция от {LEGAL_EDITION.dateLabel}
      </p>

      <article
        style={{
          background: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: 16,
          padding: '24px 22px',
        }}
      >
        {doc.sections.map((section, index) => (
          <section
            key={section.heading ?? `s-${index}`}
            id={section.anchor}
            style={{ marginBottom: index === doc.sections.length - 1 ? 0 : 28 }}
          >
            {section.heading && (
              <h2 style={{ margin: '0 0 12px', fontSize: 18, color: colors.text, fontWeight: 700 }}>
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((paragraph, pIndex) => (
              <p
                key={`${index}-${pIndex}`}
                style={{ margin: '0 0 12px', color: colors.text2, fontSize: 14.5, lineHeight: 1.65 }}
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  )
}
