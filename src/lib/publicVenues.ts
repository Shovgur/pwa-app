import { API_BASE } from '../config/api'
import type { PartnerVenue } from './partnerVenues'

export type PublicVenue = PartnerVenue

export async function fetchPublicVenues(): Promise<PublicVenue[]> {
  const res = await fetch(`${API_BASE}/venues`)
  if (!res.ok) return []
  const data = (await res.json().catch(() => ({}))) as { venues?: PublicVenue[] }
  return data.venues ?? []
}

export async function fetchPublicVenue(id: string): Promise<PublicVenue | null> {
  const res = await fetch(`${API_BASE}/venues/${id}`)
  if (!res.ok) return null
  const data = (await res.json().catch(() => ({}))) as { venue?: PublicVenue }
  return data.venue ?? null
}
