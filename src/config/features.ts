/** Feature flags — flip when sections are ready for production. */
export const features = {
  dashboard: true,
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
