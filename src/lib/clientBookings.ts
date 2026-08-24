import { API_BASE } from '../config/api'
import { getAuthToken } from '../config/auth'
import type { Booking, Court } from '../contexts/BookingContext'
import { COURTS } from '../contexts/BookingContext'
import { LOFTS, loftToCourt } from '../data/venues'
import { POOLS, poolToCourt } from '../data/pools'
import { partnerVenueCourtId } from '../utils/venueAdapters'
import { formatBookingDisplayDate } from '../utils/bookingDates'

export type VenueKind = 'sport' | 'loft' | 'pool' | 'meeting'

export interface CreateBookingPayload {
  venueRef: string
  venueName: string
  venueKind: VenueKind
  venueSport?: string
  venueAddress?: string
  venueEmoji?: string
  venueColor?: string
  date: string
  time: string
  durationMinutes: number
  price: number
  paymentMethod?: 'online' | 'cash'
  guests?: number
  comment?: string | null
  addOns?: { name: string; price: number }[]
  requestCallback?: boolean
}

export interface ApiClientBooking {
  id: number
  venueRef: string
  partnerVenueId: number | null
  venueName: string
  venueKind: VenueKind
  venueSport: string | null
  venueAddress: string | null
  venueEmoji: string | null
  venueColor: string | null
  date: string
  time: string
  durationMinutes: number
  price: number
  status: 'upcoming' | 'completed' | 'cancelled'
  paymentMethod: string | null
  code: string | null
  createdAt: string
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok) {
    const raw = (data.message ?? data.error) as string | undefined
    throw new Error(raw ?? `Ошибка ${res.status}`)
  }

  return data as T
}

export function courtVenueRef(court: Court): string {
  if (court.partnerVenueId) return `partner:${court.partnerVenueId}`
  if (court.venueType === 'pool') {
    const idx = court.id >= 800 && court.id < 900 ? court.id - 800 : -1
    const pool = idx >= 0 ? POOLS[idx] : POOLS.find((_, i) => 800 + i === court.id)
    return pool ? `mock:pool:${pool.id}` : `mock:pool:${court.id}`
  }
  if (court.venueType === 'loft') {
    const idx = court.id >= 900 ? court.id - 900 : -1
    const loft = idx >= 0 ? LOFTS[idx] : LOFTS.find((_, i) => 900 + i === court.id)
    return loft ? `mock:loft:${loft.id}` : `mock:loft:${court.id}`
  }
  return `mock:court:${court.id}`
}

export function loftVenueRef(loftId: string): string {
  return `mock:loft:${loftId}`
}

export function buildCreatePayloadFromCourt(
  court: Court,
  isoDate: string,
  time: string,
  durationMinutes: number,
  price: number,
  options?: {
    paymentMethod?: 'online' | 'cash'
    addOns?: { name: string; price: number }[]
    guests?: number
    comment?: string | null
    requestCallback?: boolean
  },
): CreateBookingPayload {
  const venueKind: VenueKind =
    court.venueType === 'loft' ? 'loft'
    : court.venueType === 'pool' ? 'pool'
    : court.partnerVenueId ? (court.sport === 'Бассейн' ? 'pool' : 'sport')
    : 'sport'

  return {
    venueRef: courtVenueRef(court),
    venueName: court.name,
    venueKind,
    venueSport: court.sport,
    venueAddress: court.address || court.location,
    venueEmoji: court.emoji,
    venueColor: court.color,
    date: isoDate,
    time,
    durationMinutes,
    price,
    paymentMethod: options?.paymentMethod ?? 'online',
    guests: options?.guests ?? 1,
    comment: options?.comment ?? null,
    addOns: options?.addOns,
    requestCallback: options?.requestCallback ?? false,
  }
}

function courtIdFromVenueRef(venueRef: string, partnerVenueId: number | null): number {
  if (partnerVenueId) return partnerVenueCourtId(String(partnerVenueId))
  const match = venueRef.match(/^mock:(court|pool|loft):(.+)$/)
  if (!match) return 1
  const [, kind, id] = match
  if (kind === 'court') return parseInt(id, 10) || 1
  if (kind === 'pool') {
    const idx = POOLS.findIndex(p => p.id === id)
    return idx >= 0 ? 800 + idx : 800
  }
  const idx = LOFTS.findIndex(l => l.id === id)
  return idx >= 0 ? 900 + idx : 900
}

function rebuildCourt(row: ApiClientBooking): Court {
  const ref = row.venueRef
  if (ref.startsWith('mock:court:')) {
    const id = parseInt(ref.split(':')[2], 10)
    const found = COURTS.find(c => c.id === id)
    if (found) return found
  }
  if (ref.startsWith('mock:pool:')) {
    const poolId = ref.split(':')[2]
    const idx = POOLS.findIndex(p => p.id === poolId)
    if (idx >= 0) return poolToCourt(POOLS[idx], idx)
  }
  if (ref.startsWith('mock:loft:')) {
    const loftId = ref.split(':')[2]
    const loft = LOFTS.find(l => l.id === loftId)
    if (loft) return loftToCourt(loft, LOFTS.indexOf(loft))
  }

  const venueType =
    row.venueKind === 'loft' ? 'loft'
    : row.venueKind === 'pool' ? 'pool'
    : 'sport'

  return {
    id: courtIdFromVenueRef(row.venueRef, row.partnerVenueId),
    emoji: row.venueEmoji ?? '🏟️',
    sport: row.venueSport ?? 'Спорт',
    name: row.venueName,
    location: row.venueAddress ?? '',
    address: row.venueAddress ?? '',
    rating: 4.8,
    reviews: 0,
    price: row.price,
    color: row.venueColor ?? '#22c55e',
    available: true,
    distance: '',
    amenities: [],
    description: row.venueName,
    photos: [row.venueColor ? `linear-gradient(135deg, ${row.venueColor} 0%, #1e293b 100%)` : 'linear-gradient(135deg, #064e3b 0%, #15803d 100%)'],
    slots: [],
    venueType,
    partnerVenueId: row.partnerVenueId ? String(row.partnerVenueId) : undefined,
  }
}

export function apiBookingToBooking(row: ApiClientBooking): Booking {
  const court = rebuildCourt(row)
  const venueType =
    row.venueKind === 'loft' ? 'loft'
    : row.venueKind === 'pool' ? 'pool'
    : 'sport'

  return {
    id: row.id,
    courtId: court.id,
    court,
    date: formatBookingDisplayDate(row.date),
    time: row.time,
    duration: row.durationMinutes || 60,
    price: row.price,
    status: row.status,
    createdAt: row.createdAt?.slice(0, 10) ?? row.date,
    venueType,
    code: row.code ?? undefined,
  }
}

export async function fetchClientBookings(): Promise<Booking[]> {
  const data = await authRequest<{ bookings: ApiClientBooking[] }>('/bookings')
  return (data.bookings ?? []).map(apiBookingToBooking)
}

export async function createClientBooking(payload: CreateBookingPayload): Promise<Booking> {
  const data = await authRequest<{ booking: ApiClientBooking }>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return apiBookingToBooking(data.booking)
}

export async function cancelClientBooking(id: number): Promise<Booking> {
  const data = await authRequest<{ booking: ApiClientBooking }>(`/bookings/${id}/cancel`, {
    method: 'PATCH',
  })
  return apiBookingToBooking(data.booking)
}
