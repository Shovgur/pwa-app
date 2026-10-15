import { API_BASE } from '../config/api'
import { isDemoMode } from '../demo/demoMode'
import { demoFetchPublicVenue, demoFetchPublicVenues } from '../demo/api/publicVenues'
import type { PartnerVenue } from './partnerVenues'

export type PublicVenue = PartnerVenue

export async function fetchPublicVenues(): Promise<PublicVenue[]> {
  if (isDemoMode()) return demoFetchPublicVenues()
  const res = await fetch(`${API_BASE}/venues`)
  if (!res.ok) {
    throw new Error(`Не удалось загрузить каталог (ошибка ${res.status})`)
  }
  const data = (await res.json().catch(() => ({}))) as { venues?: PublicVenue[] }
  return data.venues ?? []
}

export async function fetchPublicVenue(id: string): Promise<PublicVenue | null> {
  if (isDemoMode()) return demoFetchPublicVenue(id)
  const res = await fetch(`${API_BASE}/venues/${id}`)
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Не удалось загрузить площадку (ошибка ${res.status})`)
  }
  const data = (await res.json().catch(() => ({}))) as { venue?: PublicVenue }
  return data.venue ?? null
}
