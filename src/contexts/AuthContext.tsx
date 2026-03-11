import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    name: 'Alex Nexus',
    email: 'demo@nexus.app',
    password: 'demo123',
    avatar: 'AN',
    role: 'Administrator',
  },
]

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('nexus_user')
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    await delay(1200)

    const found = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    setIsLoading(false)

    if (!found) {
      return { success: false, error: 'Неверный email или пароль' }
    }

    const { password: _, ...userData } = found
    setUser(userData)
    localStorage.setItem('nexus_user', JSON.stringify(userData))
    return { success: true }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true)
    await delay(1500)

    const exists = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (exists) {
      setIsLoading(false)
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }

    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      avatar: name.slice(0, 2).toUpperCase(),
      role: 'User',
    }

    MOCK_USERS.push({ ...newUser, password })
    setUser(newUser)
    localStorage.setItem('nexus_user', JSON.stringify(newUser))
    setIsLoading(false)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('nexus_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
