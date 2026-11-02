export const AUTH_TOKEN_KEY = 'authToken'
export const AUTH_USER_KEY = 'authUser'

const COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60

function writeAuthCookie(token: string): void {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`
}

function readAuthCookie(): string | null {
  if (typeof document === 'undefined') return null
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed.startsWith(`${AUTH_TOKEN_KEY}=`)) continue
    return decodeURIComponent(trimmed.slice(AUTH_TOKEN_KEY.length + 1))
  }
  return null
}

function clearAuthCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_TOKEN_KEY}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function getAuthToken(): string | null {
  const fromLs = localStorage.getItem(AUTH_TOKEN_KEY)
  if (fromLs) return fromLs
  // После редиректа с ЮKassa иногда localStorage пуст в in-app браузере,
  // а SameSite=Lax cookie на top-level return ещё доступна.
  const fromCookie = readAuthCookie()
  if (fromCookie) {
    localStorage.setItem(AUTH_TOKEN_KEY, fromCookie)
    return fromCookie
  }
  return null
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  writeAuthCookie(token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  // legacy key from older api layer
  localStorage.removeItem('bookingo_token')
  clearAuthCookie()
}
