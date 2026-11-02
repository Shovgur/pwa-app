import { API_BASE } from '../config/api'
import { isDemoMode } from '../demo/demoMode'
import { demoFetchPartnerVenueViews, demoRecordVenueView } from '../demo/api/venueViews'
import { getPartnerToken } from '../contexts/PartnerAuthContext'
import type { StatsPeriod } from '../utils/partnerStats'

const VISITOR_KEY = 'bookingo.visitorId'
const DEDUPE_PREFIX = 'bookingo.venueView.'
const DEDUPE_MS = 30 * 60 * 1000

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(VISITOR_KEY, id)
    return id
  } catch {
    return `anon-${Date.now()}`
  }
}

/** Клиентский дедуп 30 мин на venueId. */
function shouldSkipLocal(venueId: string): boolean {
  try {
    const raw = localStorage.getItem(DEDUPE_PREFIX + venueId)
    if (!raw) return false
    const ts = Number(raw)
    if (!Number.isFinite(ts)) return false
    return Date.now() - ts < DEDUPE_MS
  } catch {
    return false
  }
}

function markLocal(venueId: string) {
  try {
    localStorage.setItem(DEDUPE_PREFIX + venueId, String(Date.now()))
  } catch {
    /* ignore */
  }
}

/**
 * Засчитать просмотр публичной площадки.
 * Не вызывается из /partner/* — вызывающий код сам решает.
 */
export async function trackVenueView(venueId: string | null | undefined): Promise<void> {
  if (!venueId) return
  const id = String(venueId)
  if (!id || id.startsWith('name:')) return
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/partner')) return
  if (shouldSkipLocal(id)) return

  markLocal(id)

  if (isDemoMode()) {
    demoRecordVenueView(id)
    return
  }

  try {
    await fetch(`${API_BASE}/venues/${encodeURIComponent(id)}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorKey: getVisitorId() }),
    })
  } catch {
    /* просмотр не критичен */
  }
}

export async function fetchPartnerVenueViews(
  period: StatsPeriod,
): Promise<{ totalViews: number; byVenueId: Record<string, number> }> {
  if (isDemoMode()) return demoFetchPartnerVenueViews(period)

  const token = getPartnerToken()
  const res = await fetch(`${API_BASE}/partner/venue-views?period=${encodeURIComponent(period)}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) {
    return { totalViews: 0, byVenueId: {} }
  }
  const data = (await res.json().catch(() => ({}))) as {
    totalViews?: number
    views?: { venueId: string; views: number }[]
  }
  const byVenueId: Record<string, number> = {}
  for (const row of data.views ?? []) {
    byVenueId[String(row.venueId)] = Number(row.views) || 0
  }
  return {
    totalViews: Number(data.totalViews) || Object.values(byVenueId).reduce((s, n) => s + n, 0),
    byVenueId,
  }
}
