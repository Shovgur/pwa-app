/**
 * Роли внутри кабинета партнёра.
 *
 * Вход единый — /login, таб «Я партнёр». Роль приходит с бэкенда вместе с
 * токеном, поэтому отдельной точки входа для CRM не нужно.
 *
 * ВАЖНО: скрытие блоков по капабилити — это UX, а не защита. Бэкенд обязан
 * не отдавать токену управляющего ни commission_percent, ни финансовые
 * эндпоинты вообще.
 */
export type PartnerRole = 'owner' | 'manager'

export const ROLE_META: Record<PartnerRole, { label: string; color: string }> = {
  owner:   { label: 'ВЛАДЕЛЕЦ',    color: '#22c55e' },
  manager: { label: 'УПРАВЛЯЮЩИЙ', color: '#3b82f6' },
}

export type Capability =
  | 'overview'    // сводка по аккаунту
  | 'finances'    // комиссия, выручка, финансовая аналитика
  | 'companyInfo' // реквизиты компании
  | 'staff'       // управление сотрудниками
  | 'venues'      // управление площадками
  | 'crm'         // работа с бронями и оплатами

const CAPABILITIES: Record<PartnerRole, readonly Capability[]> = {
  owner:   ['overview', 'finances', 'companyInfo', 'staff', 'venues'],
  manager: ['crm'],
}

export function can(role: PartnerRole | null | undefined, cap: Capability): boolean {
  return role ? CAPABILITIES[role].includes(cap) : false
}

/** Стартовая страница кабинета — у обеих ролей своя «Главная». */
export function partnerHomeRoute(_role?: PartnerRole | null): string {
  return '/partner/dashboard'
}

/** Страница списка броней в кабинете партнёра */
export const PARTNER_BOOKINGS_PATH = '/partner/bookings'

/** Управление площадками партнёра */
export const PARTNER_VENUES_PATH = '/partner/venues'

export function isOwner(role: PartnerRole | null | undefined): boolean {
  return (role ?? 'owner') === 'owner'
}

/**
 * Аккаунты, созданные до появления ролей, роль не присылают — считаем их
 * владельцами, иначе существующие партнёры потеряют доступ к своим финансам.
 */
export function parsePartnerRole(raw: unknown): PartnerRole {
  return raw === 'manager' || raw === 'staff' || raw === 'admin' ? 'manager' : 'owner'
}
