import type { ApiClientBooking } from '../lib/clientBookings'
import type { PartnerBooking, BookingStatus } from '../lib/partnerCrm'
import { BOOKING_STATUS_META } from '../lib/partnerCrm'
import type { DemoBooking } from './demoStore'

export type ClientBookingStatus = 'upcoming' | 'completed' | 'cancelled'

export function crmToClientStatus(s: BookingStatus): ClientBookingStatus {
  if (s === 'cancelled') return 'cancelled'
  if (s === 'completed') return 'completed'
  return 'upcoming'
}

export function crmStatusLabel(s: BookingStatus): string {
  return BOOKING_STATUS_META[s].label
}

function partnerVenueIdFromRef(venueRef: string): number | null {
  const m = venueRef.match(/^partner:(.+)$/)
  if (!m) return null
  const tail = m[1]
  const n = parseInt(tail.replace(/\D/g, ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function demoBookingToApiClient(b: DemoBooking): ApiClientBooking {
  const crmStatus = b.status
  return {
    id: b.id,
    venueRef: b.venueRef,
    partnerVenueId: partnerVenueIdFromRef(b.venueRef),
    venueName: b.venueName,
    venueKind: b.venueKind,
    venueSport: b.venueSport ?? null,
    venueAddress: b.venueAddress ?? null,
    venueEmoji: b.venueEmoji ?? null,
    venueColor: b.venueColor ?? null,
    date: b.date,
    time: b.time,
    durationMinutes: b.durationMinutes,
    price: b.amount,
    status: crmToClientStatus(b.status),
    paymentMethod: b.paymentMethod,
    code: b.code,
    createdAt: b.createdAt,
    crmStatus,
    statusLabel: crmStatusLabel(crmStatus),
  }
}

export function demoBookingToPartner(b: DemoBooking): PartnerBooking {
  return {
    id: String(b.id),
    code: b.code,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    venueName: b.venueName,
    venueKind: b.venueKind,
    date: b.date,
    timeFrom: b.timeFrom,
    timeTo: b.timeTo,
    guests: b.guests,
    amount: b.amount,
    paidAmount: b.paidAmount,
    paymentMethod: b.paymentMethod,
    status: b.status,
    comment: b.comment,
    createdAt: b.createdAt,
  }
}
