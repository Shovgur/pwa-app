import { API_BASE } from '../config/api'
import { getPartnerToken } from '../contexts/PartnerAuthContext'
import { isDemoMode } from '../demo/demoMode'

export interface PartnerTelegramLinkStatus {
  venueId: string
  venueName: string | null
  staffId: string | null
  linked: boolean
  isActive: boolean
  linkedAt: string | null
  pendingCode: string | null
  linkExpiresAt: string | null
  botUsername: string | null
  deepLink: string | null
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
  const data = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) {
    throw new Error((data.error as string) || (data.message as string) || `Ошибка ${res.status}`)
  }
  return data as T
}

export async function fetchTelegramLinks(): Promise<{
  botUsername: string | null
  links: PartnerTelegramLinkStatus[]
}> {
  if (isDemoMode()) {
    return { botUsername: null, links: [] }
  }
  return partnerRequest('/partner/telegram/links')
}

export async function createTelegramLink(venueId: string): Promise<PartnerTelegramLinkStatus> {
  if (isDemoMode()) {
    throw new Error('В демо-режиме Telegram недоступен')
  }
  const data = await partnerRequest<{ link: PartnerTelegramLinkStatus }>('/partner/telegram/links', {
    method: 'POST',
    body: JSON.stringify({ venueId }),
  })
  return data.link
}

export async function unlinkTelegram(venueId: string): Promise<void> {
  if (isDemoMode()) return
  await partnerRequest(`/partner/telegram/links/${encodeURIComponent(venueId)}`, {
    method: 'DELETE',
  })
}
