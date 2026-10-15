import type {
  CreatePromotionPayload,
  UpdatePromotionPayload,
  VenuePromotion,
} from '../../lib/partnerPromotions'
import { demoDelay, read, update } from '../demoStore'
import { requireDemoCompanyId } from './demoSession'

function companyVenueIds(companyId: string): Set<string> {
  return new Set(read().venues.filter(v => v.companyId === companyId).map(v => v.id))
}

export async function demoFetchPartnerPromotions(): Promise<VenuePromotion[]> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const ids = companyVenueIds(companyId)
  return read().promotions.filter(p => ids.has(p.venueId))
}

export async function demoCreatePartnerPromotion(
  payload: CreatePromotionPayload,
): Promise<VenuePromotion> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const venue = read().venues.find(v => v.id === payload.venueId && v.companyId === companyId)
  if (!venue) throw new Error('Площадка не найдена')
  const promotion: VenuePromotion = {
    id: `promo-${Date.now()}`,
    venueId: payload.venueId,
    venueName: venue.name,
    title: payload.title,
    description: payload.description,
    promoType: payload.promoType,
    discountPercent: payload.discountPercent ?? null,
    discountAmount: payload.discountAmount ?? null,
    timeFrom: payload.timeFrom ?? null,
    timeTo: payload.timeTo ?? null,
    startsAt: payload.startsAt ?? null,
    endsAt: payload.endsAt ?? null,
    isActive: payload.isActive ?? true,
    isFeatured: payload.isFeatured ?? false,
    createdAt: new Date().toISOString(),
  }
  update(s => ({ ...s, promotions: [...s.promotions, promotion] }))
  return promotion
}

export async function demoUpdatePartnerPromotion(
  id: string,
  payload: UpdatePromotionPayload,
): Promise<VenuePromotion> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const ids = companyVenueIds(companyId)
  let updated: VenuePromotion | null = null
  update(s => {
    const promotions = s.promotions.map(p => {
      if (p.id !== id || !ids.has(p.venueId)) return p
      updated = { ...p, ...payload }
      return updated
    })
    if (!updated) throw new Error('Акция не найдена')
    return { ...s, promotions }
  })
  return updated!
}

export async function demoDeletePartnerPromotion(id: string): Promise<void> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const ids = companyVenueIds(companyId)
  update(s => ({
    ...s,
    promotions: s.promotions.filter(p => !(p.id === id && ids.has(p.venueId))),
  }))
}

export async function demoFetchPublicPromotions(): Promise<VenuePromotion[]> {
  await demoDelay()
  return read().promotions.filter(p => p.isActive)
}
