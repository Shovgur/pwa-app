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

const TOKEN_KEY = AUTH_TOKEN_KEY
const USER_KEY  = AUTH_USER_KEY

// ─── types ───────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  avatar: string
}

interface AuthCtx {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
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

async function apiFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message ?? `Ошибка ${res.status}`)
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

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await apiFetch<{ token: string; userId: number; email: string; name: string }>(
        '/auth/login',
        { email, password },
      )
      const u: User = {
        id:     data.userId,
        name:   data.name  ?? email,
        email:  data.email,
        avatar: makeAvatar(data.name ?? email),
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

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await apiFetch<{ token: string; userId: number; email: string; name: string }>(
        '/auth/register',
        { name, email, password },
      )
      const u: User = {
        id:     data.userId,
        name:   data.name  ?? name,
        email:  data.email,
        avatar: makeAvatar(data.name ?? name),
      }
      setUser(u)
      saveSession(data.token, u)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Ошибка регистрации' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearSession()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
