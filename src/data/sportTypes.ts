import type { Court } from '../contexts/BookingContext'

export interface SportTypeDef {
  id: string
  label: string
  emoji: string
  color: string
  /** Ключевые слова для поиска */
  keywords: string[]
}

export const SPORT_TYPES: SportTypeDef[] = [
  { id: 'tennis', label: 'Теннис', emoji: '🎾', color: '#22c55e', keywords: ['теннис', 'tennis', 'корт'] },
  { id: 'football', label: 'Футбол', emoji: '⚽', color: '#3b82f6', keywords: ['футбол', 'football', 'поле', 'мини'] },
  { id: 'basketball', label: 'Баскетбол', emoji: '🏀', color: '#f97316', keywords: ['баскетбол', 'basketball'] },
  { id: 'volleyball', label: 'Волейбол', emoji: '🏐', color: '#06b6d4', keywords: ['волейбол', 'volleyball'] },
  { id: 'badminton', label: 'Бадминтон', emoji: '🏸', color: '#a855f7', keywords: ['бадминтон', 'badminton'] },
  { id: 'hockey', label: 'Хоккей', emoji: '🏒', color: '#64748b', keywords: ['хоккей', 'hockey', 'лед'] },
  { id: 'table-tennis', label: 'Настольный теннис', emoji: '🏓', color: '#ef4444', keywords: ['настольный', 'пинг', 'table'] },
  { id: 'squash', label: 'Сквош', emoji: '🎯', color: '#eab308', keywords: ['сквош', 'squash'] },
  { id: 'padel', label: 'Падел', emoji: '🎾', color: '#84cc16', keywords: ['падел', 'padel'] },
  { id: 'swimming', label: 'Плавание', emoji: '🏊', color: '#0ea5e9', keywords: ['плавание', 'бассейн', 'swim'] },
  { id: 'fitness', label: 'Фитнес', emoji: '💪', color: '#f43f5e', keywords: ['фитнес', 'fitness', 'зал'] },
  { id: 'yoga', label: 'Йога', emoji: '🧘', color: '#8b5cf6', keywords: ['йога', 'yoga', 'пилатес'] },
  { id: 'boxing', label: 'Бокс', emoji: '🥊', color: '#dc2626', keywords: ['бокс', 'boxing'] },
  { id: 'martial-arts', label: 'Единоборства', emoji: '🥋', color: '#78716c', keywords: ['единоборства', 'mma', 'дзюдо', 'карате'] },
  { id: 'climbing', label: 'Скалодром', emoji: '🧗', color: '#f59e0b', keywords: ['скалодром', 'боулдеринг', 'climb'] },
  { id: 'skating', label: 'Каток', emoji: '⛸️', color: '#38bdf8', keywords: ['каток', 'коньки', 'skate'] },
  { id: 'golf', label: 'Гольф', emoji: '⛳', color: '#16a34a', keywords: ['гольф', 'golf'] },
  { id: 'crossfit', label: 'Кроссфит', emoji: '🏋️', color: '#ea580c', keywords: ['кроссфит', 'crossfit'] },
  { id: 'dance', label: 'Танцы', emoji: '💃', color: '#ec4899', keywords: ['танцы', 'dance', 'студия'] },
  { id: 'other', label: 'Другое', emoji: '🏟️', color: '#94a3b8', keywords: ['спорт', 'sport'] },
]

export type SportTypeId = (typeof SPORT_TYPES)[number]['id']

export const VENUE_KIND_CHIPS = [
  { id: 'pool', label: 'Бассейн', emoji: '🏊', color: '#0ea5e9' },
  { id: 'loft', label: 'Лофт', emoji: '🏢', color: '#f97316' },
  { id: 'meeting', label: 'Переговорная', emoji: '💼', color: '#a855f7' },
] as const

const sportById = new Map(SPORT_TYPES.map(s => [s.id, s]))
const sportByLabel = new Map(SPORT_TYPES.map(s => [s.label.toLowerCase(), s]))

export function getSportById(id: string | null | undefined): SportTypeDef | undefined {
  if (!id) return undefined
  return sportById.get(id)
}

export function getSportByLabel(label: string | null | undefined): SportTypeDef | undefined {
  if (!label) return undefined
  return sportByLabel.get(label.toLowerCase())
}

export function sportLabel(id: string | null | undefined, fallback = 'Спорт'): string {
  return getSportById(id)?.label ?? fallback
}

export function sportEmoji(id: string | null | undefined, fallback = '🏅'): string {
  return getSportById(id)?.emoji ?? fallback
}

export function sportColor(id: string | null | undefined, fallback = '#22c55e'): string {
  return getSportById(id)?.color ?? fallback
}

/** Определяет sport id по court (мок или партнёр). */
export function courtSportId(court: Court): string | null {
  if (court.sportTypeId) return court.sportTypeId
  const byLabel = getSportByLabel(court.sport)
  if (byLabel) return byLabel.id
  if (court.venueType === 'pool' || court.sport === 'Бассейн') return 'swimming'
  return null
}

export function courtSportLabel(court: Court): string {
  if (court.venueType === 'loft' || court.sport === 'Лофт') return 'Лофт'
  if (court.venueType === 'pool' || court.sport === 'Бассейн') return 'Бассейн'
  const id = courtSportId(court)
  return id ? sportLabel(id) : court.sport
}

export type VenueFilterChip = {
  id: string
  label: string
  emoji: string
  color: string
  kind: 'all' | 'sport' | 'venue'
}

export const ALL_VENUE_CHIP: VenueFilterChip = {
  id: 'all',
  label: 'Все',
  emoji: '✨',
  color: '#22c55e',
  kind: 'all',
}

/** Уникальные чипы спорта из списка площадок. */
export function sportChipsFromCourts(courts: Court[]): VenueFilterChip[] {
  const ids = new Set<string>()
  for (const c of courts) {
    if (c.venueType === 'loft' || c.sport === 'Лофт') continue
    if (c.venueType === 'pool' || c.sport === 'Бассейн') continue
    const sid = courtSportId(c)
    if (sid) ids.add(sid)
  }
  return SPORT_TYPES.filter(s => ids.has(s.id)).map(s => ({
    id: s.id,
    label: s.label,
    emoji: s.emoji,
    color: s.color,
    kind: 'sport' as const,
  }))
}

export function venueKindChipsFromCourts(courts: Court[]): VenueFilterChip[] {
  const chips: VenueFilterChip[] = []
  if (courts.some(c => c.venueType === 'pool' || c.sport === 'Бассейн')) {
    chips.push({ ...VENUE_KIND_CHIPS[0], kind: 'venue' })
  }
  if (courts.some(c => c.venueType === 'loft' || c.sport === 'Лофт')) {
    chips.push({ ...VENUE_KIND_CHIPS[1], kind: 'venue' })
  }
  if (courts.some(c => c.sport === 'Переговорная')) {
    chips.push({ ...VENUE_KIND_CHIPS[2], kind: 'venue' })
  }
  return chips
}

export function buildVenueFilterChips(courts: Court[]): VenueFilterChip[] {
  return [ALL_VENUE_CHIP, ...sportChipsFromCourts(courts), ...venueKindChipsFromCourts(courts)]
}

export function matchesVenueChip(court: Court, chipId: string): boolean {
  if (chipId === 'all') return true
  if (chipId === 'pool') return court.venueType === 'pool' || court.sport === 'Бассейн'
  if (chipId === 'loft') return court.venueType === 'loft' || court.sport === 'Лофт'
  if (chipId === 'meeting') return court.sport === 'Переговорная'
  return courtSportId(court) === chipId
}

/** Чипы спорта, подходящие под поисковый запрос. */
export function sportChipsMatchingQuery(query: string): VenueFilterChip[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return SPORT_TYPES
    .filter(s =>
      s.label.toLowerCase().includes(q)
      || s.keywords.some(k => k.includes(q) || q.includes(k)),
    )
    .map(s => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      color: s.color,
      kind: 'sport' as const,
    }))
}

export function courtMatchesQuery(court: Court, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const sport = courtSportLabel(court).toLowerCase()
  return (
    court.name.toLowerCase().includes(q)
    || court.location.toLowerCase().includes(q)
    || court.address.toLowerCase().includes(q)
    || court.sport.toLowerCase().includes(q)
    || sport.includes(q)
    || SPORT_TYPES.some(s =>
      (courtSportId(court) === s.id || sport === s.label.toLowerCase())
      && (s.label.toLowerCase().includes(q) || s.keywords.some(k => k.includes(q))),
    )
  )
}
