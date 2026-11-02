import type {
  CreateVenuePayload,
  PartnerVenue,
} from '../../lib/partnerVenues'
import { demoDelay, read, stripDemoVenueFields, update, type DemoVenue } from '../demoStore'
import { getDemoPartnerAccount, filterVenuesForViewer } from './managerScope'
import { requireDemoCompanyId } from './demoSession'

export async function demoFetchPartnerVenues(): Promise<PartnerVenue[]> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const list = read().venues.filter(v => v.companyId === companyId)
  return filterVenuesForViewer(list).map(stripDemoVenueFields)
}

export async function demoCreatePartnerVenue(payload: CreateVenuePayload): Promise<PartnerVenue> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const account = getDemoPartnerAccount()
  const id = `dv-${Date.now()}`
  const managedByStaffId =
    account?.role === 'manager' && account.staffId != null
      ? String(account.staffId)
      : null
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
    managedByStaffId,
    managedByName: account?.role === 'manager' ? account.name : null,
    canEdit: true,
  }
  update(s => ({ ...s, venues: [...s.venues, venue] }))
  return stripDemoVenueFields(venue)
}

export async function demoSetPartnerVenueActive(id: string, isActive: boolean): Promise<PartnerVenue> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const scoped = filterVenuesForViewer(read().venues.filter(v => v.companyId === companyId))
  if (!scoped.some(v => v.id === id)) throw new Error('Нет доступа к площадке')
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
  const scoped = filterVenuesForViewer(read().venues.filter(v => v.companyId === companyId))
  if (!scoped.some(v => v.id === id)) throw new Error('Нет доступа к площадке')
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

export async function demoAssignVenueManager(
  venueId: string,
  managedByStaffId: string | null,
): Promise<PartnerVenue> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const account = getDemoPartnerAccount()
  if (account?.role !== 'owner') throw new Error('Только владелец назначает менеджера')

  let managerName: string | null = null
  if (managedByStaffId) {
    const staff = read().staff.find(s => s.id === managedByStaffId && s.companyId === companyId)
    if (!staff || !staff.isActive) throw new Error('Сотрудник не найден')
    managerName = staff.name
  }

  let updated: DemoVenue | null = null
  update(s => {
    const venues = s.venues.map(v => {
      if (v.id !== venueId || v.companyId !== companyId) return v
      updated = {
        ...v,
        managedByStaffId,
        managedByName: managerName,
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
  const scoped = filterVenuesForViewer(read().venues.filter(v => v.companyId === companyId))
  if (!scoped.some(v => v.id === id)) throw new Error('Нет доступа к площадке')
  update(s => ({
    ...s,
    venues: s.venues.filter(v => !(v.id === id && v.companyId === companyId)),
  }))
}
