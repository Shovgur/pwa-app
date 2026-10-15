import type {
  BookingStatus,
  CreateStaffPayload,
  PartnerBooking,
  PartnerStaff,
} from '../../lib/partnerCrm'
import { demoBookingToPartner } from '../bookingStatus'
import { demoDelay, read, update } from '../demoStore'
import { requireDemoCompanyId } from './demoSession'

export async function demoFetchPartnerBookings(): Promise<PartnerBooking[]> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  return read()
    .bookings.filter(b => b.companyId === companyId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(demoBookingToPartner)
}

export async function demoUpdatePartnerBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<PartnerBooking> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  let result: PartnerBooking | null = null
  update(s => {
    const bookings = s.bookings.map(b => {
      if (String(b.id) !== id || b.companyId !== companyId) return b
      let paidAmount = b.paidAmount
      if (status === 'paid') paidAmount = b.amount
      const next = { ...b, status, paidAmount }
      result = demoBookingToPartner(next)
      return next
    })
    if (!result) throw new Error('Бронь не найдена')
    return { ...s, bookings }
  })
  return result!
}

function toPartnerStaff(row: PartnerStaff & { companyId: string }): PartnerStaff {
  return {
    id: row.id,
    name: row.name,
    login: row.login,
    isActive: row.isActive,
    createdAt: row.createdAt,
    lastLoginAt: row.lastLoginAt,
  }
}

export async function demoFetchPartnerStaff(): Promise<PartnerStaff[]> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  return read().staff.filter(s => s.companyId === companyId).map(toPartnerStaff)
}

export async function demoCreatePartnerStaff(payload: CreateStaffPayload): Promise<PartnerStaff> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  const staff = {
    id: `staff-${Date.now()}`,
    companyId,
    name: payload.name.trim(),
    login: payload.login.trim(),
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  }
  update(s => ({ ...s, staff: [...s.staff, staff] }))
  return toPartnerStaff(staff)
}

export async function demoSetPartnerStaffActive(id: string, isActive: boolean): Promise<PartnerStaff> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  let updated: (PartnerStaff & { companyId: string }) | null = null
  update(s => {
    const staff = s.staff.map(row => {
      if (row.id !== id || row.companyId !== companyId) return row
      updated = { ...row, isActive }
      return updated
    })
    if (!updated) throw new Error('Сотрудник не найден')
    return { ...s, staff }
  })
  return toPartnerStaff(updated!)
}

export async function demoDeletePartnerStaff(id: string): Promise<void> {
  await demoDelay()
  const companyId = requireDemoCompanyId()
  update(s => ({
    ...s,
    staff: s.staff.filter(row => !(row.id === id && row.companyId === companyId)),
  }))
}
