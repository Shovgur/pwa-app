export const fonts = {
  body: "'Plus Jakarta Sans', system-ui, sans-serif",
  display: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
} as const

export const colors = {
  bg: '#0A0E17',
  bg2: '#111827',
  card: '#1A2332',
  cardHover: '#1E2A3D',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenDim: 'rgba(34, 197, 94, 0.15)',
  blue: '#3B82F6',
  blueDim: 'rgba(59, 130, 246, 0.15)',
  orange: '#F97316',
  orangeDim: 'rgba(249, 115, 22, 0.15)',
  purple: '#A855F7',
  text: '#F1F5F9',
  text2: '#94A3B8',
  muted: '#64748B',
  border: 'rgba(255, 255, 255, 0.08)',
  white: '#FFFFFF',
} as const

export const gradients = {
  primary: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
  primaryGlow: '0 4px 24px rgba(34, 197, 94, 0.35)',
  loft: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
  loftGlow: '0 4px 24px rgba(249, 115, 22, 0.35)',
  hero: 'linear-gradient(135deg, #22C55E, #3B82F6)',
  mesh: 'radial-gradient(ellipse at 70% 20%, rgba(34,197,94,0.12) 0%, transparent 50%), radial-gradient(ellipse at 20% 60%, rgba(59,130,246,0.1) 0%, transparent 50%), #0A0E17',
} as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
} as const
