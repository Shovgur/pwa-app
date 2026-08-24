import { API_BASE } from '../config/api'
import { getPartnerToken } from '../contexts/PartnerAuthContext'
import {
  mockCreateVenue,
  mockDeleteVenue,
  mockListVenues,
  mockSetVenueActive,
} from '../data/partnerVenuesMock'
import type { VenueKind } from './partnerCrm'
import { VENUE_KIND_LABEL } from './partnerCrm'

/**
 * Пока бэкенд /api/partner/venues не готов — данные в localStorage.
 * Когда эндпоинты появятся → поставить false.
 */
export const USE_VENUE_MOCKS = false

export type { VenueKind }
export { VENUE_KIND_LABEL }

export const VENUE_KIND_OPTIONS: { value: VenueKind; label: string }[] = (
  Object.entries(VENUE_KIND_LABEL) as [VenueKind, string][]
).map(([value, label]) => ({ value, label }))

export type ExtraBilling = 'per_booking' | 'per_hour' | 'per_person'

export interface VenuePhoto {
  id: string
  url: string
  isCover: boolean
}

export interface VenueTimePriceRule {
  id: string
  label: string
  timeFrom: string
  timeTo: string
  pricePerHour: number
}

export interface VenueDurationRule {
  id: string
  hours: number
  price: number
  label: string
}

export interface VenueExtraService {
  id: string
  name: string
  description: string
  price: number
  billing: ExtraBilling
}

export interface PartnerVenue {
  id: string
  name: string
  venueKind: VenueKind
  city: string
  address: string
  description: string
  photos: VenuePhoto[]
  basePricePerHour: number
  /** Минимальная цена — для обратной совместимости и карточек */
  pricePerHour: number
  timePriceRules: VenueTimePriceRule[]
  durationRules: VenueDurationRule[]
  extraServices: VenueExtraService[]
  amenities: string[]
  isActive: boolean
  bookingsCount: number
  createdAt: string
}

export interface CreateVenuePayload {
  name: string
  venueKind: VenueKind
  city: string
  address: string
  description: string
  photos: VenuePhoto[]
  basePricePerHour: number
  timePriceRules: VenueTimePriceRule[]
  durationRules: VenueDurationRule[]
  extraServices: VenueExtraService[]
  amenities: string[]
}

async function partnerRequest<T>(
  path: string,
  options: RequestInit = {},
  emptyOn404 = false,
): Promise<T> {
  const token = getPartnerToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (emptyOn404 && res.status === 404) {
    if (path.includes('/venues')) return { venues: [] } as T
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok) {
    const raw = (data.message ?? data.error) as string | undefined
    if (res.status === 404) {
      throw new Error(
        raw ?? `Эндпоинт ${path} не найден на сервере. Обновите и перезапустите бэкенд.`,
      )
    }
    throw new Error(raw ?? `Ошибка ${res.status}`)
  }

  return data as T
}

export function fetchPartnerVenues(): Promise<PartnerVenue[]> {
  if (USE_VENUE_MOCKS) return mockListVenues()
  return partnerRequest<{ venues: PartnerVenue[] }>('/partner/venues', {}, true)
    .then(r => r.venues)
}

export function createPartnerVenue(payload: CreateVenuePayload): Promise<PartnerVenue> {
  if (USE_VENUE_MOCKS) return mockCreateVenue(payload)
  return partnerRequest<{ venue: PartnerVenue }>('/partner/venues', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(r => r.venue)
}

export function setPartnerVenueActive(id: string, isActive: boolean): Promise<PartnerVenue> {
  if (USE_VENUE_MOCKS) return mockSetVenueActive(id, isActive)
  return partnerRequest<{ venue: PartnerVenue }>(`/partner/venues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  }).then(r => r.venue)
}

export function deletePartnerVenue(id: string): Promise<void> {
  if (USE_VENUE_MOCKS) return mockDeleteVenue(id)
  return partnerRequest<unknown>(`/partner/venues/${id}`, { method: 'DELETE' }).then(() => undefined)
}
