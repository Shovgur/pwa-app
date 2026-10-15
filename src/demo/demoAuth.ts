import type { Partner } from '../contexts/PartnerAuthContext'
import type { User } from '../contexts/AuthContext'
import { read, type DemoClientAccount, type DemoPartnerAccount } from './demoStore'

export const DEMO_PASSWORD = 'demo'

export function findClientByLogin(login: string): DemoClientAccount | null {
  const v = login.trim().toLowerCase()
  const state = read()
  return (
    state.accounts.clients.find(
      c => c.email.toLowerCase() === v || c.phone === login.trim(),
    ) ?? null
  )
}

export function findPartnerByLogin(login: string): DemoPartnerAccount | null {
  const v = login.trim().toLowerCase()
  const state = read()
  return state.accounts.partners.find(p => p.login.toLowerCase() === v) ?? null
}

function partnerToProfile(p: DemoPartnerAccount): Partner {
  return {
    id: p.partnerId,
    companyName: p.companyName,
    login: p.login,
    email: p.email,
    phone: p.phone,
    city: p.city,
    commissionPercent: p.role === 'manager' ? 0 : p.commissionPercent,
    status: p.status,
    role: p.role,
    name: p.name,
    staffId: p.staffId,
  }
}

function clientToken(id: number): string {
  return `demo-client-${id}`
}

function partnerToken(login: string): string {
  return `demo-partner-${login}`
}

export function tryClientLogin(
  login: string,
  password: string,
): { token: string; user: User } | null {
  const client = findClientByLogin(login)
  if (!client || password !== DEMO_PASSWORD) return null
  return {
    token: clientToken(client.id),
    user: {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      avatar: client.name.trim().slice(0, 2).toUpperCase(),
    },
  }
}

export function tryPartnerLogin(
  login: string,
  password: string,
): { token: string; partner: Partner } | null {
  const account = findPartnerByLogin(login)
  if (!account || password !== DEMO_PASSWORD) return null
  return {
    token: partnerToken(account.login),
    partner: partnerToProfile(account),
  }
}

export type DemoSession =
  | { kind: 'client'; clientId: number }
  | { kind: 'partner'; login: string }

export function getDemoSessionFromToken(token: string): DemoSession | null {
  if (token.startsWith('demo-client-')) {
    const id = Number(token.slice('demo-client-'.length))
    if (!Number.isFinite(id)) return null
    return { kind: 'client', clientId: id }
  }
  if (token.startsWith('demo-partner-')) {
    const login = token.slice('demo-partner-'.length)
    if (!login) return null
    return { kind: 'partner', login }
  }
  return null
}

export function getPartnerProfileFromDemoToken(token: string): Partner | null {
  const session = getDemoSessionFromToken(token)
  if (!session || session.kind !== 'partner') return null
  const account = findPartnerByLogin(session.login)
  return account ? partnerToProfile(account) : null
}
