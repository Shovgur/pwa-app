import type { CreateVenuePayload, PartnerVenue } from '../lib/partnerVenues'
import { venueMinPricePerHour } from '../utils/venuePrice'

const STORAGE_KEY = 'partnerVenuesMock'
const SEED_VERSION = 2

const LATENCY_MS = 220
const MAX_PHOTOS = 8

function delay<T>(value: T): Promise<T> {
  return new Promise(resolve => window.setTimeout(() => resolve(value), LATENCY_MS))
}

function migrateVenue(raw: Partial<PartnerVenue> & { pricePerHour?: number }): PartnerVenue {
  const base = raw.basePricePerHour ?? raw.pricePerHour ?? 0
  return {
    id: raw.id ?? `vn-${Date.now()}`,
    name: raw.name ?? '',
    venueKind: raw.venueKind ?? 'sport',
    city: raw.city ?? '',
    address: raw.address ?? '',
    description: raw.description ?? '',
    photos: raw.photos ?? [],
    basePricePerHour: base,
    pricePerHour: venueMinPricePerHour({
      ...raw,
      basePricePerHour: base,
      timePriceRules: raw.timePriceRules ?? [],
    } as PartnerVenue) || base,
    timePriceRules: raw.timePriceRules ?? [],
    durationRules: raw.durationRules ?? [],
    extraServices: raw.extraServices ?? [],
    amenities: raw.amenities ?? [],
    isActive: raw.isActive ?? true,
    bookingsCount: raw.bookingsCount ?? 0,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    lat: raw.lat ?? null,
    lng: raw.lng ?? null,
  }
}

function read(): PartnerVenue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { version: number; items: Partial<PartnerVenue>[] }
      if (parsed.version === SEED_VERSION) {
        return parsed.items.map(migrateVenue)
      }
      if (parsed.version === 1) {
        return parsed.items.map(migrateVenue)
      }
    }
  } catch {
    // повреждённый кэш
  }
  return []
}

function write(items: PartnerVenue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SEED_VERSION, items }))
  } catch {
    throw new Error('Не удалось сохранить — слишком много фото. Удалите часть изображений.')
  }
}

export function mockListVenues(): Promise<PartnerVenue[]> {
  return delay(read())
}

export function mockCreateVenue(payload: CreateVenuePayload): Promise<PartnerVenue> {
  if (payload.photos.length > MAX_PHOTOS) {
    return Promise.reject(new Error(`Максимум ${MAX_PHOTOS} фотографий`))
  }

  const venues = read()
  const minPrice = venueMinPricePerHour({
    ...payload,
    id: '',
    pricePerHour: 0,
    isActive: true,
    bookingsCount: 0,
    createdAt: '',
  } as PartnerVenue)

  const created = migrateVenue({
    id: `vn-${Date.now()}`,
    name: payload.name.trim(),
    venueKind: payload.venueKind,
    city: payload.city.trim(),
    address: payload.address.trim(),
    description: payload.description.trim(),
    photos: payload.photos,
    basePricePerHour: payload.basePricePerHour,
    pricePerHour: minPrice || payload.basePricePerHour,
    timePriceRules: payload.timePriceRules,
    durationRules: payload.durationRules,
    extraServices: payload.extraServices,
    amenities: payload.amenities,
    isActive: true,
    bookingsCount: 0,
    createdAt: new Date().toISOString(),
    lat: payload.lat ?? null,
    lng: payload.lng ?? null,
  })

  write([...venues, created])
  return delay(created)
}

export function mockSetVenueActive(id: string, isActive: boolean): Promise<PartnerVenue> {
  const venues = read()
  const index = venues.findIndex(v => v.id === id)
  if (index === -1) return Promise.reject(new Error('Площадка не найдена'))
  const updated = { ...venues[index], isActive }
  venues[index] = updated
  write(venues)
  return delay(updated)
}

export function mockDeleteVenue(id: string): Promise<void> {
  write(read().filter(v => v.id !== id))
  return delay(undefined)
}
