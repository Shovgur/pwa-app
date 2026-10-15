import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthToken } from '../config/auth'

/** Сессия клиента недействительна — нужно снова войти. */
export class AuthExpiredError extends Error {
  readonly status: number

  constructor(message = 'Сессия истекла. Войдите снова.', status = 401) {
    super(message)
    this.name = 'AuthExpiredError'
    this.status = status
  }
}

export function isAuthExpiredError(error: unknown): boolean {
  if (error instanceof AuthExpiredError) return true
  if (!(error instanceof Error)) return false
  const m = error.message.toLowerCase()
  return (
    m.includes('invalid token')
    || m.includes('сессия истекла')
    || m.includes('unauthorized')
    || m.includes('jwt expired')
  )
}

/** Чистим клиентскую сессию (без React) — AuthContext подхватит через storage/event. */
export function clearClientAuthStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  clearAuthToken()
  localStorage.removeItem('bookingo_user')
  localStorage.removeItem('nexus_user')
  window.dispatchEvent(new Event('bookingo:auth-expired'))
}

export function isAuthFailureStatus(status: number, body?: Record<string, unknown>): boolean {
  if (status === 401) return true
  if (status !== 403) return false
  const raw = String(body?.error ?? body?.message ?? '').toLowerCase()
  return raw.includes('invalid token') || raw.includes('unauthorized') || raw.includes('forbidden')
}
