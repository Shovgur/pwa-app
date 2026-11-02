import type { StatsPeriod } from '../../utils/partnerStats'
import { getDemoPartnerAccount, venueManagedByAccount } from './managerScope'
import { read } from '../demoStore'

const VIEWS_KEY = 'bookingo.demo.venueViews.v1'
const DEDUPE_MS = 30 * 60 * 1000

type ViewDay = { venueId: string; day: string; count: number }
type Dedupe = { venueId: string; visitorKey: string; lastAt: number }
type ViewsState = { days: ViewDay[]; dedupe: Dedupe[] }

function loadViews(): ViewsState {
  try {
    const raw = localStorage.getItem(VIEWS_KEY)
    if (!raw) return { days: [], dedupe: [] }
    const parsed = JSON.parse(raw) as ViewsState
    return {
      days: Array.isArray(parsed.days) ? parsed.days : [],
      dedupe: Array.isArray(parsed.dedupe) ? parsed.dedupe : [],
    }
  } catch {
    return { days: [], dedupe: [] }
  }
}

function saveViews(state: ViewsState) {
  localStorage.setItem(VIEWS_KEY, JSON.stringify(state))
}

function todayYmd(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function monthRange(period: StatsPeriod): { from: string | null; to: string | null } {
  if (period === 'all') return { from: null, to: null }
  const d = new Date()
  d.setDate(1)
  if (period === 'last_month') d.setMonth(d.getMonth() - 1)
  const y = d.getFullYear()
  const m = d.getMonth()
  const from = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const last = new Date(y, m + 1, 0)
  const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
  return { from, to }
}

export function demoRecordVenueView(venueId: string, visitorKey = 'demo-local'): boolean {
  const state = loadViews()
  const now = Date.now()
  const prev = state.dedupe.find(d => d.venueId === venueId && d.visitorKey === visitorKey)
  if (prev && now - prev.lastAt < DEDUPE_MS) return false

  state.dedupe = [
    ...state.dedupe.filter(d => !(d.venueId === venueId && d.visitorKey === visitorKey)),
    { venueId, visitorKey, lastAt: now },
  ]
  const day = todayYmd()
  const existing = state.days.find(v => v.venueId === venueId && v.day === day)
  if (existing) {
    state.days = state.days.map(v =>
      v.venueId === venueId && v.day === day ? { ...v, count: v.count + 1 } : v,
    )
  } else {
    state.days = [...state.days, { venueId, day, count: 1 }]
  }
  saveViews(state)
  return true
}

export async function demoFetchPartnerVenueViews(
  period: StatsPeriod,
): Promise<{ totalViews: number; byVenueId: Record<string, number> }> {
  const account = getDemoPartnerAccount()
  if (!account) return { totalViews: 0, byVenueId: {} }

  let venues = read().venues.filter(v => v.companyId === account.companyId)
  if (account.role === 'manager') {
    venues = venues.filter(v => venueManagedByAccount(v, account))
  }
  const allowed = new Set(venues.map(v => String(v.id)))
  const { from, to } = monthRange(period)
  const byVenueId: Record<string, number> = {}

  for (const row of loadViews().days) {
    if (!allowed.has(String(row.venueId))) continue
    if (from && row.day < from) continue
    if (to && row.day > to) continue
    byVenueId[String(row.venueId)] = (byVenueId[String(row.venueId)] || 0) + row.count
  }

  return {
    totalViews: Object.values(byVenueId).reduce((s, n) => s + n, 0),
    byVenueId,
  }
}
