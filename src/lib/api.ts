import { API_BASE } from '../config/api'

const TOKEN_KEY = 'bookingo_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
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
    removeToken()
    window.location.href = '/login'
    throw new Error('Сессия истекла. Войдите снова.')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.message ?? `Ошибка ${res.status}`)
  }

  return data as T
}

// ───────── Auth ─────────

export interface AuthResponse {
  success: boolean
  token: string
  user: { id: number; email: string; name: string }
}

export function apiRegister(name: string, email: string, password: string) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function apiLogin(email: string, password: string) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
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
