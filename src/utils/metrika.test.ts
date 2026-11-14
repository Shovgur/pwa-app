import { afterEach, describe, expect, it } from 'vitest'
import {
  COOKIE_CONSENT_KEY,
  hasAnalyticsConsent,
  loadMetrikaIfAllowed,
  saveCookieConsent,
} from './metrika'

const TAG = 'https://mc.yandex.ru/metrika/tag.js?id=110228611'

function tag() {
  return document.querySelector(`script[src="${TAG}"]`)
}

afterEach(() => {
  localStorage.removeItem(COOKIE_CONSENT_KEY)
  tag()?.remove()
  delete (window as Window & { __bookingoMetrikaLoaded?: boolean }).__bookingoMetrikaLoaded
  delete window.ym
})

describe('loadMetrikaIfAllowed', () => {
  it('does not insert tag.js without consent', () => {
    loadMetrikaIfAllowed()
    expect(hasAnalyticsConsent()).toBe(false)
    expect(tag()).toBeNull()
    expect(window.ym).toBeUndefined()
  })

  it('does not insert tag.js for necessary-only', () => {
    saveCookieConsent(false)
    loadMetrikaIfAllowed()
    expect(tag()).toBeNull()
  })

  it('calls ym init after accept', () => {
    saveCookieConsent(true)
    loadMetrikaIfAllowed()
    expect(tag()).not.toBeNull()
    const queued = (window.ym as { a?: unknown[][] } | undefined)?.a ?? []
    const init = queued.some((args) => args[1] === 'init')
    expect(init).toBe(true)
  })
})
