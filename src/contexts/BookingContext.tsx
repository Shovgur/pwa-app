import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Loft, AddOn } from '../data/venues'
import { LOFTS } from '../data/venues'
import { useAuth } from './AuthContext'
import {
  buildCreatePayloadFromCourt,
  cancelClientBooking,
  createClientBooking,
  fetchClientBookings,
  loftVenueRef,
} from '../lib/clientBookings'
import { todayIsoDate } from '../utils/bookingDates'

export interface Court {
  id: number
  emoji: string
  sport: string
  name: string
  location: string
  address: string
  rating: number
  reviews: number
  price: number
  color: string
  available: boolean
  distance: string
  amenities: string[]
  description: string
  photos: string[] // градиенты для фото
  slots: string[]
  lat?: number
  lng?: number
  /** Тип площадки — влияет на то, куда попадёт бронь и какой наряд подберёт маскот в профиле. */
  venueType?: 'sport' | 'loft' | 'pool'
  /** ID площадки партнёра из API (для /venue/:id) */
  partnerVenueId?: string
  /** ID вида спорта (tennis, football, …) */
  sportTypeId?: string
  /** Обложка с сервера (если есть фото) */
  coverImage?: string
}

export interface Booking {
  id: number
  courtId: number
  court: Court
  date: string
  time: string
  duration: number
  price: number
  status: 'upcoming' | 'completed' | 'cancelled'
  createdAt: string
  addOns?: { name: string; price: number }[]
  venueType?: 'sport' | 'loft' | 'pool'
  code?: string
}

export interface AddBookingOptions {
  isoDate?: string
  price?: number
  paymentMethod?: 'online' | 'cash'
  addOns?: { name: string; price: number }[]
  requestCallback?: boolean
}

export const COURTS: Court[] = [
  {
    id: 1, emoji: '🎾', sport: 'Теннис', name: 'Корт "Спарта"',
    location: 'Парк Горького', address: 'ул. Крымский Вал, 9, Москва',
    rating: 4.9, reviews: 128, price: 1500, color: '#22c55e',
    available: true, distance: '1.2 км',
    amenities: ['Освещение', 'Душ', 'Прокат ракеток', 'Парковка', 'Кафе'],
    description: 'Профессиональный хард-корт в самом центре Парка Горького. Новое покрытие, отличное освещение, услуги тренера по запросу.',
    photos: [
      'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
      'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
      'linear-gradient(135deg, #052e16 0%, #166534 100%)',
    ],
    slots: ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00', '18:30', '20:00'],
    lat: 55.73, lng: 37.60,
  },
  {
    id: 2, emoji: '⚽', sport: 'Футбол', name: 'Поле "Олимп" 5×5',
    location: 'Олимпийский', address: 'Олимпийский пр., 16, Москва',
    rating: 4.6, reviews: 95, price: 2400, color: '#3b82f6',
    available: true, distance: '2.4 км',
    amenities: ['Искусственный газон', 'Табло', 'Раздевалки', 'Душ', 'Освещение'],
    description: 'Современное поле 5×5 с искусственным газоном FIFA Quality Pro. Подходит для мини-футбола и тренировок.',
    photos: [
      'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)',
      'linear-gradient(135deg, #172554 0%, #1e40af 100%)',
      'linear-gradient(135deg, #0c1e3e 0%, #1d4ed8 100%)',
    ],
    slots: ['08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '21:00'],
    lat: 55.78, lng: 37.62,
  },
  {
    id: 3, emoji: '🏀', sport: 'Баскетбол', name: 'Arena ЦСКА',
    location: 'Ленинградский пр.', address: 'Ленинградский пр., 39с1, Москва',
    rating: 4.7, reviews: 84, price: 900, color: '#f97316',
    available: true, distance: '3.1 км',
    amenities: ['Трибуны', 'Электронное табло', 'Кафе', 'Парковка'],
    description: 'Профессиональный баскетбольный зал с паркетным покрытием. Идеален для игр и тренировок любого уровня.',
    photos: [
      'linear-gradient(135deg, #431407 0%, #c2410c 50%, #ea580c 100%)',
      'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
      'linear-gradient(135deg, #431407 0%, #9a3412 100%)',
    ],
    slots: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00'],
    lat: 55.79, lng: 37.55,
  },
  {
    id: 4, emoji: '🏸', sport: 'Бадминтон', name: 'Бадминтон Plaza',
    location: 'Сокольники', address: 'ул. Сокольнический Вал, 1, Москва',
    rating: 4.8, reviews: 56, price: 700, color: '#a855f7',
    available: false, distance: '4.5 км',
    amenities: ['Профессиональное освещение', 'Прокат ракеток', 'Воланы в аренду'],
    description: 'Крытый зал для бадминтона с 6 кортами. Профессиональное освещение, деревянное покрытие.',
    photos: [
      'linear-gradient(135deg, #2e1065 0%, #7c3aed 50%, #8b5cf6 100%)',
      'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
      'linear-gradient(135deg, #3b0764 0%, #7e22ce 100%)',
    ],
    slots: ['10:00', '11:30', '13:00', '15:00', '17:00', '19:00'],
    lat: 55.79, lng: 37.67,
  },
  {
    id: 5, emoji: '🎾', sport: 'Теннис', name: 'Лужники — Корт 1',
    location: 'Лужники', address: 'Лужнецкая наб., 24, Москва',
    rating: 5.0, reviews: 210, price: 3000, color: '#22c55e',
    available: true, distance: '5.0 км',
    amenities: ['Покрытие Roland Garros', 'Освещение', 'Душ', 'Услуги тренера', 'Видеоразбор'],
    description: 'Легендарный корт Олимпийского комплекса Лужники. Грунтовое покрытие, как на Roland Garros. Лучший выбор для соревнований.',
    photos: [
      'linear-gradient(135deg, #052e16 0%, #14532d 50%, #15803d 100%)',
      'linear-gradient(135deg, #064e3b 0%, #166534 100%)',
      'linear-gradient(135deg, #0f2f1a 0%, #16a34a 100%)',
    ],
    slots: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    lat: 55.72, lng: 37.56,
  },
  {
    id: 7, emoji: '🏐', sport: 'Волейбол', name: 'Динамо Волей',
    location: 'Динамо', address: 'Ленинградский пр., 36, Москва',
    rating: 4.4, reviews: 43, price: 1200, color: '#06b6d4',
    available: true, distance: '3.8 км',
    amenities: ['Профессиональные сетки', 'Трибуны', 'Душ'],
    description: 'Волейбольный зал клуба Динамо с профессиональным деревянным покрытием. Трибуны на 200 мест.',
    photos: [
      'linear-gradient(135deg, #0c2d48 0%, #0891b2 50%, #06b6d4 100%)',
      'linear-gradient(135deg, #083344 0%, #0e7490 100%)',
      'linear-gradient(135deg, #0a1628 0%, #0891b2 100%)',
    ],
    slots: ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'],
    lat: 55.79, lng: 37.55,
  },
]

interface BookingContextType {
  bookings: Booking[]
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
  addBooking: (
    court: Court,
    date: string,
    time: string,
    duration: number,
    options?: AddBookingOptions,
  ) => Promise<Booking>
  addLoftBooking: (loft: Loft, timeSlot: string, addOns: AddOn[], totalPrice: number) => Promise<Booking>
  cancelBooking: (id: number) => Promise<void>
}

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setBookings([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const rows = await fetchClientBookings()
      setBookings(rows)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить брони')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    void reload()
  }, [reload])

  async function addBooking(
    court: Court,
    _dateLabel: string,
    time: string,
    duration: number,
    options?: AddBookingOptions,
  ): Promise<Booking> {
    const price = options?.price ?? Math.round(court.price * (duration / 60))
    const isoDate = options?.isoDate ?? todayIsoDate()

    const payload = buildCreatePayloadFromCourt(court, isoDate, time, duration, price, {
      paymentMethod: options?.paymentMethod ?? 'online',
      addOns: options?.addOns,
      requestCallback: options?.requestCallback,
    })

    const booking = await createClientBooking(payload)
    setBookings(prev => [booking, ...prev.filter(b => b.id !== booking.id)])
    return booking
  }

  function loftAsCourt(loft: Loft): Court {
    const idx = LOFTS.indexOf(loft)
    return {
      id: 900 + (idx >= 0 ? idx : 0),
      emoji: '🏢',
      sport: 'Лофт',
      name: loft.name,
      location: loft.location,
      address: loft.location,
      rating: loft.rating,
      reviews: loft.reviews,
      price: loft.price,
      color: '#F97316',
      available: true,
      distance: loft.metro,
      amenities: loft.features,
      description: loft.description,
      photos: [loft.gradient],
      slots: loft.timeSlots,
      lat: 55.75,
      lng: 37.62,
      venueType: 'loft',
    }
  }

  async function addLoftBooking(
    loft: Loft,
    timeSlot: string,
    addOns: AddOn[],
    totalPrice: number,
  ): Promise<Booking> {
    const court = loftAsCourt(loft)
    const isoDate = todayIsoDate()
    const payload = buildCreatePayloadFromCourt(court, isoDate, timeSlot, 120, totalPrice, {
      paymentMethod: 'online',
      addOns: addOns.map(a => ({ name: a.name, price: a.price })),
    })
    payload.venueRef = loftVenueRef(loft.id)

    const booking = await createClientBooking(payload)
    setBookings(prev => [booking, ...prev.filter(b => b.id !== booking.id)])
    return booking
  }

  async function cancelBooking(id: number) {
    const updated = await cancelClientBooking(id)
    setBookings(prev => prev.map(b => (b.id === id ? updated : b)))
  }

  return (
    <BookingContext.Provider value={{ bookings, isLoading, error, reload, addBooking, addLoftBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookings must be used within BookingProvider')
  return ctx
}
