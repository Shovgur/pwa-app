import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initScrollRestoration, scrollToTop } from '../utils/scroll'

let scrollRestorationInit = false

export function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    if (!scrollRestorationInit) {
      initScrollRestoration()
      scrollRestorationInit = true
    }

    scrollToTop()

    const raf1 = requestAnimationFrame(() => {
      scrollToTop()
      requestAnimationFrame(scrollToTop)
    })

    const timers = [0, 50, 100, 200, 400].map((ms) =>
      window.setTimeout(scrollToTop, ms),
    )

    return () => {
      cancelAnimationFrame(raf1)
      timers.forEach(clearTimeout)
    }
  }, [pathname])

  return null
}
