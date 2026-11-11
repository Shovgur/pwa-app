import { describe, expect, it } from 'vitest'
import { partnerVenueToCourt, partnerVenueToVenueCard } from './venueAdapters'
import type { PartnerVenue } from '../lib/partnerVenues'

function venue(partial: Partial<PartnerVenue> = {}): PartnerVenue {
  return {
    id: '16',
    name: 'Test',
    venueKind: 'sport',
    sportType: 'tennis',
    city: 'Moscow',
    address: 'x',
    description: '',
    photos: [],
    basePricePerHour: 1000,
    pricePerHour: 1000,
    timePriceRules: [],
    durationRules: [],
    extraServices: [],
    amenities: [],
    isActive: true,
    bookingsCount: 40,
    createdAt: '2026-01-01T00:00:00.000Z',
    promotions: [],
    lat: null,
    lng: null,
    ...partial,
  }
}

describe('venueAdapters ratings', () => {
  it('не подставляет фейковый rating/reviews из bookingsCount', () => {
    const card = partnerVenueToVenueCard(venue({ bookingsCount: 40 }))
    expect(card.rating).toBeNull()

    const court = partnerVenueToCourt(venue({ bookingsCount: 40 }))
    expect(court.rating).toBeNull()
    expect(court.reviews).toBe(0)
  })

  it('прокидывает реальный ratingAvg при ratingCount≥1', () => {
    const court = partnerVenueToCourt(
      venue({ ratingAvg: 4.5, ratingCount: 3, bookingsCount: 40 }),
    )
    expect(court.rating).toBe(4.5)
    expect(court.reviews).toBe(3)
  })
})
