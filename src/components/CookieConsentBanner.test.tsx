import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CookieConsentBanner } from './CookieConsentBanner'
import { COOKIE_CONSENT_KEY, saveCookieConsent } from '../utils/metrika'

const TAG = 'https://mc.yandex.ru/metrika/tag.js?id=110228611'

function renderBanner() {
  return render(
    <MemoryRouter>
      <CookieConsentBanner />
    </MemoryRouter>,
  )
}

afterEach(() => {
  cleanup()
  localStorage.removeItem(COOKIE_CONSENT_KEY)
  document.querySelector(`script[src="${TAG}"]`)?.remove()
  delete (window as Window & { __bookingoMetrikaLoaded?: boolean }).__bookingoMetrikaLoaded
  delete window.ym
})

describe('CookieConsentBanner', () => {
  it('hides on a return visit and stays hidden for necessary-only', () => {
    saveCookieConsent(false)
    renderBanner()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.querySelector(`script[src="${TAG}"]`)).toBeNull()
  })

  it('loads metrika after accept and does not show the banner again', () => {
    renderBanner()
    fireEvent.click(screen.getByRole('button', { name: 'Принять все' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.querySelector(`script[src="${TAG}"]`)).not.toBeNull()
    const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? '{}') as { analytics?: boolean }
    expect(stored.analytics).toBe(true)

    cleanup()
    renderBanner()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('necessary-only does not load tag.js', () => {
    renderBanner()
    fireEvent.click(screen.getByRole('button', { name: 'Только необходимые' }))
    expect(document.querySelector(`script[src="${TAG}"]`)).toBeNull()
    const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? '{}') as {
      necessary?: boolean
      analytics?: boolean
    }
    expect(stored.necessary).toBe(true)
    expect(stored.analytics).toBe(false)
  })
})
