import { SELLER } from '../../content/legal'

const FACTS = [
  SELLER.shortName,
  `ИНН ${SELLER.inn}`,
  `ОГРНИП ${SELLER.ogrnip}`,
] as const

/** Тихая строка продавца внизу публичных страниц. В кабинет не ставится. */
export function SiteLegalBar({ anchored = false }: { anchored?: boolean }) {
  return (
    <div className={anchored ? 'site-legal site-legal--anchored' : 'site-legal'}>
      <div className="site-container">
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
