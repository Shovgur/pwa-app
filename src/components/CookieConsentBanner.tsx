import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadMetrikaIfAllowed, readCookieConsent, saveCookieConsent } from '../utils/metrika'

/** Нижний баннер. Закрывается только выбором и не блокирует прокрутку страницы. */
export function CookieConsentBanner() {
  const [open, setOpen] = useState(() => readCookieConsent() === null)

  useEffect(() => {
    loadMetrikaIfAllowed()
  }, [])

  function choose(analytics: boolean) {
    saveCookieConsent(analytics)
    if (analytics) loadMetrikaIfAllowed()
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="cookie-banner" role="dialog" aria-modal="false" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner-inner">
        <div>
          <p id="cookie-banner-title" className="cookie-banner-title">Файлы cookie</p>
          <p className="cookie-banner-text">
            Необходимые cookie нужны для входа и бронирования. Яндекс.Метрика включается только после согласия.{' '}
            <Link to="/legal/privacy#cookies">Политика, раздел Cookies</Link>
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button type="button" className="cookie-banner-btn" onClick={() => choose(false)}>
            Только необходимые
          </button>
          <button type="button" className="cookie-banner-btn cookie-banner-btn--primary" onClick={() => choose(true)}>
            Принять все
          </button>
        </div>
      </div>
    </div>
  )
}
