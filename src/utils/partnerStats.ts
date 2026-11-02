import type { PartnerBooking } from '../lib/partnerCrm'
import type { PartnerVenue } from '../lib/partnerVenues'

export type StatsPeriod = 'this_month' | 'last_month' | 'all'

export const STATS_PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'this_month', label: 'Этот месяц' },
  { value: 'last_month', label: 'Прошлый месяц' },
  { value: 'all', label: 'Всё время' },
]

export interface VenueEarningsRow {
  venueId: string
  venueName: string
  paidCount: number
  cancelledCount: number
  revenue: number
  /** revenue / paidCount; null если нет оплаченных */
  avgCheck: number | null
  views: number
}

export interface PartnerEarningsStats {
  period: StatsPeriod
  /** SUM(amount) по paid|completed */
  revenue: number
  paidCount: number
  cancelledCount: number
  activeVenues: number
  /** только owner */
  commissionAmount: number
  /** revenue − commission, только owner */
  netEarnings: number
  avgCheck: number | null
  totalViews: number
  venues: VenueEarningsRow[]
}

function monthPrefix(offsetMonths = 0): string {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offsetMonths)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function filterBookingsByPeriod(
  bookings: PartnerBooking[],
  period: StatsPeriod,
): PartnerBooking[] {
  if (period === 'all') return bookings
  const prefix = period === 'this_month' ? monthPrefix(0) : monthPrefix(-1)
  return bookings.filter(b => b.date.startsWith(prefix))
}

function isPaidStatus(status: PartnerBooking['status']): boolean {
  return status === 'paid' || status === 'completed'
}

function avgOrNull(revenue: number, paidCount: number): number | null {
  if (paidCount <= 0) return null
  return revenue / paidCount
}

/**
 * Выручка / оплачено / отменено / средний чек / просмотры по площадкам.
 * Оплаченная = paid|completed; выручка = SUM(amount); отменённые не в выручке.
 */
export function computePartnerEarnings(
  bookings: PartnerBooking[],
  venues: PartnerVenue[],
  period: StatsPeriod,
  options?: {
    commissionPercent?: number
    includeCommission?: boolean
    viewsByVenueId?: Record<string, number>
  },
): PartnerEarningsStats {
  const inPeriod = filterBookingsByPeriod(bookings, period)
  const includeCommission = options?.includeCommission ?? false
  const rate = Number.isFinite(options?.commissionPercent)
    ? Math.max(0, Number(options?.commissionPercent))
    : 0
  const viewsByVenueId = options?.viewsByVenueId ?? {}

  const byVenue = new Map<string, VenueEarningsRow>()

  for (const v of venues) {
    const id = String(v.id)
    byVenue.set(id, {
      venueId: id,
      venueName: v.name,
      paidCount: 0,
      cancelledCount: 0,
      revenue: 0,
      avgCheck: null,
      views: Number(viewsByVenueId[id]) || 0,
    })
  }

  for (const b of inPeriod) {
    const key = b.venueId != null && b.venueId !== ''
      ? String(b.venueId)
      : `name:${b.venueName}`
    let row = byVenue.get(key)
    if (!row) {
      row = {
        venueId: key,
        venueName: b.venueName || 'Без площадки',
        paidCount: 0,
        cancelledCount: 0,
        revenue: 0,
        avgCheck: null,
        views: Number(viewsByVenueId[key]) || 0,
      }
      byVenue.set(key, row)
    }
    if (isPaidStatus(b.status)) {
      row.paidCount += 1
      row.revenue += Number(b.amount) || 0
    } else if (b.status === 'cancelled') {
      row.cancelledCount += 1
    }
  }

  const venuesRows = [...byVenue.values()]
    .map(r => ({ ...r, avgCheck: avgOrNull(r.revenue, r.paidCount) }))
    .filter(r =>
      venues.some(v => String(v.id) === r.venueId)
      || r.paidCount > 0
      || r.cancelledCount > 0
      || r.revenue > 0
      || r.views > 0,
    )
    .sort((a, b) => b.revenue - a.revenue || a.venueName.localeCompare(b.venueName, 'ru'))

  const revenue = venuesRows.reduce((s, r) => s + r.revenue, 0)
  const paidCount = venuesRows.reduce((s, r) => s + r.paidCount, 0)
  const cancelledCount = venuesRows.reduce((s, r) => s + r.cancelledCount, 0)
  const totalViews = venuesRows.reduce((s, r) => s + r.views, 0)
  const commissionAmount = includeCommission ? Math.round((revenue * rate) / 100) : 0
  const netEarnings = includeCommission ? revenue - commissionAmount : revenue

  return {
    period,
    revenue,
    paidCount,
    cancelledCount,
    activeVenues: venues.filter(v => v.isActive).length,
    commissionAmount,
    netEarnings,
    avgCheck: avgOrNull(revenue, paidCount),
    totalViews,
    venues: venuesRows,
  }
}

/** @deprecated используйте computePartnerEarnings */
export interface PartnerOwnerStats {
  clientCount: number
  monthBookings: number
  commissionAmount: number
  activeVenues: number
}

/** @deprecated */
export function computePartnerOwnerStats(
  bookings: PartnerBooking[],
  venues: PartnerVenue[],
  commissionPercent: number,
): PartnerOwnerStats {
  const e = computePartnerEarnings(bookings, venues, 'this_month', {
    commissionPercent,
    includeCommission: true,
  })
  const active = bookings.filter(b => b.status !== 'cancelled')
  const clients = new Set(
    active.map(b => (b.customerPhone || b.customerName).trim().toLowerCase()).filter(Boolean),
  )
  return {
    clientCount: clients.size,
    monthBookings: e.paidCount + filterBookingsByPeriod(active, 'this_month').filter(b => !isPaidStatus(b.status)).length,
    commissionAmount: e.commissionAmount,
    activeVenues: e.activeVenues,
  }
}
