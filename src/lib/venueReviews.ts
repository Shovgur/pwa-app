import { API_BASE } from '../config/api'
import { getAuthToken } from '../config/auth'
import { getPartnerToken } from '../contexts/PartnerAuthContext'
import { features } from '../config/features'
import { isDemoMode } from '../demo/demoMode'
import {
  demoCreateVenueReview,
  demoFetchPendingVenueReviews,
  demoFetchPublicVenueReviews,
  demoFetchPublicVenueReviewSummary,
  demoFetchPartnerVenueReviews,
  demoReplyPartnerVenueReview,
  demoDeleteOwnVenueReview,
} from '../demo/api/venueReviews'

export const VENUE_REVIEW_TAGS = [
  { id: 'clean', label: 'Чистота' },
  { id: 'location', label: 'Локация' },
  { id: 'staff', label: 'Персонал' },
  { id: 'equipment', label: 'Оборудование' },
  { id: 'value', label: 'Цена/качество' },
  { id: 'atmosphere', label: 'Атмосфера' },
] as const

export type VenueReviewTagId = (typeof VENUE_REVIEW_TAGS)[number]['id']

export interface VenueReviewSummary {
  ratingAvg: number | null
  ratingCount: number
}

export interface PublicVenueReview {
  id: string
  rating: number
  tags: string[]
  text: string
  createdAt: string
  authorDisplayName: string
  reply: { text: string; createdAt: string } | null
}

export interface PendingVenueReview {
  partnerBookingId: string
  code: string | null
  venueId: string
  venueName: string
  slotEnd: string
  deadline: string
}

export interface PartnerVenueReview {
  id: string
  venueId: string
  venueName: string
  rating: number
  tags: string[]
  text: string
  status: string
  createdAt: string
  authorDisplayName: string
  reply: { id: string; text: string; createdAt: string } | null
}

async function clientRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  if (!token) throw new Error('Войдите в аккаунт')
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
    throw new Error((data.error as string) || (data.message as string) || `Ошибка ${res.status}`)
  }
  return data as T
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
    throw new Error((data.error as string) || (data.message as string) || `Ошибка ${res.status}`)
  }
  return data as T
}

export function venueReviewsEnabled(): boolean {
  return features.venueReviews
}

export async function fetchPublicVenueReviews(venueId: string): Promise<PublicVenueReview[]> {
  if (!features.venueReviews) return []
  if (isDemoMode()) return demoFetchPublicVenueReviews(venueId)
  const data = await fetch(`${API_BASE}/venues/${venueId}/reviews`)
    .then((r) => r.json() as Promise<{ reviews?: PublicVenueReview[]; error?: string }>)
  if ((data as { error?: string }).error === 'feature_disabled') return []
  return data.reviews ?? []
}

export async function fetchPublicVenueReviewSummary(venueId: string): Promise<VenueReviewSummary> {
  if (!features.venueReviews) return { ratingAvg: null, ratingCount: 0 }
  if (isDemoMode()) return demoFetchPublicVenueReviewSummary(venueId)
  const res = await fetch(`${API_BASE}/venues/${venueId}/reviews/summary`)
  const data = (await res.json().catch(() => ({}))) as VenueReviewSummary & { error?: string }
  if (!res.ok || data.error === 'feature_disabled') return { ratingAvg: null, ratingCount: 0 }
  return {
    ratingAvg: data.ratingAvg ?? null,
    ratingCount: data.ratingCount ?? 0,
  }
}

export async function fetchPendingVenueReviews(): Promise<PendingVenueReview[]> {
  if (!features.venueReviews) return []
  if (isDemoMode()) return demoFetchPendingVenueReviews()
  const data = await clientRequest<{ pending: PendingVenueReview[] }>('/me/reviews/pending')
  return data.pending ?? []
}

export async function createVenueReview(input: {
  bookingId: number | string
  rating: number
  tags: string[]
  text: string
}): Promise<void> {
  if (!features.venueReviews) throw new Error('Отзывы пока недоступны')
  if (isDemoMode()) {
    demoCreateVenueReview(input)
    return
  }
  await clientRequest(`/bookings/${input.bookingId}/review`, {
    method: 'POST',
    body: JSON.stringify({
      rating: input.rating,
      tags: input.tags,
      text: input.text,
    }),
  })
}

export async function deleteOwnVenueReview(reviewId: string): Promise<void> {
  if (!features.venueReviews) throw new Error('Отзывы пока недоступны')
  if (isDemoMode()) {
    demoDeleteOwnVenueReview(reviewId)
    return
  }
  await clientRequest(`/me/reviews/${reviewId}`, { method: 'DELETE' })
}

export async function fetchPartnerVenueReviews(opts?: {
  venueId?: string
  status?: string
  replied?: boolean
}): Promise<PartnerVenueReview[]> {
  if (!features.venueReviews) return []
  if (isDemoMode()) return demoFetchPartnerVenueReviews(opts)
  const q = new URLSearchParams()
  if (opts?.venueId) q.set('venueId', opts.venueId)
  if (opts?.status) q.set('status', opts.status)
  if (opts?.replied != null) q.set('replied', String(opts.replied))
  const qs = q.toString()
  const data = await partnerRequest<{ reviews: PartnerVenueReview[] }>(
    `/partner/reviews${qs ? `?${qs}` : ''}`,
  )
  return data.reviews ?? []
}

export async function replyPartnerVenueReview(reviewId: string, text: string): Promise<void> {
  if (!features.venueReviews) throw new Error('Отзывы пока недоступны')
  if (isDemoMode()) {
    demoReplyPartnerVenueReview(reviewId, text)
    return
  }
  await partnerRequest(`/partner/reviews/${reviewId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}
