import { useCallback, useEffect, useState } from 'react'
import { features } from '../config/features'
import { fetchPendingVenueReviews, type PendingVenueReview } from '../lib/venueReviews'
import { useAuth } from '../contexts/AuthContext'

const SEEN_KEY = 'bookingo:review_prompt_seen'

function readSeen(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, number>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeSeen(map: Record<string, number>) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

/** Popup ~slot_end+15m, once per booking. */
export function useReviewPrompt() {
  const { isAuthenticated } = useAuth()
  const [prompt, setPrompt] = useState<PendingVenueReview | null>(null)

  const dismiss = useCallback((bookingId: string) => {
    const seen = { ...readSeen(), [bookingId]: Date.now() }
    writeSeen(seen)
    setPrompt((cur) => (cur?.partnerBookingId === bookingId ? null : cur))
  }, [])

  useEffect(() => {
    if (!features.venueReviews || !isAuthenticated) {
      setPrompt(null)
      return
    }
    let cancelled = false
    void fetchPendingVenueReviews()
      .then((list) => {
        if (cancelled) return
        const seen = readSeen()
        const now = Date.now()
        const due = list.find((p) => {
          if (seen[p.partnerBookingId]) return false
          const slotEnd = new Date(p.slotEnd).getTime()
          if (!Number.isFinite(slotEnd)) return false
          // ~15 минут после конца слота
          return now >= slotEnd + 15 * 60 * 1000
        })
        setPrompt(due ?? null)
      })
      .catch(() => {
        if (!cancelled) setPrompt(null)
      })
    return () => { cancelled = true }
  }, [isAuthenticated])

  return { prompt, dismiss }
}
