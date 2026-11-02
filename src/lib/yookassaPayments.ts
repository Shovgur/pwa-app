import { API_BASE } from '../config/api'
import { getAuthToken } from '../config/auth'
import {
  AuthExpiredError,
  clearClientAuthStorage,
  isAuthFailureStatus,
} from './authErrors'
import { isDemoMode } from '../demo/demoMode'

export interface YookassaCreatePaymentResult {
  confirmationUrl: string
  paymentId: string
  bookingId: number
}

export interface YookassaPaymentStatus {
  bookingId: number
  code: string | null
  paymentId: string | null
  paymentStatus: string
  price: number
  venueName: string | null
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  if (!token) {
    clearClientAuthStorage()
    throw new AuthExpiredError('Войдите в аккаунт, чтобы оплатить', 401)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (isAuthFailureStatus(res.status)) {
    clearClientAuthStorage()
    throw new AuthExpiredError(
      (data.message as string) || (data.error as string) || 'Сессия истекла',
      res.status,
    )
  }

  if (!res.ok) {
    throw new Error(
      (data.error as string) || (data.message as string) || `Ошибка ${res.status}`,
    )
  }

  return data as T
}

/** Создать платёж ЮKassa и получить URL формы оплаты. */
export function createYookassaPayment(bookingId: number) {
  return authRequest<YookassaCreatePaymentResult>('/payments/yookassa/create', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  })
}

export function fetchYookassaPaymentStatus(params: {
  bookingId?: number
  paymentId?: string
}) {
  const q = new URLSearchParams()
  if (params.bookingId != null) q.set('bookingId', String(params.bookingId))
  if (params.paymentId) q.set('paymentId', params.paymentId)
  return authRequest<YookassaPaymentStatus>(`/payments/yookassa/status?${q.toString()}`)
}

/**
 * После создания online-брони уйти на форму ЮKassa.
 * В демо-режиме ничего не делает (вызывающий код показывает success).
 * @returns true если был редирект (страница уходит)
 */
export async function redirectToYookassa(bookingId: number): Promise<boolean> {
  if (isDemoMode()) return false
  const { confirmationUrl } = await createYookassaPayment(bookingId)
  window.location.assign(confirmationUrl)
  return true
}
