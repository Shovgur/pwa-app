import { API_BASE } from '../config/api'
import { buildLoginPayload, normalizePhone } from '../utils/authHelpers'
import { getAuthToken, setAuthToken, clearAuthToken } from '../config/auth'

export function getToken(): string | null {
  return getAuthToken()
}

export function setToken(token: string): void {
  setAuthToken(token)
}

export function removeToken(): void {
  clearAuthToken()
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    throw new Error('Сессия истекла. Войдите снова.')
  }

  const data = await res.json().catch(() => ({})) as Record<string, unknown>

  if (!res.ok) {
    const raw = (data.message ?? data.error) as string | undefined
    if (res.status === 404 && path.includes('send-code')) {
      throw new Error('Сервис отправки кода не настроен на сервере.')
    }
    if (raw === 'Registration failed') {
      throw new Error('Этот email уже зарегистрирован. Войдите или используйте другой адрес.')
    }
    throw new Error(raw ?? `Ошибка ${res.status}`)
  }

  return data as T
}

// ───────── Auth ─────────

export interface AuthResponse {
  success: boolean
  token: string
  user: { id: number; email: string; name: string }
}

export function apiRegister(name: string, email: string, password: string, phone?: string) {
  const body: Record<string, string> = { name, email, password }
  if (phone?.trim()) body.phone = normalizePhone(phone)
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function apiLogin(login: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(buildLoginPayload(login, password)),
  })
}

export function apiSendCode(email: string) {
  return request<{ success?: boolean; message?: string }>('/auth/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  })
}

export function apiVerifyCode(email: string, code: string) {
  return request<AuthResponse>('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), code: code.trim() }),
  })
}

// ───────── User ─────────

export interface UserProfile {
  id: number
  email: string
  name: string | null
  phone: string | null
  created_at: string
}

export function apiGetProfile() {
  return request<UserProfile>('/user/profile', {}, true)
}

// ───────── Bookings ─────────

export interface ApiBooking {
  id: number
  object_id: number
  object_name: string
  start_time: string
  end_time: string
  price: number
  status: string
  created_at: string
}

export function apiGetBookings() {
  return request<ApiBooking[]>('/bookings', {}, true)
}

// ───────── Objects ─────────

export interface ApiObject {
  id: number
  name: string
  category: string
  description: string | null
  price_per_hour: number
  is_active: boolean
}

export function apiGetObjects(category?: string) {
  const qs = category ? `?category=${encodeURIComponent(category)}` : ''
  return request<ApiObject[]>(`/objects${qs}`)
}

// ───────── Health ─────────

export function apiHealth() {
  return request<{ status: string }>('/health')
}
