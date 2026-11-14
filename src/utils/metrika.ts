/** Yandex Metrika counter ID. The tag loads only after analytics consent. */
export const METRIKA_COUNTER_ID = 110228611

export const COOKIE_CONSENT_KEY = 'bookingo:cookie_consent'

const METRIKA_TAG_SRC = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_COUNTER_ID}`
const METRIKA_LOADED = '__bookingoMetrikaLoaded'

export type CookieConsent = {
  necessary: true
  analytics: boolean
  at: string
}

type YmStub = NonNullable<Window['ym']> & { a?: unknown[][]; l?: number }

export function readCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CookieConsent>
    if (parsed.necessary !== true || typeof parsed.analytics !== 'boolean' || typeof parsed.at !== 'string') {
      return null
    }
    return { necessary: true, analytics: parsed.analytics, at: parsed.at }
  } catch {
    return null
  }
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.analytics === true
}

export function saveCookieConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    at: new Date().toISOString(),
  }
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
  return consent
}

function ensureYmStub(): YmStub {
  const existing = window.ym as YmStub | undefined
  if (existing) return existing
  const stub = ((...args: unknown[]) => {
    stub.a = stub.a || []
    stub.a.push(args)
  }) as YmStub
  stub.l = Date.now()
  window.ym = stub
  return stub
}

/** Insert tag.js and init the counter when the visitor allowed analytics. */
export function loadMetrikaIfAllowed(): void {
  if (!hasAnalyticsConsent()) return
  if (typeof document === 'undefined') return
  const mark = window as Window & { [METRIKA_LOADED]?: boolean }
  if (mark[METRIKA_LOADED]) return
  mark[METRIKA_LOADED] = true
  ensureYmStub()
  if (!document.querySelector(`script[src="${METRIKA_TAG_SRC}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = METRIKA_TAG_SRC
    document.head.appendChild(script)
  }
  window.ym?.(METRIKA_COUNTER_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
    accurateTrackBounce: true,
    trackLinks: true,
  })
}

/** Goal identifiers configured in Yandex Metrika → Цели → JS-событие. */
export const METRIKA_GOALS = {
  poolBuyClick: 'pool_buy_click',
} as const

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void
  }
}

export function reachGoal(
  goal: string,
  params?: Record<string, string | number | boolean>,
) {
  window.ym?.(METRIKA_COUNTER_ID, 'reachGoal', goal, params)
}

export function trackPoolBuyClick(pool: {
  id: string
  name: string
  city: string
  price: string
}) {
  reachGoal(METRIKA_GOALS.poolBuyClick, {
    pool_id: pool.id,
    pool_name: pool.name,
    pool_city: pool.city,
    pool_price: pool.price,
  })
}
