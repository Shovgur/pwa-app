import type { PartnerStaff } from '../lib/partnerCrm'
import type { BookingStatus, PaymentMethod, VenueKind } from '../lib/partnerCrm'
import type { PartnerVenue } from '../lib/partnerVenues'
import type { VenuePromotion } from '../lib/partnerPromotions'
import type { PartnerRole } from '../utils/partnerAccess'
import { createSeedState } from './demoSeed'

export const STORAGE_KEY = 'bookingo.demo.v1'

export interface DemoCompany {
  id: string
  name: string
  city: string
  isNetwork: boolean
}

export interface DemoClientAccount {
  id: number
  email: string
  password: string
  name: string
  phone: string
}

export interface DemoPartnerAccount {
  login: string
  password: string
  partnerId: number
  companyId: string
  companyName: string
  email: string
  phone: string
  city: string
  role: PartnerRole
  name: string | null
  /** id строки staff в store (staff-1) */
  staffRecordId: string | null
  /** числовой id для Partner.staffId */
  staffId: number | null
  commissionPercent: number
  status: string
}

export interface DemoVenue extends PartnerVenue {
  companyId: string
  legacyRef?: string
}

export interface DemoBooking {
  id: number
  code: string
  companyId: string
  clientId: number
  customerName: string
  customerPhone: string
  venueId: string
  venueName: string
  venueKind: VenueKind
  venueSport?: string | null
  venueAddress?: string | null
  venueEmoji?: string | null
  venueColor?: string | null
  venueRef: string
  date: string
  time: string
  timeFrom: string
  timeTo: string
  durationMinutes: number
  guests: number
  amount: number
  paidAmount: number
  paymentMethod: PaymentMethod
  status: BookingStatus
  comment: string | null
  createdAt: string
}

export interface DemoState {
  companies: DemoCompany[]
  accounts: {
    clients: DemoClientAccount[]
    partners: DemoPartnerAccount[]
  }
  venues: DemoVenue[]
  bookings: DemoBooking[]
  promotions: VenuePromotion[]
  staff: Array<PartnerStaff & { companyId: string }>
  nextBookingId: number
  nextClientId: number
}

const inTabListeners = new Set<() => void>()

function notifyListeners() {
  inTabListeners.forEach(fn => {
    try {
      fn()
    } catch {
      /* ignore */
    }
  })
}

function writeState(state: DemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  notifyListeners()
}

export function read(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = createSeedState()
      writeState(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw) as DemoState
    if (!parsed?.venues || !parsed?.bookings) {
      const seeded = createSeedState()
      writeState(seeded)
      return seeded
    }
    return parsed
  } catch {
    const seeded = createSeedState()
    writeState(seeded)
    return seeded
  }
}

export function update(fn: (state: DemoState) => DemoState): DemoState {
  const current = read()
  const next = fn(current)
  writeState(next)
  return next
}

export function reset(): void {
  localStorage.removeItem(STORAGE_KEY)
  const seeded = createSeedState()
  writeState(seeded)
}

export function resetDemoStore(): void {
  reset()
}

export function subscribe(listener: () => void): () => void {
  inTabListeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    inTabListeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function demoDelay(ms = 80): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

export function stripDemoVenueFields(v: DemoVenue): PartnerVenue {
  return {
    id: v.id,
    name: v.name,
    venueKind: v.venueKind,
    city: v.city,
    address: v.address,
    description: v.description,
    photos: v.photos,
    basePricePerHour: v.basePricePerHour,
    pricePerHour: v.pricePerHour,
    timePriceRules: v.timePriceRules,
    durationRules: v.durationRules,
    extraServices: v.extraServices,
    amenities: v.amenities,
    isActive: v.isActive,
    bookingsCount: v.bookingsCount,
    createdAt: v.createdAt,
    lat: v.lat,
    lng: v.lng,
    sportType: v.sportType,
    managedByStaffId: v.managedByStaffId,
    managedByName: v.managedByName,
    canEdit: v.canEdit,
    promotions: v.promotions,
  }
}
