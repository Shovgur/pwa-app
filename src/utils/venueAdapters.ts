import type { CSSProperties } from 'react'
import type { VenueCardProps } from '../components/ui/VenueCard'
import type { Court } from '../contexts/BookingContext'
import type { PartnerVenue, VenueKind } from '../lib/partnerVenues'
import { VENUE_KIND_LABEL } from '../lib/partnerVenues'
import { getSportById, sportLabel } from '../data/sportTypes'
import { venueMinPricePerHour, venuePriceSummary } from './venuePrice'

const KIND_GRADIENT: Record<VenueKind, string> = {
  sport:   'linear-gradient(135deg, #064e3b 0%, #15803d 100%)',
  pool:    'linear-gradient(135deg, #0c4a6e 0%, #0e7490 100%)',
  loft:    'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)',
  meeting: 'linear-gradient(135deg, #581c87 0%, #a855f7 100%)',
}

const KIND_EMOJI: Record<VenueKind, string> = {
  sport: '🏅',
  pool: '🏊',
  loft: '🏢',
  meeting: '💼',
}

const KIND_COLOR: Record<VenueKind, string> = {
  sport: '#22c55e',
  pool: '#0ea5e9',
  loft: '#f97316',
  meeting: '#a855f7',
}

const KIND_SPORT_LABEL: Record<VenueKind, string> = {
  sport: 'Спорт',
  pool: 'Бассейн',
  loft: 'Лофт',
  meeting: 'Переговорная',
}

const DEFAULT_SLOTS = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00', '20:00']

export function resolveVenueImageUrl(url?: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return url.startsWith('/') ? url : `/${url}`
}

export function venueCoverImage(venue: PartnerVenue): string | undefined {
  const cover = venue.photos.find(p => p.isCover) ?? venue.photos[0]
  return resolveVenueImageUrl(cover?.url)
}

export function partnerVenueCatalogType(kind: VenueKind): 'sport' | 'loft' | 'pool' | 'meeting' {
  return kind
}

export function partnerVenueBadge(venue: PartnerVenue): string {
  if (venue.venueKind === 'sport' && venue.sportType) {
    return sportLabel(venue.sportType)
  }
  return VENUE_KIND_LABEL[venue.venueKind]
}

export function partnerVenueToVenueCard(venue: PartnerVenue, delay = 0): VenueCardProps & {
  type: ReturnType<typeof partnerVenueCatalogType>
  sportTypeId?: string | null
} {
  const minPrice = venueMinPricePerHour(venue)
  const image = venueCoverImage(venue)
  const desc = venue.description.trim()
  return {
    to: `/venue/${venue.id}`,
    badge: partnerVenueBadge(venue),
    title: venue.name,
    location: `${venue.city} · ${venue.address}`,
    description: desc.length > 90 ? `${desc.slice(0, 90)}…` : desc,
    price: minPrice > 0 ? `${minPrice.toLocaleString('ru-RU')} ₽/час` : venuePriceSummary(venue),
    rating: 4.9,
    gradient: KIND_GRADIENT[venue.venueKind],
    image,
    delay,
    type: partnerVenueCatalogType(venue.venueKind),
    sportTypeId: venue.venueKind === 'sport' ? venue.sportType ?? null : null,
  }
}

export function partnerVenueCourtId(dbId: string): number {
  const n = parseInt(dbId, 10)
  return Number.isFinite(n) ? 60_000 + n : 60_000
}

export function courtPhotoStyle(court: Court, index = 0): CSSProperties {
  const photo = index === 0 && court.coverImage ? court.coverImage : court.photos[index]
  if (!photo) return {}
  if (photo.startsWith('http') || photo.startsWith('/') || photo.startsWith('data:')) {
    return { backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { background: photo }
}

export function courtCardBannerStyle(court: Court): CSSProperties {
  return courtPhotoStyle(court, 0)
}

export function partnerVenueToCourt(venue: PartnerVenue): Court {
  const image = venueCoverImage(venue)
  const photos = image
    ? [image, KIND_GRADIENT[venue.venueKind]]
    : [KIND_GRADIENT[venue.venueKind]]

  const sportDef = venue.venueKind === 'sport' && venue.sportType
    ? getSportById(venue.sportType)
    : undefined

  return {
    id: partnerVenueCourtId(venue.id),
    emoji: sportDef?.emoji ?? KIND_EMOJI[venue.venueKind],
    sport: sportDef?.label ?? KIND_SPORT_LABEL[venue.venueKind],
    name: venue.name,
    location: venue.city,
    address: venue.address,
    rating: 4.9,
    reviews: venue.bookingsCount || 12,
    price: venueMinPricePerHour(venue) || venue.basePricePerHour,
    color: sportDef?.color ?? KIND_COLOR[venue.venueKind],
    available: true,
    distance: venue.city,
    amenities: venue.amenities.length ? venue.amenities : ['Wi‑Fi'],
    description: venue.description || `${venue.name} — площадка партнёра BookinGo.`,
    photos,
    slots: DEFAULT_SLOTS,
    lat: venue.lat ?? undefined,
    lng: venue.lng ?? undefined,
    venueType: venue.venueKind === 'meeting' ? undefined : venue.venueKind,
    partnerVenueId: venue.id,
    coverImage: image,
    sportTypeId: venue.sportType ?? undefined,
  }
}
