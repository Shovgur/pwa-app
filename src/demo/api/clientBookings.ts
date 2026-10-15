import type { CreateBookingPayload } from '../../lib/clientBookings'
import type { Booking } from '../../contexts/BookingContext'
import { apiBookingToBooking } from '../../lib/clientBookings'
import { demoBookingToApiClient } from '../bookingStatus'
import { demoDelay, read, update, type DemoBooking } from '../demoStore'
import { findClientInStore, requireDemoClientId } from './demoSession'

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function rangesOverlap(aFrom: string, aTo: string, bFrom: string, bTo: string): boolean {
  const af = timeToMinutes(aFrom)
  const at = timeToMinutes(aTo)
  const bf = timeToMinutes(bFrom)
  const bt = timeToMinutes(bTo)
  return af < bt && bf < at
}

function slotConflict(
  venueId: string,
  date: string,
  timeFrom: string,
  timeTo: string,
  excludeId?: number,
): boolean {
  const state = read()
  return state.bookings.some(b => {
    if (b.id === excludeId) return false
    if (b.venueId !== venueId || b.date !== date) return false
    if (b.status === 'cancelled') return false
    return rangesOverlap(timeFrom, timeTo, b.timeFrom, b.timeTo)
  })
}

function resolveVenueIdFromRef(venueRef: string): string | null {
  const m = venueRef.match(/^partner:(.+)$/)
  return m ? m[1] : null
}

function nextCode(state: typeof read extends () => infer R ? R : never): string {
  const n = 1000 + state.nextBookingId
  return `BG-${n}`
}

export async function demoFetchClientBookings(): Promise<Booking[]> {
  await demoDelay()
  const clientId = requireDemoClientId()
  const rows = read()
    .bookings.filter(b => b.clientId === clientId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return rows.map(b => apiBookingToBooking(demoBookingToApiClient(b)))
}

export async function demoCreateClientBooking(payload: CreateBookingPayload): Promise<Booking> {
  await demoDelay()
  const clientId = requireDemoClientId()
  const client = findClientInStore(clientId)
  if (!client) throw new Error('Клиент не найден')

  const venueId = resolveVenueIdFromRef(payload.venueRef)
  if (!venueId) throw new Error('Площадка не найдена')

  const state = read()
  const venue = state.venues.find(v => v.id === venueId)
  if (!venue) throw new Error('Площадка не найдена')

  const timeFrom = payload.time
  const timeTo = addMinutes(timeFrom, payload.durationMinutes)
  if (slotConflict(venueId, payload.date, timeFrom, timeTo)) {
    throw new Error('Слот занят')
  }

  const booking: DemoBooking = {
    id: state.nextBookingId,
    code: nextCode(state),
    companyId: venue.companyId,
    clientId,
    customerName: client.name,
    customerPhone: client.phone,
    venueId,
    venueName: payload.venueName,
    venueKind: payload.venueKind,
    venueSport: payload.venueSport ?? null,
    venueAddress: payload.venueAddress ?? null,
    venueEmoji: payload.venueEmoji ?? null,
    venueColor: payload.venueColor ?? null,
    venueRef: payload.venueRef,
    date: payload.date,
    time: payload.time,
    timeFrom,
    timeTo,
    durationMinutes: payload.durationMinutes,
    guests: payload.guests ?? 1,
    amount: payload.price,
    paidAmount: 0,
    paymentMethod: payload.paymentMethod === 'cash' ? 'cash' : 'online',
    status: 'pending',
    comment: payload.comment ?? null,
    createdAt: new Date().toISOString(),
  }

  update(s => ({
    ...s,
    nextBookingId: s.nextBookingId + 1,
    bookings: [...s.bookings, booking],
  }))

  return apiBookingToBooking(demoBookingToApiClient(booking))
}

export async function demoCancelClientBooking(id: number): Promise<Booking> {
  await demoDelay()
  const clientId = requireDemoClientId()
  let updated: DemoBooking | null = null
  update(s => {
    const bookings = s.bookings.map(b => {
      if (b.id !== id || b.clientId !== clientId) return b
      updated = { ...b, status: 'cancelled' }
      return updated
    })
    if (!updated) throw new Error('Бронь не найдена')
    return { ...s, bookings }
  })
  return apiBookingToBooking(demoBookingToApiClient(updated!))
}
