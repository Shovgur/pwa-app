import { findPartnerByLogin } from '../demoAuth'
import { read, type DemoVenue } from '../demoStore'
import { getDemoPartnerLogin } from './demoSession'

/** Текущий демо-аккаунт партнёра (owner|manager). */
export function getDemoPartnerAccount() {
  const login = getDemoPartnerLogin()
  if (!login) return null
  return findPartnerByLogin(login)
}

export function venueManagedByAccount(
  venue: Pick<DemoVenue, 'managedByStaffId'>,
  account: { staffId: number | null; staffRecordId: string | null },
): boolean {
  const mid = venue.managedByStaffId != null ? String(venue.managedByStaffId) : ''
  if (!mid) return false
  if (account.staffRecordId && mid === String(account.staffRecordId)) return true
  if (account.staffId != null && mid === String(account.staffId)) return true
  return false
}

/** Id площадок, доступных текущему менеджеру. Owner → все компании. */
export function getScopedVenueIds(companyId: string): Set<string> | null {
  const account = getDemoPartnerAccount()
  if (!account) return new Set()
  const venues = read().venues.filter(v => v.companyId === companyId)
  if (account.role !== 'manager') {
    return null // null = без фильтра (все)
  }
  return new Set(
    venues.filter(v => venueManagedByAccount(v, account)).map(v => v.id),
  )
}

export function filterVenuesForViewer<T extends DemoVenue>(venues: T[]): T[] {
  const account = getDemoPartnerAccount()
  if (!account || account.role !== 'manager') {
    return venues.map(v => ({
      ...v,
      canEdit: account?.role === 'owner' ? false : v.canEdit,
    }))
  }
  return venues
    .filter(v => venueManagedByAccount(v, account))
    .map(v => ({ ...v, canEdit: true }))
}
