import { API_BASE } from '../config/api'

export interface VenueSlot {
  time: string
  pricePerHour: number
  available: boolean
}

export interface VenueAvailability {
  date: string
  durationMinutes: number
  stepMinutes: number
  slots: VenueSlot[]
}

export function isSlotTakenError(message: string): boolean {
  const m = message.toLowerCase()
  return m.includes('занят') || m.includes('occupied') || m.includes('conflict')
}

async function parseAvailabilityResponse(res: Response): Promise<VenueAvailability> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(data.error || 'Не удалось загрузить слоты')
  }
  return res.json() as Promise<VenueAvailability>
}

export async function fetchVenueAvailability(
  venueId: string,
  date: string,
  durationMinutes = 60,
): Promise<VenueAvailability> {
  const params = new URLSearchParams({
    date,
    duration: String(durationMinutes),
    step: '30',
  })
  const res = await fetch(`${API_BASE}/venues/${venueId}/availability?${params}`)
  return parseAvailabilityResponse(res)
}

export async function fetchAvailabilityByRef(
  venueRef: string,
  date: string,
  durationMinutes = 60,
): Promise<VenueAvailability> {
  const params = new URLSearchParams({
    venueRef,
    date,
    duration: String(durationMinutes),
    step: '30',
  })
  const res = await fetch(`${API_BASE}/availability?${params}`)
  return parseAvailabilityResponse(res)
}

export async function fetchCourtAvailability(
  options: {
    venueId?: string | null
    venueRef?: string
    date: string
    durationMinutes?: number
  },
): Promise<VenueAvailability> {
  const duration = options.durationMinutes ?? 60
  if (options.venueId) {
    return fetchVenueAvailability(options.venueId, options.date, duration)
  }
  if (options.venueRef) {
    return fetchAvailabilityByRef(options.venueRef, options.date, duration)
  }
  return {
    date: options.date,
    durationMinutes: duration,
    stepMinutes: 30,
    slots: [],
  }
}

/** Fallback slots for demo courts when API is not used. */
export const DEMO_SLOTS = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00']
