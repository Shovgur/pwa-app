import type {
  CreateVenuePayload,
  PartnerVenue,
} from '../../lib/partnerVenues'
import { demoDelay, read, stripDemoVenueFields, update, type DemoVenue } from '../demoStore'
import { requireDemoCompanyId } from './demoSession'

export async function demoFetchPartnerVenues(): Promise<PartnerVenue[]> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  return read()
    .venues.filter(v => v.companyId === companyId)
    .map(stripDemoVenueFields)
}

export async function demoCreatePartnerVenue(payload: CreateVenuePayload): Promise<PartnerVenue> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const id = `dv-${Date.now()}`
  const venue: DemoVenue = {
    id,
    companyId,
    name: payload.name,
    venueKind: payload.venueKind,
    sportType: payload.sportType ?? null,
    city: payload.city,
    address: payload.address,
    description: payload.description,
    photos: payload.photos,
    basePricePerHour: payload.basePricePerHour,
    pricePerHour: payload.basePricePerHour,
    timePriceRules: payload.timePriceRules,
    durationRules: payload.durationRules,
    extraServices: payload.extraServices,
    amenities: payload.amenities,
    isActive: true,
    bookingsCount: 0,
    createdAt: new Date().toISOString(),
    lat: payload.lat ?? null,
    lng: payload.lng ?? null,
  }
  update(s => ({ ...s, venues: [...s.venues, venue] }))
  return stripDemoVenueFields(venue)
}

export async function demoSetPartnerVenueActive(id: string, isActive: boolean): Promise<PartnerVenue> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  let updated: DemoVenue | null = null
  update(s => {
    const venues = s.venues.map(v => {
      if (v.id !== id || v.companyId !== companyId) return v
      updated = { ...v, isActive }
      return updated
    })
    if (!updated) throw new Error('Площадка не найдена')
    return { ...s, venues }
  })
  return stripDemoVenueFields(updated!)
}

export async function demoUpdatePartnerVenue(
  id: string,
  payload: CreateVenuePayload,
): Promise<PartnerVenue> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  let updated: DemoVenue | null = null
  update(s => {
    const venues = s.venues.map(v => {
      if (v.id !== id || v.companyId !== companyId) return v
      updated = {
        ...v,
        ...payload,
        pricePerHour: payload.basePricePerHour,
      }
      return updated
    })
    if (!updated) throw new Error('Площадка не найдена')
    return { ...s, venues }
  })
  return stripDemoVenueFields(updated!)
}

export async function demoDeletePartnerVenue(id: string): Promise<void> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  update(s => ({
    ...s,
    venues: s.venues.filter(v => !(v.id === id && v.companyId === companyId)),
  }))
}
