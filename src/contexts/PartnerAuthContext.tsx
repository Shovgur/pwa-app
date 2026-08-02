import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { API_BASE } from '../config/api'

const PARTNER_TOKEN_KEY = 'partnerAuthToken'
const PARTNER_USER_KEY = 'partnerAuthUser'

// ─── types ───────────────────────────────────────────────
export interface Partner {
  id: number
  login: string
  name: string
}

interface PartnerAuthCtx {
  partner: Partner | null
  isPartnerAuthenticated: boolean
  isLoading: boolean
  loginPartner: (login: string, password: string) => Promise<{ success: boolean; error?: string }>
  logoutPartner: () => void
}

// ─── helpers ─────────────────────────────────────────────
function saveSession(token: string, partner: Partner) {
  localStorage.setItem(PARTNER_TOKEN_KEY, token)
  localStorage.setItem(PARTNER_USER_KEY, JSON.stringify(partner))
}

function clearSession() {
  localStorage.removeItem(PARTNER_TOKEN_KEY)
  localStorage.removeItem(PARTNER_USER_KEY)
}

function loadSession(): Partner | null {
  try {
    const raw = localStorage.getItem(PARTNER_USER_KEY)
    return raw ? (JSON.parse(raw) as Partner) : null
  } catch {
    return null
  }
}

export function getPartnerToken(): string | null {
  return localStorage.getItem(PARTNER_TOKEN_KEY)
}

// ─── context ─────────────────────────────────────────────
const PartnerAuthContext = createContext<PartnerAuthCtx | null>(null)

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<Partner | null>(() => loadSession())
  const [isLoading, setIsLoading] = useState(false)

  const loginPartner = useCallback(async (login: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/partner/login`, {
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

      const p: Partner = {
        id:    Number(data.partnerId ?? data.id ?? 0),
        login: (data.login as string | undefined) ?? login,
        name:  (data.name as string | undefined) ?? (data.venueName as string | undefined) ?? login,
      }
      setPartner(p)
      saveSession(token, p)
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Ошибка входа' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logoutPartner = useCallback(() => {
    setPartner(null)
    clearSession()
  }, [])

  return (
    <PartnerAuthContext.Provider
      value={{ partner, isPartnerAuthenticated: !!partner, isLoading, loginPartner, logoutPartner }}
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
