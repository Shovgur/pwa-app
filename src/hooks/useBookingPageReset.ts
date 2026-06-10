import { useLayoutEffect } from 'react'
import { scrollToTop } from '../utils/scroll'

export function useBookingPageReset(id: string | undefined, onReset: () => void) {
  useLayoutEffect(() => {
    onReset()

    scrollToTop()
    const raf = requestAnimationFrame(() => {
      scrollToTop()
      requestAnimationFrame(scrollToTop)
    })
    const timers = [0, 50, 100, 200].map((ms) => window.setTimeout(scrollToTop, ms))

    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
    // Only re-run when venue id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
}
