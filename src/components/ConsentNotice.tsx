import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONSENT_NOTICE_KEY } from '../utils/metrika'

function noticeAlreadyClosed(): boolean {
  try {
    return sessionStorage.getItem(CONSENT_NOTICE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Плашка согласия на обработку ПДн на первый заход во вкладке.
 * Тот же флаг читает index.html до ym init (вебвизор). Повторный ym init не вызывать.
 */
export function ConsentNotice() {
  const [open, setOpen] = useState(() => !noticeAlreadyClosed())
  if (!open) return null

  function accept() {
    try {
      sessionStorage.setItem(CONSENT_NOTICE_KEY, '1')
    } catch {
      /* вкладка без хранилища: прячем плашку до перезагрузки */
    }
    setOpen(false)
  }

  return (
    <div className="consent-notice" role="region" aria-label="Согласие на обработку персональных данных">
      <p>
        Продолжая пользоваться сайтом, вы соглашаетесь на обработку персональных данных.{' '}
        <Link to="/consent">Согласие</Link>
        {' · '}
        <Link to="/privacy">Политика</Link>
      </p>
      <button type="button" onClick={accept}>Понятно</button>
    </div>
  )
}
