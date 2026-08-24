const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTH_LABELS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export interface BookingDayOption {
  label: string
  date: string
  iso: string
}

export function upcomingBookingDays(count = 7): BookingDayOption[] {
  const today = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return {
      label: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : DAY_LABELS[d.getDay()],
      date: `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`,
      iso: d.toISOString().slice(0, 10),
    }
  })
}

export function formatBookingDisplayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}
