import { useCallback, useEffect, useState } from 'react'
import {
  DEMO_SLOTS,
  fetchCourtAvailability,
  type VenueSlot,
} from '../lib/venueAvailability'

interface UseVenueSlotsOptions {
  venueId?: string | null
  venueRef?: string
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
  venueRef,
  date,
  durationMinutes,
  enabled = true,
}: UseVenueSlotsOptions): UseVenueSlotsResult {
  const [slots, setSlots] = useState<VenueSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const hasSource = Boolean(venueId || venueRef)

  useEffect(() => {
    if (!enabled || !hasSource || !date) {
      setSlots([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void fetchCourtAvailability({ venueId, venueRef, date, durationMinutes })
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
  }, [venueId, venueRef, date, durationMinutes, enabled, hasSource, reloadKey])

  const slotTimes = hasSource
    ? slots.map((s) => s.time)
    : DEMO_SLOTS

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  return {
    slots,
    slotTimes,
    loading: Boolean(hasSource && loading),
    error,
    reload,
  }
}
