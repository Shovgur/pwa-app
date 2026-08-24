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
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(data.error || 'Не удалось загрузить слоты')
  }
  return res.json() as Promise<VenueAvailability>
}

/** Fallback slots for demo courts when API is not used. */
export const DEMO_SLOTS = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00']
