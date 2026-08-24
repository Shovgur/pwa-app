import type { PartnerVenue, VenueExtraService } from '../lib/partnerVenues'

export function extraServicePrice(extra: VenueExtraService, durationMinutes: number, people = 1): number {
  const hours = durationMinutes / 60
  switch (extra.billing) {
    case 'per_hour':
      return extra.price * Math.max(1, Math.ceil(hours))
    case 'per_person':
      return extra.price * people
    default:
      return extra.price
  }
}

export function calcBookingTotal(
  hourlyRate: number,
  durationMinutes: number,
  partnerVenue: PartnerVenue | null,
  packageId: string | null,
  selectedExtraIds: string[],
): number {
  let base = 0
  let duration = durationMinutes

  if (partnerVenue && packageId) {
    const pkg = partnerVenue.durationRules.find(r => r.id === packageId)
    if (pkg) {
      base = pkg.price
      duration = pkg.hours * 60
    }
  }

  if (!base) {
    base = Math.round(hourlyRate * (durationMinutes / 60))
  }

  const extras = partnerVenue?.extraServices.filter(e => selectedExtraIds.includes(e.id)) ?? []
  const extrasSum = extras.reduce((s, e) => s + extraServicePrice(e, duration), 0)

  return base + extrasSum
}
