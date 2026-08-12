import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePartnerAuth } from './PartnerAuthContext'
import {
  fetchPartnerBookings,
  updatePartnerBookingStatus,
  type BookingStatus,
  type PartnerBooking,
} from '../lib/partnerCrm'
import { can } from '../utils/partnerAccess'

interface PartnerCrmCtx {
  bookings: PartnerBooking[]
  isLoading: boolean
  error: string
  /** Брони, ждущие подтверждения — счётчик в навигации у управляющего */
  pendingCount: number
  updatingId: string | null
  reload: () => Promise<void>
  changeStatus: (id: string, status: BookingStatus) => Promise<{ success: boolean; error?: string }>
}

const PartnerCrmContext = createContext<PartnerCrmCtx | null>(null)

/** Брони грузим только для управляющего — владельцу CRM недоступен. */
export function PartnerCrmProvider({ children }: { children: ReactNode }) {
  const { partner } = usePartnerAuth()
  const crmEnabled = can(partner?.role ?? 'owner', 'crm')

  const [bookings, setBookings]   = useState<PartnerBooking[]>([])
  const [isLoading, setIsLoading] = useState(crmEnabled)
  const [error, setError]         = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!crmEnabled) {
      setBookings([])
      setIsLoading(false)
      setError('')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      setBookings(await fetchPartnerBookings())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить брони')
    } finally {
      setIsLoading(false)
    }
  }, [crmEnabled])

  useEffect(() => {
    void reload()
  }, [reload])

  const changeStatus = useCallback(async (id: string, status: BookingStatus) => {
    setUpdatingId(id)
    try {
      const updated = await updatePartnerBookingStatus(id, status)
      setBookings(prev => prev.map(b => (b.id === id ? updated : b)))
      return { success: true }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Не удалось изменить статус' }
    } finally {
      setUpdatingId(null)
    }
  }, [])

  const pendingCount = useMemo(
    () => (crmEnabled ? bookings.filter(b => b.status === 'pending').length : 0),
    [bookings, crmEnabled],
  )

  const value = useMemo<PartnerCrmCtx>(
    () => ({ bookings, isLoading, error, pendingCount, updatingId, reload, changeStatus }),
    [bookings, isLoading, error, pendingCount, updatingId, reload, changeStatus],
  )

  return <PartnerCrmContext.Provider value={value}>{children}</PartnerCrmContext.Provider>
}

export function usePartnerCrm() {
  const ctx = useContext(PartnerCrmContext)
  if (!ctx) throw new Error('usePartnerCrm must be used within <PartnerCrmProvider>')
  return ctx
}
