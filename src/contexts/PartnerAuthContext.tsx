import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { API_BASE } from '../config/api'
import { parsePartnerRole, type PartnerRole } from '../utils/partnerAccess'

const PARTNER_TOKEN_KEY = 'partnerAuthToken'
const PARTNER_USER_KEY = 'partnerAuthUser'

// ─── types ───────────────────────────────────────────────
export interface Partner {
  id: number
  companyName: string
  login: string
  email: string
  phone: string | null
  city: string | null
  commissionPercent: number
  status: string
  /** owner — владелец площадки, manager — сотрудник, работающий в CRM */
  role: PartnerRole
  /** Имя сотрудника; у владельца пусто — там используется название компании */
  name: string | null
}

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  newLogin: string
}

interface PartnerAuthCtx {
  partner: Partner | null
  isPartnerAuthenticated: boolean
  /** Фоновая проверка сессии при старте приложения (для защищённых роутов) */
  isInitializing: boolean
  /** Явные действия пользователя: вход, смена пароля */
  isLoading: boolean
  loginPartner: (login: string, password: string) => Promise<{ success: boolean; error?: string }>
  logoutPartner: () => void
  refreshPartnerProfile: () => Promise<void>
  changePartnerPassword: (payload: ChangePasswordPayload) => Promise<{ success: boolean; error?: string }>
}

// ─── localStorage helpers ────────────────────────────────
function readToken(): string | null {
  return localStorage.getItem(PARTNER_TOKEN_KEY)
}

function saveToken(token: string) {
  localStorage.setItem(PARTNER_TOKEN_KEY, token)
}

function saveProfile(p: Partner) {
  localStorage.setItem(PARTNER_USER_KEY, JSON.stringify(p))
}

function loadProfile(): Partner | null {
  try {
    const raw = localStorage.getItem(PARTNER_USER_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw) as Partner
    // Профили, закэшированные до появления ролей, поля role не содержат
    return {
      ...cached,
      role: parsePartnerRole(cached.role),
      name: cached.name ?? null,
    }
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem(PARTNER_TOKEN_KEY)
  localStorage.removeItem(PARTNER_USER_KEY)
}

/** Приводим ответ бэкенда (snake_case) к camelCase-модели на фронте. */
function mapProfile(data: Record<string, unknown>): Partner {
  return {
    id:                Number(data.id ?? 0),
    companyName:       (data.company_name as string | undefined) ?? '',
    login:             (data.login as string | undefined) ?? '',
    email:             (data.email as string | undefined) ?? '',
    phone:             (data.phone as string | undefined) ?? null,
    city:              (data.city as string | undefined) ?? null,
    commissionPercent: Number(data.commission_percent ?? 0),
    status:            (data.status as string | undefined) ?? 'active',
    role:              parsePartnerRole(data.role),
    name:              (data.name as string | undefined) ?? null,
  }
}

/** Читается извне (например, для ручных Bearer-запросов к /api/partner/*). */
export function getPartnerToken(): string | null {
  return readToken()
}

const PROFILE_FETCH_TIMEOUT_MS = 8_000
const AUTH_FETCH_TIMEOUT_MS = 12_000

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = AUTH_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function fetchPartnerProfile(token: string): Promise<Response> {
  return fetchWithTimeout(
    `${API_BASE}/partner/profile`,
    { headers: { Authorization: `Bearer ${token}` } },
    PROFILE_FETCH_TIMEOUT_MS,
  )
}

// ─── context ─────────────────────────────────────────────
const PartnerAuthContext = createContext<PartnerAuthCtx | null>(null)

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner]   = useState<Partner | null>(() => loadProfile())
  const [hasToken, setHasToken] = useState<boolean>(() => !!readToken())
  const [isInitializing, setIsInitializing] = useState<boolean>(() => !!readToken())
  const [isLoading, setIsLoading] = useState(false)
  const refreshInFlight = useRef<Promise<void> | null>(null)

  const refreshPartnerProfile = useCallback(async (options?: { background?: boolean }) => {
    const token = readToken()
    if (!token) {
      setIsInitializing(false)
      return
    }

    if (refreshInFlight.current) {
      await refreshInFlight.current
      return
    }

    const run = (async () => {
      if (!options?.background) setIsLoading(true)
      try {
        const res = await fetchPartnerProfile(token)
        if (res.status === 401) {
          clearSession()
          setHasToken(false)
          setPartner(null)
          return
        }
        const data = await res.json().catch(() => ({})) as Record<string, unknown>
        if (!res.ok) return
        const p = mapProfile(data)
        setPartner(p)
        saveProfile(p)
      } catch {
        // сеть недоступна / таймаут — не блокируем UI, работаем с кэшем
      } finally {
        if (!options?.background) setIsLoading(false)
        setIsInitializing(false)
      }
    })()

    refreshInFlight.current = run
    try {
      await run
    } finally {
      refreshInFlight.current = null
    }
  }, [])

  // Восстановление сессии при обновлении страницы — в фоне, без блокировки /login
  useEffect(() => {
    if (readToken()) void refreshPartnerProfile({ background: true })
    else setIsInitializing(false)
  }, [refreshPartnerProfile])

  const loginPartner = useCallback(async (login: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetchWithTimeout(`${API_BASE}/partner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), password }),
      })
      const data = await res.json().catch(() => ({})) as Record<string, unknown>

      if (!res.ok) {
        const raw = (data.message ?? data.error) as string | undefined
        throw new Error(raw ?? 'Неверный логин или пароль')
      }

      const token = data.token as string | undefined
      if (!token) throw new Error('Сервер не вернул токен авторизации')

      saveToken(token)
      setHasToken(true)

      // Профиль может прийти сразу в ответе логина — используем как временный
      // кэш, но всё равно уточняем через /partner/profile.
      if (data.company_name || data.companyName) {
        const p = mapProfile(data)
        setPartner(p)
        saveProfile(p)
      }
      await refreshPartnerProfile({ background: true })
      return { success: true }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return { success: false, error: 'Сервер не отвечает. Проверьте, что бэкенд запущен.' }
      }
      return { success: false, error: e instanceof Error ? e.message : 'Ошибка входа' }
    } finally {
      setIsLoading(false)
    }
  }, [refreshPartnerProfile])

  const logoutPartner = useCallback(() => {
    setPartner(null)
    setHasToken(false)
    clearSession()
  }, [])

  const changePartnerPassword = useCallback(async (payload: ChangePasswordPayload) => {
    const token = readToken()
    try {
      const res = await fetch(`${API_BASE}/partner/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({})) as Record<string, unknown>

      if (!res.ok) {
        const raw = (data.message ?? data.error) as string | undefined
        throw new Error(raw ?? 'Не удалось обновить данные')
      }

      // Логин мог поменяться — обновляем локальный профиль без лишнего запроса
      setPartner(prev => {
        if (!prev) return prev
        const next: Partner = { ...prev, login: payload.newLogin.trim() || prev.login }
        saveProfile(next)
        return next
      })

      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Не удалось обновить данные' }
    }
  }, [])

  return (
    <PartnerAuthContext.Provider
      value={{
        partner,
        isPartnerAuthenticated: hasToken,
        isInitializing,
        isLoading,
        loginPartner,
        logoutPartner,
        refreshPartnerProfile,
        changePartnerPassword,
      }}
    >
      {children}
    </PartnerAuthContext.Provider>
  )
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext)
  if (!ctx) throw new Error('usePartnerAuth must be used within <PartnerAuthProvider>')
  return ctx
}
