import { Link } from 'react-router-dom'
import { SELLER } from '../../content/legal'
import { FOOTER_LEGAL_LINKS } from '../../content/legalDocs'

const FACTS = [
  SELLER.shortName,
  `ИНН ${SELLER.inn}`,
  `ОГРНИП ${SELLER.ogrnip}`,
] as const

/** Тихая строка продавца и одни и те же юридические ссылки на всех публичных экранах. */
export function SiteLegalBar({ anchored = false }: { anchored?: boolean }) {
  return (
    <div className={anchored ? 'site-legal site-legal--anchored' : 'site-legal'}>
      <div className="site-container">
        <nav className="site-legal-nav" aria-label="Юридические документы">
          {FOOTER_LEGAL_LINKS.map((item) => (
            <Link key={item.path} to={item.path} className="site-legal-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="site-legal-line">
          {FACTS.map((fact) => (
            <span key={fact}>{fact}</span>
          ))}
          <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
        </p>
      </div>
    </div>
  )
}
