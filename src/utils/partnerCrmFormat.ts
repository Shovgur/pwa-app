const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

const WEEKDAYS_SHORT = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** 'YYYY-MM-DD' → локальная дата без сдвига по часовому поясу */
function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Разница в календарных днях от сегодня: 0 — сегодня, 1 — завтра, -1 — вчера */
export function dayDiffFromToday(day: string): number {
  const diffMs = parseDay(day).getTime() - startOfToday().getTime()
  return Math.round(diffMs / 86_400_000)
}

export function isToday(day: string): boolean {
  return dayDiffFromToday(day) === 0
}

/** «Сегодня» / «Завтра» / «Вчера» / «12 авг, пн» */
export function formatDayLabel(day: string): string {
  const diff = dayDiffFromToday(day)
  if (diff === 0) return 'Сегодня'
  if (diff === 1) return 'Завтра'
  if (diff === -1) return 'Вчера'

  const d = parseDay(day)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ${WEEKDAYS_SHORT[d.getDay()]}`
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} ₽`
}

/** «только что» / «2 ч назад» / «3 дн назад» / «12 авг» */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'

  const minutes = Math.floor((Date.now() - then) / 60_000)
  if (minutes < 2) return 'только что'
  if (minutes < 60) return `${minutes} мин назад`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч назад`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} дн назад`

  const d = new Date(then)
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

/** «12 авг 2026, 14:30» */
export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}, ${time}`
}

/** Только цифры — чтобы поиск по телефону работал независимо от форматирования */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}
