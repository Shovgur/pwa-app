import { API_BASE } from '../config/api'
import { getPartnerToken } from '../contexts/PartnerAuthContext'
import { features } from '../config/features'
import { isDemoMode } from '../demo/demoMode'

export const CLIENT_REVIEW_PRESETS = [
  { id: 'on_time', label: 'Вовремя' },
  { id: 'polite', label: 'Вежливый' },
  { id: 'careful', label: 'Аккуратный' },
  { id: 'no_show', label: 'Не пришёл' },
  { id: 'damage', label: 'Повреждения' },
  { id: 'mess', label: 'Беспорядок' },
  { id: 'unpaid', label: 'Не оплатил' },
  { id: 'other', label: 'Другое' },
] as const

export interface ClientRisk {
  warning: boolean
  reasons: string[]
  networkWarning?: boolean
}

export interface ClientReview {
  id: string
  rating: number
  presets: string[]
  text: string
  createdAt: string
}

async function partnerRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getPartnerToken()
  if (!token) throw new Error('Войдите как партнёр')
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  })
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new Error((data.error as string) || `Ошибка ${res.status}`)
  }
  return data as T
}

export function clientReviewsEnabled(): boolean {
  return features.clientReviews
}

export async function createClientReview(input: {
  bookingId: string
  rating: number
  presets: string[]
  text: string
}): Promise<ClientReview> {
  if (!features.clientReviews) throw new Error('Оценки клиентов пока недоступны')
  if (isDemoMode()) {
    return {
      id: `demo-${input.bookingId}`,
      rating: input.rating,
      presets: input.presets,
      text: input.text,
      createdAt: new Date().toISOString(),
    }
  }
  const data = await partnerRequest<{ review: ClientReview }>(
    `/partner/bookings/${input.bookingId}/client-review`,
    {
      method: 'POST',
      body: JSON.stringify({
        rating: input.rating,
        presets: input.presets,
        text: input.text,
      }),
    },
  )
  return data.review
}

export async function fetchClientReview(bookingId: string): Promise<ClientReview | null> {
  if (!features.clientReviews) return null
  if (isDemoMode()) return null
  const data = await partnerRequest<{ review: ClientReview | null }>(
    `/partner/bookings/${bookingId}/client-review`,
  )
  return data.review
}

export async function fetchClientRisk(bookingId: string): Promise<ClientRisk> {
  if (!features.clientReviews) return { warning: false, reasons: [] }
  if (isDemoMode()) return { warning: false, reasons: [] }
  const data = await partnerRequest<{ clientRisk: ClientRisk }>(
    `/partner/bookings/${bookingId}/client-risk`,
  )
  return data.clientRisk ?? { warning: false, reasons: [] }
}
