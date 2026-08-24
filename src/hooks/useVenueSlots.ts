import { useEffect, useState } from 'react'
import { DEMO_SLOTS, fetchVenueAvailability, type VenueSlot } from '../lib/venueAvailability'

interface UseVenueSlotsOptions {
  venueId?: string | null
  date: string
  durationMinutes: number
  enabled?: boolean
}

interface UseVenueSlotsResult {
  slots: VenueSlot[]
  slotTimes: string[]
  loading: boolean
  error: string | null
  reload: () => void
}

export function useVenueSlots({
  venueId,
  date,
  durationMinutes,
  enabled = true,
}: UseVenueSlotsOptions): UseVenueSlotsResult {
  const [slots, setSlots] = useState<VenueSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!enabled || !venueId || !date) {
      setSlots([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchVenueAvailability(venueId, date, durationMinutes)
      .then((data) => {
        if (!cancelled) setSlots(data.slots)
      })
      .catch((e) => {
        if (!cancelled) {
          setSlots([])
          setError(e instanceof Error ? e.message : 'Ошибка загрузки слотов')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [venueId, date, durationMinutes, enabled, reloadKey])

  const slotTimes = venueId
    ? slots.map((s) => s.time)
    : DEMO_SLOTS

  return {
    slots,
    slotTimes,
    loading: Boolean(venueId && loading),
    error,
    reload: () => setReloadKey((k) => k + 1),
  }
}
