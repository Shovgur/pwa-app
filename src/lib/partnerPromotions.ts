import { API_BASE } from '../config/api'
import { getPartnerToken } from '../contexts/PartnerAuthContext'

export type PromoType =
  | 'time_window'
  | 'evening'
  | 'bring_friend'
  | 'low_occupancy'
  | 'custom'

export const PROMO_TYPE_META: Record<PromoType, { label: string; hint: string }> = {
  time_window: {
    label: 'Скидка в интервале',
    hint: 'Скидка в выбранные часы (например 10:00–14:00)',
  },
  evening: {
    label: 'Вечерняя скидка',
    hint: 'Скидка на слоты после 18:00',
  },
  bring_friend: {
    label: 'Приведи друга',
    hint: 'Скидка при бронировании вдвоём / с другом',
  },
  low_occupancy: {
    label: 'Мало броней',
    hint: 'Скидка в часы с низкой загрузкой',
  },
  custom: {
    label: 'Своя акция',
    hint: 'Произвольное предложение для клиентов',
  },
}

export interface VenuePromotion {
  id: string
  venueId: string
  venueName: string
  title: string
  description: string
  promoType: PromoType
  discountPercent: number | null
  discountAmount: number | null
  timeFrom: string | null
  timeTo: string | null
  startsAt: string | null
  endsAt: string | null
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

export interface CreatePromotionPayload {
  venueId: string
  title: string
  description: string
  promoType: PromoType
  discountPercent?: number | null
  discountAmount?: number | null
  timeFrom?: string | null
  timeTo?: string | null
  startsAt?: string | null
  endsAt?: string | null
  isActive?: boolean
  isFeatured?: boolean
}

export type UpdatePromotionPayload = Partial<Omit<CreatePromotionPayload, 'venueId'>>

function discountLabel(p: Pick<VenuePromotion, 'discountPercent' | 'discountAmount'>): string {
  if (p.discountPercent && p.discountPercent > 0) return `−${p.discountPercent}%`
  if (p.discountAmount && p.discountAmount > 0) return `−${p.discountAmount.toLocaleString('ru-RU')} ₽`
  return 'Акция'
}

export function promotionBadgeLabel(p: Pick<VenuePromotion, 'discountPercent' | 'discountAmount' | 'title'>): string {
  const d = discountLabel(p)
  return d === 'Акция' ? (p.title.slice(0, 24) || 'Акция') : d
}

async function partnerRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getPartnerToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new Error((data.error as string) || (data.message as string) || `Ошибка ${res.status}`)
  }
  return data as T
}

export async function fetchPartnerPromotions(): Promise<VenuePromotion[]> {
  try {
    const data = await partnerRequest<{ promotions: VenuePromotion[] }>('/partner/promotions')
    return data.promotions ?? []
  } catch {
    return []
  }
}

export async function createPartnerPromotion(payload: CreatePromotionPayload): Promise<VenuePromotion> {
  const data = await partnerRequest<{ promotion: VenuePromotion }>('/partner/promotions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data.promotion
}

export async function updatePartnerPromotion(
  id: string,
  payload: UpdatePromotionPayload,
): Promise<VenuePromotion> {
  const data = await partnerRequest<{ promotion: VenuePromotion }>(`/partner/promotions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return data.promotion
}

export async function deletePartnerPromotion(id: string): Promise<void> {
  await partnerRequest(`/partner/promotions/${id}`, { method: 'DELETE' })
}

export async function fetchPublicPromotions(): Promise<VenuePromotion[]> {
  try {
    const res = await fetch(`${API_BASE}/promotions`)
    if (!res.ok) return []
    const data = (await res.json().catch(() => ({}))) as { promotions?: VenuePromotion[] }
    return data.promotions ?? []
  } catch {
    return []
  }
}

export { discountLabel }
