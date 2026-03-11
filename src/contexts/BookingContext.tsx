import { createContext, useContext, useState, type ReactNode } from 'react'

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
  lat: number
  lng: number
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
    id: 6, emoji: '🏊', sport: 'Бассейн', name: 'Aqua Sport',
    location: 'Измайлово', address: 'Измайловское ш., 71, Москва',
    rating: 4.5, reviews: 312, price: 600, color: '#f59e0b',
    available: true, distance: '6.3 км',
    amenities: ['50-метровая дорожка', 'Раздевалки', 'Сауна', 'Тренер по плаванию'],
    description: 'Олимпийский бассейн 50м с 8 дорожками. Подходит для профессиональных тренировок и любительского плавания.',
    photos: [
      'linear-gradient(135deg, #1c1917 0%, #d97706 50%, #f59e0b 100%)',
      'linear-gradient(135deg, #451a03 0%, #b45309 100%)',
      'linear-gradient(135deg, #1c0a00 0%, #d97706 100%)',
    ],
    slots: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    lat: 55.78, lng: 37.75,
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

const INITIAL_BOOKINGS: Booking[] = [
  { id: 1, courtId: 1, court: COURTS[0], date: '11 марта', time: '18:00', duration: 90, price: 2250, status: 'upcoming', createdAt: '2026-03-10' },
  { id: 2, courtId: 2, court: COURTS[1], date: '15 марта', time: '10:00', duration: 60, price: 2400, status: 'upcoming', createdAt: '2026-03-11' },
  { id: 3, courtId: 3, court: COURTS[2], date: '5 марта', time: '20:00', duration: 60, price: 900, status: 'completed', createdAt: '2026-03-04' },
  { id: 4, courtId: 4, court: COURTS[3], date: '28 февраля', time: '12:00', duration: 60, price: 700, status: 'completed', createdAt: '2026-02-27' },
  { id: 5, courtId: 5, court: COURTS[4], date: '20 февраля', time: '09:00', duration: 60, price: 3000, status: 'cancelled', createdAt: '2026-02-18' },
]

interface BookingContextType {
  bookings: Booking[]
  addBooking: (court: Court, date: string, time: string, duration: number) => Booking
  cancelBooking: (id: number) => void
}

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS)

  function addBooking(court: Court, date: string, time: string, duration: number): Booking {
    const price = Math.round(court.price * (duration / 60))
    const booking: Booking = {
      id: Date.now(),
      courtId: court.id,
      court,
      date,
      time,
      duration,
      price,
      status: 'upcoming',
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setBookings(prev => [booking, ...prev])
    return booking
  }

  function cancelBooking(id: number) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b))
  }

  return (
    <BookingContext.Provider value={{ bookings, addBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookings must be used within BookingProvider')
  return ctx
}
