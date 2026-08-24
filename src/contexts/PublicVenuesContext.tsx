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

interface PublicVenuesCtx {
  venues: PublicVenue[]
  isLoading: boolean
  catalogItems: (VenueCardProps & { type: 'sport' | 'loft' | 'pool' | 'meeting' })[]
  courts: Court[]
  getVenue: (id: string) => PublicVenue | undefined
  refresh: () => Promise<void>
}

const PublicVenuesContext = createContext<PublicVenuesCtx | null>(null)

export function PublicVenuesProvider({ children }: { children: ReactNode }) {
  const [venues, setVenues] = useState<PublicVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const list = await fetchPublicVenues()
      setVenues(list)
    } catch {
      setVenues([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
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
      value={{ venues, isLoading, catalogItems, courts, getVenue, refresh: load }}
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
