import type { Booking } from '../contexts/BookingContext'

export type OutfitKey =
  | 'default'
  | 'tennis'
  | 'football'
  | 'basketball'
  | 'badminton'
  | 'volleyball'
  | 'loft-party'
  | 'pool'

export interface OutfitInfo {
  label: string
  image: string
  caption: string
}

export const OUTFITS: Record<OutfitKey, OutfitInfo> = {
  'default': {
    label: 'Участник',
    image: '/mascot/mascot-default.png',
    caption: 'Бронируй чаще один вид досуга — и персонаж переоденется в подходящий образ',
  },
  'tennis': {
    label: '🎾 Теннисист',
    image: '/mascot/mascot-tennis.png',
    caption: 'Ты часто бронируешь теннисные корты — вот твой образ!',
  },
  'football': {
    label: '⚽ Футболист',
    image: '/mascot/mascot-football.png',
    caption: 'Ты часто бронируешь футбольные поля — вот твой образ!',
  },
  'basketball': {
    label: '🏀 Баскетболист',
    image: '/mascot/mascot-basketball.png',
    caption: 'Ты часто бронируешь баскетбольные площадки — вот твой образ!',
  },
  'badminton': {
    label: '🏸 Бадминтонист',
    image: '/mascot/mascot-badminton.png',
    caption: 'Ты часто бронируешь корты для бадминтона — вот твой образ!',
  },
  'volleyball': {
    label: '🏐 Волейболист',
    image: '/mascot/mascot-volleyball.png',
    caption: 'Ты часто бронируешь волейбольные площадки — вот твой образ!',
  },
  'loft-party': {
    label: '🎉 Тусовщик',
    image: '/mascot/mascot-loft-party.png',
    caption: 'Ты часто бронируешь лофты для вечеринок — вот твой образ!',
  },
  'pool': {
    label: '🏊 Пловец',
    image: '/mascot/mascot-pool.png',
    caption: 'Ты часто бронируешь бассейны — вот твой образ!',
  },
}

const SPORT_TO_OUTFIT: Record<string, OutfitKey> = {
  'Теннис': 'tennis',
  'Футбол': 'football',
  'Баскетбол': 'basketball',
  'Бадминтон': 'badminton',
  'Волейбол': 'volleyball',
}

/** Учитываем только брони за последние N дней — образ отражает недавнюю активность. */
const ACTIVE_WINDOW_DAYS = 30
/** Чтобы один случайный визит не переодевал персонажа, нужно набрать минимум броней. */
const MIN_BOOKINGS_TO_UNLOCK = 2

function bookingTimestamp(booking: Booking): number {
  const d = new Date(booking.createdAt)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

function outfitForBooking(booking: Booking): OutfitKey | null {
  if (booking.venueType === 'loft') return 'loft-party'
  if (booking.venueType === 'pool') return 'pool'
  return SPORT_TO_OUTFIT[booking.court.sport] ?? null
}

/**
 * Подбирает образ персонажа по тому, что пользователь чаще всего бронировал
 * за последний месяц. Если явного фаворита нет (мало броней или ничья между
 * несколькими видами) — остаётся нейтральный образ по умолчанию.
 */
export function getDominantOutfit(bookings: Booking[]): OutfitKey {
  const cutoff = Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000
  const counts = new Map<OutfitKey, number>()

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue
    if (bookingTimestamp(booking) < cutoff) continue

    const key = outfitForBooking(booking)
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let bestKey: OutfitKey = 'default'
  let bestCount = 0
  let tie = false

  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestKey = key
      bestCount = count
      tie = false
    } else if (count === bestCount) {
      tie = true
    }
  }

  if (bestCount < MIN_BOOKINGS_TO_UNLOCK || tie) return 'default'
  return bestKey
}
