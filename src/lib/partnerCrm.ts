import { API_BASE } from '../config/api'
import { getPartnerToken } from '../contexts/PartnerAuthContext'

// ─── модель брони ────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled'
export type PaymentMethod = 'online' | 'cash' | 'transfer'
export type VenueKind = 'sport' | 'pool' | 'loft' | 'meeting'

export interface PartnerBooking {
  id: string
  /** Человекочитаемый номер брони, его называет клиент по телефону */
  code: string
  customerName: string
  customerPhone: string
  venueName: string
  venueKind: VenueKind
  /** YYYY-MM-DD */
  date: string
  /** HH:MM */
  timeFrom: string
  timeTo: string
  guests: number
  /** Сумма брони, ₽ — нужна сотруднику, чтобы принять оплату */
  amount: number
  /** Сколько уже внесено, ₽ */
  paidAmount: number
  paymentMethod: PaymentMethod
  status: BookingStatus
  comment: string | null
  /** ISO */
  createdAt: string
}

export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; color: string }> = {
  pending:   { label: 'Новая',        color: '#f59e0b' },
  confirmed: { label: 'Подтверждена', color: '#3b82f6' },
  paid:      { label: 'Оплачена',     color: '#22c55e' },
  completed: { label: 'Завершена',    color: '#64748b' },
  cancelled: { label: 'Отменена',     color: '#f87171' },
}

/** Разрешённые переходы статусов — ими же рисуются кнопки в карточке брони. */
export const STATUS_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid:      ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export const TRANSITION_LABEL: Record<BookingStatus, string> = {
  pending:   'Вернуть в новые',
  confirmed: 'Подтвердить',
  paid:      'Отметить оплату',
  completed: 'Завершить',
  cancelled: 'Отменить',
}

export const VENUE_KIND_LABEL: Record<VenueKind, string> = {
  sport:   'Спорт',
  pool:    'Бассейн',
  loft:    'Лофт',
  meeting: 'Переговорная',
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  online:   'Онлайн',
  cash:     'Наличные',
  transfer: 'Перевод',
}

// ─── модель сотрудника ───────────────────────────────────
export interface PartnerStaff {
  id: string
  name: string
  login: string
  isActive: boolean
  /** ISO */
  createdAt: string
  lastLoginAt: string | null
}

export interface CreateStaffPayload {
  name: string
  login: string
  password: string
}

// ─── транспорт ───────────────────────────────────────────
async function partnerRequest<T>(
  path: string,
  options: RequestInit = {},
  emptyOn404 = false,
): Promise<T> {
  const token = getPartnerToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  })

  if (emptyOn404 && res.status === 404) {
    if (path.includes('/staff')) return { staff: [] } as T
    if (path.includes('/bookings')) return { bookings: [] } as T
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok) {
    const raw = (data.message ?? data.error) as string | undefined
    if (res.status === 404) {
      throw new Error(
        raw ?? `Эндпоинт ${path} не найден на сервере. Обновите и перезапустите бэкенд.`,
      )
    }
    throw new Error(raw ?? `Ошибка ${res.status}`)
  }

  return data as T
}

// ─── брони ───────────────────────────────────────────────
export function fetchPartnerBookings(): Promise<PartnerBooking[]> {
  return partnerRequest<{ bookings: PartnerBooking[] }>('/partner/bookings', {}, true)
    .then(r => r.bookings)
}

export function updatePartnerBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<PartnerBooking> {
  return partnerRequest<{ booking: PartnerBooking }>(`/partner/bookings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }).then(r => r.booking)
}

// ─── сотрудники ──────────────────────────────────────────
export function fetchPartnerStaff(): Promise<PartnerStaff[]> {
  return partnerRequest<{ staff: PartnerStaff[] }>('/partner/staff', {}, true)
    .then(r => r.staff)
}

export function createPartnerStaff(payload: CreateStaffPayload): Promise<PartnerStaff> {
  return partnerRequest<{ staff: PartnerStaff }>('/partner/staff', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then(r => r.staff)
}

export function setPartnerStaffActive(id: string, isActive: boolean): Promise<PartnerStaff> {
  return partnerRequest<{ staff: PartnerStaff }>(`/partner/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  }).then(r => r.staff)
}

export function deletePartnerStaff(id: string): Promise<void> {
  return partnerRequest<unknown>(`/partner/staff/${id}`, { method: 'DELETE' }).then(() => undefined)
}
