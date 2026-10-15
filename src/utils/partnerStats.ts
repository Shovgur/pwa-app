import type { PartnerBooking } from '../lib/partnerCrm'
import type { PartnerVenue } from '../lib/partnerVenues'

export interface PartnerOwnerStats {
  clientCount: number
  monthBookings: number
  commissionAmount: number
  activeVenues: number
}

function currentMonthPrefix(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Сводка для главной владельца — из броней и площадок, без «нулей ради нулей».
 * Комиссия считается от paidAmount (уже внесённых сумм).
 */
export function computePartnerOwnerStats(
  bookings: PartnerBooking[],
  venues: PartnerVenue[],
  commissionPercent: number,
): PartnerOwnerStats {
  const month = currentMonthPrefix()
  const active = bookings.filter(b => b.status !== 'cancelled')
  const monthBookings = active.filter(b => b.date.startsWith(month))
  const clients = new Set(
    active.map(b => (b.customerPhone || b.customerName).trim().toLowerCase()).filter(Boolean),
  )
  const paidSum = monthBookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0)
  const rate = Number.isFinite(commissionPercent) ? Math.max(0, commissionPercent) : 0

  return {
    clientCount: clients.size,
    monthBookings: monthBookings.length,
    commissionAmount: Math.round((paidSum * rate) / 100),
    activeVenues: venues.filter(v => v.isActive).length,
  }
}
