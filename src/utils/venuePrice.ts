import type { PartnerVenue } from '../lib/partnerVenues'
import { formatMoney } from './partnerCrmFormat'

export function venueMinPricePerHour(venue: PartnerVenue): number {
  const prices = [
    venue.basePricePerHour,
    ...venue.timePriceRules.map(r => r.pricePerHour),
  ].filter(p => p > 0)
  return prices.length ? Math.min(...prices) : 0
}

export function venuePriceSummary(venue: PartnerVenue): string {
  const min = venueMinPricePerHour(venue)
  if (!min) return 'Цена не указана'

  const parts = [`от ${formatMoney(min)}/ч`]
  if (venue.timePriceRules.length) parts.push(`${venue.timePriceRules.length} тариф`)
  if (venue.durationRules.length) parts.push(`${venue.durationRules.length} пакет`)
  if (venue.extraServices.length) parts.push(`${venue.extraServices.length} услуг`)
  return parts.join(' · ')
}

export function parsePriceInput(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n)
}
