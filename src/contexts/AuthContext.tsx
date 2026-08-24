import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { API_BASE } from '../config/api'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, clearAuthToken } from '../config/auth'
import { buildLoginPayload, isDuplicateEmailError, isValidPhone, normalizePhone } from '../utils/authHelpers'

const TOKEN_KEY = AUTH_TOKEN_KEY
const USER_KEY  = AUTH_USER_KEY

// ─── types ───────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  avatar: string
}

interface AuthCtx {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (login: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string; email?: string; emailExists?: boolean }>
  sendCode: (email: string) => Promise<{ success: boolean; error?: string }>
  verifyCodeAndLogin: (
    email: string,
    code: string,
    profile?: { name?: string; phone?: string },
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

// ─── helpers ─────────────────────────────────────────────
function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  clearAuthToken()
  // clean up legacy keys
  localStorage.removeItem('bookingo_user')
  localStorage.removeItem('nexus_user')
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function makeAvatar(name?: string | null): string {
  if (!name) return '?'
  return name.trim().slice(0, 2).toUpperCase()
}

function parseApiError(data: Record<string, unknown>, status: number): string {
  const raw = String(data.message ?? data.error ?? '')
  if (isDuplicateEmailError(raw, status)) return 'Этот email уже зарегистрирован'
  if (raw) return raw
  return `Ошибка ${status}`
}

class ApiRequestError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({})) as Record<string, unknown>
  if (!res.ok) throw new ApiRequestError(parseApiError(data, res.status), res.status)
  return data as T
}

// ─── context ─────────────────────────────────────────────
const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Restore session instantly from localStorage — no network request
  const [user, setUser] = useState<User | null>(() => loadSession())
  const [isLoading, setIsLoading] = useState(false)

  // Clean up legacy keys once on mount
  useEffect(() => {
    const legacy = localStorage.getItem('bookingo_user') ?? localStorage.getItem('nexus_user')
    if (legacy && !localStorage.getItem(USER_KEY)) {
      if (!localStorage.getItem(TOKEN_KEY)) clearSession()
    }
  }, [])

  const login = useCallback(async (loginValue: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await apiFetch<{ token: string; userId: number; email: string; name: string; phone?: string | null }>(
        '/auth/login',
        buildLoginPayload(loginValue, password),
      )
      const u: User = {
        id:     data.userId,
        name:   data.name  ?? loginValue,
        email:  data.email,
        phone:  data.phone ?? null,
        avatar: makeAvatar(data.name ?? loginValue),
      }
      setUser(u)
      saveSession(data.token, u)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Ошибка входа' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true)
    try {
      if (!phone?.trim() || !isValidPhone(phone)) {
        return { success: false, error: 'Укажите корректный номер телефона' }
      }
      const payload: Record<string, string> = { name, email, password, phone: normalizePhone(phone) }

      await apiFetch<{ token?: string; userId: number; email: string; name: string; phone?: string | null }>(
        '/auth/register',
        payload,
      )
      // Сессию не создаём — вход только после verify-code
      return { success: true, email }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка регистрации'
      const status = e instanceof ApiRequestError ? e.status : undefined
      const emailExists = isDuplicateEmailError(message, status)
      return {
        success: false,
        error: emailExists ? 'Этот email уже зарегистрирован' : message,
        emailExists,
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendCode = useCallback(async (email: string) => {
    try {
      await apiFetch<{ success?: boolean; message?: string }>(
        '/auth/send-code',
        { email: email.trim() },
      )
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Не удалось отправить код' }
    }
  }, [])

  const verifyCodeAndLogin = useCallback(async (
    email: string,
    code: string,
    profile?: { name?: string; phone?: string },
  ) => {
    setIsLoading(true)
    try {
      const body: Record<string, string> = { email: email.trim(), code: code.trim() }
      if (profile?.name?.trim()) body.name = profile.name.trim()
      if (profile?.phone?.trim()) body.phone = normalizePhone(profile.phone)

      const data = await apiFetch<{ token: string; userId: number; email: string; name: string; phone?: string | null }>(
        '/auth/verify-code',
        body,
      )
      const u: User = {
        id:     data.userId,
        name:   data.name ?? email,
        email:  data.email,
        phone:  data.phone ?? null,
        avatar: makeAvatar(data.name ?? email),
      }
      setUser(u)
      saveSession(data.token, u)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Неверный код' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearSession()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, sendCode, verifyCodeAndLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
