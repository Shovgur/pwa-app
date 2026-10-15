import type { VenueAvailability } from '../../lib/venueAvailability'
import { read } from '../demoStore'

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
  return timeToMinutes(aFrom) < timeToMinutes(bTo) && timeToMinutes(bFrom) < timeToMinutes(aTo)
}

function resolveVenueId(venueId?: string | null, venueRef?: string): string | null {
  if (venueId) return venueId
  const m = venueRef?.match(/^partner:(.+)$/)
  return m ? m[1] : null
}

export function demoFetchVenueAvailability(
  venueId: string,
  date: string,
  durationMinutes = 60,
  stepMinutes = 30,
): VenueAvailability {
  const state = read()
  const venue = state.venues.find(v => v.id === venueId)
  const basePrice = venue?.pricePerHour ?? 2000

  const dayBookings = state.bookings.filter(
    b => b.venueId === venueId && b.date === date && b.status !== 'cancelled',
  )

  const slots: VenueAvailability['slots'] = []
  for (let min = 9 * 60; min <= 21 * 60 - durationMinutes; min += stepMinutes) {
    const h = Math.floor(min / 60)
    const m = min % 60
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const timeTo = addMinutes(time, durationMinutes)
    const taken = dayBookings.some(b =>
      rangesOverlap(time, timeTo, b.timeFrom, b.timeTo),
    )
    slots.push({
      time,
      pricePerHour: basePrice,
      available: !taken,
    })
  }

  return {
    date,
    durationMinutes,
    stepMinutes,
    slots,
  }
}

export function demoFetchAvailabilityByRef(
  venueRef: string,
  date: string,
  durationMinutes = 60,
): VenueAvailability {
  const id = resolveVenueId(null, venueRef)
  if (!id) {
    return { date, durationMinutes, stepMinutes: 30, slots: [] }
  }
  return demoFetchVenueAvailability(id, date, durationMinutes)
}
