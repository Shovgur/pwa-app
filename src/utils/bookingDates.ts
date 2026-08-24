const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTH_LABELS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export interface BookingDayOption {
  label: string
  date: string
  iso: string
}

/** YYYY-MM-DD in local timezone (not UTC). */
export function localIsoDate(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function upcomingBookingDays(count = 7): BookingDayOption[] {
  const today = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return {
      label: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : DAY_LABELS[d.getDay()],
      date: `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`,
      iso: localIsoDate(d),
    }
  })
}

export function formatBookingDisplayDate(iso: string): string {
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return iso
  const day = parseInt(match[3], 10)
  const month = parseInt(match[2], 10) - 1
  if (month < 0 || month > 11) return iso
  return `${day} ${MONTH_LABELS[month]}`
}

export function todayIsoDate(): string {
  return localIsoDate()
}
