import { getAuthToken } from '../../config/auth'
import { getPartnerToken } from '../../contexts/PartnerAuthContext'
import { findPartnerByLogin, getDemoSessionFromToken } from '../demoAuth'
import { read } from '../demoStore'

export function getDemoClientIdFromAuth(): number | null {
  const token = getAuthToken()
  if (!token) return null
  const session = getDemoSessionFromToken(token)
  if (!session || session.kind !== 'client') return null
  return session.clientId
}

export function getDemoPartnerCompanyId(): string | null {
  const token = getPartnerToken()
  if (!token) return null
  const session = getDemoSessionFromToken(token)
  if (!session || session.kind !== 'partner') return null
  const account = findPartnerByLogin(session.login)
  return account?.companyId ?? null
}

export function getDemoPartnerLogin(): string | null {
  const token = getPartnerToken()
  if (!token) return null
  const session = getDemoSessionFromToken(token)
  if (!session || session.kind !== 'partner') return null
  return session.login
}

export function requireDemoClientId(): number {
  const id = getDemoClientIdFromAuth()
  if (id == null) throw new Error('Требуется авторизация клиента')
  return id
}

export function requireDemoCompanyId(): string {
  const id = getDemoPartnerCompanyId()
  if (!id) throw new Error('Требуется авторизация партнёра')
  return id
}

export function findClientInStore(clientId: number) {
  return read().accounts.clients.find(c => c.id === clientId) ?? null
}
