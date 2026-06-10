export function scrollToTop() {
  if (typeof window === 'undefined') return

  const html = document.documentElement
  const body = document.body
  const root = document.getElementById('root')
  const prevBehavior = html.style.scrollBehavior
  html.style.scrollBehavior = 'auto'

  window.scrollTo(0, 0)
  html.scrollTop = 0
  body.scrollTop = 0
  if (root) root.scrollTop = 0

  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  } catch {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }

  html.style.scrollBehavior = prevBehavior
}

export function initScrollRestoration() {
  if (typeof window === 'undefined') return
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }
}
