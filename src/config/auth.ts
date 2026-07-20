export const AUTH_TOKEN_KEY = 'authToken'
export const AUTH_USER_KEY = 'authUser'

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  // legacy key from older api layer
  localStorage.removeItem('bookingo_token')
}
