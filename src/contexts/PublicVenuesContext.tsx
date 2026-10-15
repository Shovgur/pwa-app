import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchPublicVenue, fetchPublicVenues, type PublicVenue } from '../lib/publicVenues'
import {
  partnerVenueToCourt,
  partnerVenueToVenueCard,
} from '../utils/venueAdapters'
import type { VenueCardProps } from '../components/ui/VenueCard'
import type { Court } from './BookingContext'
import { isDemoMode } from '../demo/demoMode'
import { subscribe as subscribeDemoStore } from '../demo/demoStore'

interface PublicVenuesCtx {
  venues: PublicVenue[]
  isLoading: boolean
  error: string | null
  catalogItems: (VenueCardProps & {
    type: 'sport' | 'loft' | 'pool' | 'meeting'
    sportTypeId?: string | null
    hasPromo?: boolean
  })[]
  courts: Court[]
  getVenue: (id: string) => PublicVenue | undefined
  refresh: () => Promise<void>
}

const PublicVenuesContext = createContext<PublicVenuesCtx | null>(null)

export function PublicVenuesProvider({ children }: { children: ReactNode }) {
  const [venues, setVenues] = useState<PublicVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await fetchPublicVenues()
      setVenues(list)
    } catch (e) {
      setVenues([])
      setError(e instanceof Error ? e.message : 'Не удалось загрузить площадки')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!isDemoMode()) return
    return subscribeDemoStore(() => {
      void load()
    })
  }, [load])

  const catalogItems = useMemo(
    () => venues.map((v, i) => partnerVenueToVenueCard(v, i * 0.02)),
    [venues],
  )

  const courts = useMemo(() => venues.map(partnerVenueToCourt), [venues])

  const getVenue = useCallback(
    (id: string) => venues.find(v => v.id === id),
    [venues],
  )

  return (
    <PublicVenuesContext.Provider
      value={{ venues, isLoading, error, catalogItems, courts, getVenue, refresh: load }}
    >
      {children}
    </PublicVenuesContext.Provider>
  )
}

export function usePublicVenues() {
  const ctx = useContext(PublicVenuesContext)
  if (!ctx) throw new Error('usePublicVenues must be used within PublicVenuesProvider')
  return ctx
}

export async function loadPublicVenueById(id: string): Promise<PublicVenue | null> {
  return fetchPublicVenue(id)
}
