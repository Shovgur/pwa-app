import type { LucideIcon } from 'lucide-react'
import {
  Trophy, CalendarCheck, Flame, Compass, Waves, PartyPopper,
  Target, Star, Zap, Medal, Crown, MapPin,
} from 'lucide-react'
import type { Booking } from '../contexts/BookingContext'

export type AchievementCategory = 'bookings' | 'sport' | 'explore' | 'special'
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface AchievementDef {
  id: string
  title: string
  description: string
  category: AchievementCategory
  tier: AchievementTier
  icon: LucideIcon
  emoji: string
  color: string
  target: number
  xp: number
  /** Считает текущий прогресс по бронированиям пользователя. */
  measure: (bookings: Booking[]) => number
}

export interface Achievement extends AchievementDef {
  current: number
  unlocked: boolean
  progress: number
}

export const CATEGORY_META: Record<AchievementCategory, { label: string; color: string }> = {
  bookings: { label: 'Бронирования', color: '#22c55e' },
  sport: { label: 'Спорт', color: '#3b82f6' },
  explore: { label: 'Исследование', color: '#a855f7' },
  special: { label: 'Особые', color: '#f97316' },
}

export const TIER_META: Record<AchievementTier, { label: string; color: string; glow: string }> = {
  bronze: { label: 'Бронза', color: '#cd7f32', glow: 'rgba(205,127,50,0.35)' },
  silver: { label: 'Серебро', color: '#94a3b8', glow: 'rgba(148,163,184,0.35)' },
  gold: { label: 'Золото', color: '#eab308', glow: 'rgba(234,179,8,0.4)' },
  platinum: { label: 'Платина', color: '#a78bfa', glow: 'rgba(167,139,250,0.45)' },
}

function activeBookings(bookings: Booking[]): Booking[] {
  return bookings.filter(b => b.status !== 'cancelled')
}

function countBySport(bookings: Booking[], sport: string): number {
  return activeBookings(bookings).filter(b => b.court.sport === sport).length
}

function uniqueSports(bookings: Booking[]): number {
  return new Set(activeBookings(bookings).map(b => b.court.sport)).size
}

function uniqueVenues(bookings: Booking[]): number {
  return new Set(activeBookings(bookings).map(b => b.court.name)).size
}

function parseHour(time: string): number | null {
  const match = time.match(/(\d{1,2}):(\d{2})/)
  if (!match) return null
  return parseInt(match[1], 10)
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: 'first-booking',
    title: 'Первый шаг',
    description: 'Сделайте первое бронирование',
    category: 'bookings',
    tier: 'bronze',
    icon: CalendarCheck,
    emoji: '🎯',
    color: '#22c55e',
    target: 1,
    xp: 50,
    measure: b => activeBookings(b).length,
  },
  {
    id: 'bookings-5',
    title: 'Активный игрок',
    description: '5 бронирований на BookinGo',
    category: 'bookings',
    tier: 'silver',
    icon: Flame,
    emoji: '🔥',
    color: '#f97316',
    target: 5,
    xp: 100,
    measure: b => activeBookings(b).length,
  },
  {
    id: 'bookings-10',
    title: 'Профи',
    description: '10 успешных бронирований',
    category: 'bookings',
    tier: 'gold',
    icon: Medal,
    emoji: '🏅',
    color: '#eab308',
    target: 10,
    xp: 200,
    measure: b => activeBookings(b).length,
  },
  {
    id: 'bookings-25',
    title: 'Легенда',
    description: '25 бронирований — вы настоящий фанат спорта',
    category: 'bookings',
    tier: 'platinum',
    icon: Crown,
    emoji: '👑',
    color: '#a78bfa',
    target: 25,
    xp: 400,
    measure: b => activeBookings(b).length,
  },
  {
    id: 'multi-sport-3',
    title: 'Мультиспорт',
    description: 'Забронируйте 3 разных вида спорта',
    category: 'sport',
    tier: 'gold',
    icon: Target,
    emoji: '🎽',
    color: '#3b82f6',
    target: 3,
    xp: 200,
    measure: uniqueSports,
  },
  {
    id: 'tennis-3',
    title: 'Теннисист',
    description: '3 бронирования теннисных кортов',
    category: 'sport',
    tier: 'silver',
    icon: Star,
    emoji: '🎾',
    color: '#22c55e',
    target: 3,
    xp: 100,
    measure: b => countBySport(b, 'Теннис'),
  },
  {
    id: 'football-3',
    title: 'Футболист',
    description: '3 бронирования футбольных полей',
    category: 'sport',
    tier: 'silver',
    icon: Star,
    emoji: '⚽',
    color: '#3b82f6',
    target: 3,
    xp: 100,
    measure: b => countBySport(b, 'Футбол'),
  },
  {
    id: 'pool-1',
    title: 'Водный мир',
    description: 'Забронируйте бассейн',
    category: 'explore',
    tier: 'bronze',
    icon: Waves,
    emoji: '🏊',
    color: '#0ea5e9',
    target: 1,
    xp: 50,
    measure: b => activeBookings(b).filter(x => x.venueType === 'pool' || x.court.sport === 'Бассейн').length,
  },
  {
    id: 'loft-1',
    title: 'Тусовщик',
    description: 'Забронируйте лофт для мероприятия',
    category: 'explore',
    tier: 'bronze',
    icon: PartyPopper,
    emoji: '🎉',
    color: '#f97316',
    target: 1,
    xp: 50,
    measure: b => activeBookings(b).filter(x => x.venueType === 'loft' || x.court.sport === 'Лофт').length,
  },
  {
    id: 'venues-5',
    title: 'Исследователь',
    description: 'Посетите 5 разных площадок',
    category: 'explore',
    tier: 'gold',
    icon: Compass,
    emoji: '🧭',
    color: '#a855f7',
    target: 5,
    xp: 200,
    measure: uniqueVenues,
  },
  {
    id: 'night-owl',
    title: 'Ночной игрок',
    description: 'Забронируйте слот после 18:00',
    category: 'special',
    tier: 'bronze',
    icon: Zap,
    emoji: '🌙',
    color: '#6366f1',
    target: 1,
    xp: 50,
    measure: b => activeBookings(b).filter(x => {
      const h = parseHour(x.time)
      return h != null && h >= 18
    }).length,
  },
  {
    id: 'early-bird',
    title: 'Ранний старт',
    description: 'Забронируйте утренний слот до 10:00',
    category: 'special',
    tier: 'bronze',
    icon: Zap,
    emoji: '🌅',
    color: '#f59e0b',
    target: 1,
    xp: 50,
    measure: b => activeBookings(b).filter(x => {
      const h = parseHour(x.time)
      return h != null && h < 10
    }).length,
  },
  {
    id: 'marathon',
    title: 'Марафонец',
    description: 'Забронируйте площадку на 2 часа и более',
    category: 'special',
    tier: 'silver',
    icon: Trophy,
    emoji: '⏱️',
    color: '#ec4899',
    target: 1,
    xp: 100,
    measure: b => activeBookings(b).filter(x => x.duration >= 120).length,
  },
  {
    id: 'map-explorer',
    title: 'На карте',
    description: '3 бронирования в разных районах',
    category: 'explore',
    tier: 'silver',
    icon: MapPin,
    emoji: '📍',
    color: '#06b6d4',
    target: 3,
    xp: 100,
    measure: b => new Set(activeBookings(b).map(x => x.court.location)).size,
  },
]

const XP_PER_LEVEL = 500

export function computeAchievements(bookings: Booking[]): Achievement[] {
  return ACHIEVEMENT_DEFS.map(def => {
    const current = Math.min(def.measure(bookings), def.target)
    const unlocked = current >= def.target
    const progress = def.target > 0 ? Math.round((current / def.target) * 100) : 0
    return { ...def, current, unlocked, progress }
  })
}

export function getAchievementStats(achievements: Achievement[]) {
  const unlocked = achievements.filter(a => a.unlocked)
  const totalXp = unlocked.reduce((sum, a) => sum + a.xp, 0)
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const xpInLevel = totalXp % XP_PER_LEVEL
  const levelProgress = Math.round((xpInLevel / XP_PER_LEVEL) * 100)

  return {
    total: achievements.length,
    unlockedCount: unlocked.length,
    totalXp,
    level,
    xpInLevel,
    levelProgress,
    xpToNextLevel: XP_PER_LEVEL - xpInLevel,
  }
}
