/** Feature flags — flip when sections are ready for production. */
export const features = {
  dashboard: true,
  demo: import.meta.env.VITE_DEMO_MODE === 'true',
  /** Клиент → площадка (этапы 1–2). Off until stage 4 go-live. */
  venueReviews: import.meta.env.VITE_FEATURE_VENUE_REVIEWS === 'true',
  /** Менеджер → клиент (этапы 3–4). Off until stage 4 go-live. */
  clientReviews: import.meta.env.VITE_FEATURE_CLIENT_REVIEWS === 'true',
} as const

export const paths = {
  home: '/',
  catalog: '/catalog',
  postAuth: '/catalog',
} as const

export function resolveAuthRedirect(from?: string) {
  if (!from) return paths.postAuth
  if (!features.dashboard && from.startsWith('/dashboard')) return paths.catalog
  return from
}
