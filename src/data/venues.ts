import type { Court } from '../contexts/BookingContext'
import { COURTS } from '../contexts/BookingContext'

export type VenueCategory = 'sport' | 'loft' | 'meeting' | 'hotel'

export interface Partner {
  id: string
  name: string
  type: VenueCategory
  description: string
  location: string
  venueCount: number
  gradient: string
  emoji: string
}

export interface AddOnOption {
  id: string
  name: string
  description: string
  image: string
  price?: number
}

export interface AddOn {
  id: string
  name: string
  description: string
  price: number
  icon: 'utensils' | 'wine' | 'projector' | 'music' | 'camera' | 'sparkles'
  mode?: 'toggle' | 'select'
  options?: AddOnOption[]
}

const SNACK_OPTIONS: AddOnOption[] = [
  { id: 'classic', name: 'Классический сет', description: 'Сырная тарелка, мясные нарезки, оливки', image: 'linear-gradient(135deg, #78350F 0%, #D97706 100%)' },
  { id: 'mediterranean', name: 'Средиземноморский', description: 'Хумус, табуле, лаваш, овощи гриль', image: 'linear-gradient(135deg, #14532D 0%, #4ADE80 100%)' },
  { id: 'premium', name: 'Premium', description: 'Устрицы, лобстер, трюфельная паста', image: 'linear-gradient(135deg, #1E1B4B 0%, #6366F1 100%)', price: 4500 },
]

const BAR_OPTIONS: AddOnOption[] = [
  { id: 'standard', name: 'Стандартная карта', description: 'Пиво, вино, базовые коктейли', image: 'linear-gradient(135deg, #7C2D12 0%, #F97316 100%)' },
  { id: 'premium', name: 'Premium bar', description: 'Крепкий алкоголь, авторские коктейли', image: 'linear-gradient(135deg, #581C87 0%, #C084FC 100%)', price: 6000 },
  { id: 'mocktail', name: 'Безалкогольная', description: '15 напитков без алкоголя', image: 'linear-gradient(135deg, #0C4A6E 0%, #38BDF8 100%)', price: 2500 },
]

const COFFEE_OPTIONS: AddOnOption[] = [
  { id: 'basic', name: 'Базовый', description: 'Кофе, чай, печенье', image: 'linear-gradient(135deg, #44403C 0%, #A8A29E 100%)' },
  { id: 'business', name: 'Business', description: 'Капучино, круассаны, фрукты', image: 'linear-gradient(135deg, #78350F 0%, #FBBF24 100%)', price: 2200 },
]

export interface Loft {
  id: string
  partnerId: string
  name: string
  sqm: number
  capacity: number
  price: number
  rating: number
  reviews: number
  location: string
  metro: string
  features: string[]
  gradient: string
  description: string
  timeSlots: string[]
  addOns: AddOn[]
}

export const PARTNERS: Partner[] = [
  {
    id: 'aquasport',
    name: 'AquaSport Arena',
    type: 'sport',
    description: '12 бассейнов и спортивных кортов',
    location: 'Москва',
    venueCount: 12,
    gradient: 'linear-gradient(135deg, #1E3A5F 0%, #3B82F6 100%)',
    emoji: '🏊',
  },
  {
    id: 'loft-co',
    name: 'Loft & Co',
    type: 'loft',
    description: '4 лофта с кейтерингом и услугами',
    location: 'Москва',
    venueCount: 4,
    gradient: 'linear-gradient(135deg, #7C2D12 0%, #F97316 100%)',
    emoji: '🏢',
  },
  {
    id: 'urban-loft',
    name: 'Urban Loft Studio',
    type: 'loft',
    description: '3 лофта с фото-зоной и баром',
    location: 'Санкт-Петербург',
    venueCount: 3,
    gradient: 'linear-gradient(135deg, #581C87 0%, #A855F7 100%)',
    emoji: '🏢',
  },
]

export const LOFTS: Loft[] = [
  {
    id: 'loft-sunset',
    partnerId: 'loft-co',
    name: 'Loft Sunset',
    sqm: 80,
    capacity: 30,
    price: 5000,
    rating: 4.9,
    reviews: 128,
    location: 'Москва, Таганская',
    metro: 'м. Таганская',
    features: ['Панорамные окна', 'Кухня', 'Бар', 'Проектор'],
    gradient: 'linear-gradient(135deg, #7C2D12 0%, #F97316 50%, #FBBF24 100%)',
    description: 'Просторный лофт с панорамным видом на город. Идеален для вечеринок, корпоративов и съёмок.',
    timeSlots: ['18:00–20:00', '20:00–22:00', '22:00–00:00'],
    addOns: [
      { id: 'snacks', name: 'Сет закусок', description: '5 позиций · на 10 человек', price: 2500, icon: 'utensils', mode: 'select', options: SNACK_OPTIONS },
      { id: 'bar', name: 'Барная карта', description: '15 напитков · безлимит 2ч', price: 4000, icon: 'wine', mode: 'select', options: BAR_OPTIONS },
      { id: 'projector', name: 'Проектор + экран', description: 'Full HD · HDMI', price: 800, icon: 'projector', mode: 'toggle' },
      { id: 'dj', name: 'DJ + оборудование', description: '2 часа · 2 колонки', price: 6000, icon: 'music', mode: 'toggle' },
      { id: 'photo', name: 'Фотограф', description: '2 часа · 50 фото', price: 8000, icon: 'camera', mode: 'toggle' },
      { id: 'cleaning', name: 'Уборка premium', description: 'После мероприятия', price: 1500, icon: 'sparkles', mode: 'toggle' },
    ],
  },
  {
    id: 'loft-industrial',
    partnerId: 'loft-co',
    name: 'Loft Industrial',
    sqm: 120,
    capacity: 50,
    price: 7000,
    rating: 4.8,
    reviews: 86,
    location: 'Москва, Курская',
    metro: 'м. Курская',
    features: ['Кирпичные стены', 'Высокие потолки', 'Сцена', 'Кухня'],
    gradient: 'linear-gradient(135deg, #44403C 0%, #78716C 100%)',
    description: 'Индустриальный лофт в стиле брутализм. Подходит для концертов и больших мероприятий.',
    timeSlots: ['12:00–16:00', '17:00–21:00', '22:00–02:00'],
    addOns: [
      { id: 'snacks', name: 'Сет закусок', description: '8 позиций · на 20 человек', price: 4500, icon: 'utensils', mode: 'select', options: SNACK_OPTIONS },
      { id: 'bar', name: 'Барная карта', description: '20 напитков · безлимит 3ч', price: 6000, icon: 'wine', mode: 'select', options: BAR_OPTIONS },
      { id: 'dj', name: 'DJ + оборудование', description: '4 часа · профессиональный сет', price: 10000, icon: 'music', mode: 'toggle' },
    ],
  },
  {
    id: 'studio-white',
    partnerId: 'urban-loft',
    name: 'Studio White',
    sqm: 60,
    capacity: 20,
    price: 4500,
    rating: 4.9,
    reviews: 94,
    location: 'СПб, Невский',
    metro: 'м. Маяковская',
    features: ['Фото-зона', 'Проектор', 'Белые стены', 'Естественный свет'],
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #C084FC 100%)',
    description: 'Минималистичный белый лофт для фотосессий, презентаций и камерных мероприятий.',
    timeSlots: ['10:00–14:00', '15:00–19:00', '20:00–00:00'],
    addOns: [
      { id: 'photo', name: 'Фотограф', description: '3 часа · 80 фото', price: 12000, icon: 'camera', mode: 'toggle' },
      { id: 'snacks', name: 'Кофе-брейк', description: 'Кофе, чай, печенье', price: 1500, icon: 'utensils', mode: 'select', options: COFFEE_OPTIONS },
      { id: 'projector', name: 'Проектор 4K', description: 'Ultra HD · Apple TV', price: 1200, icon: 'projector', mode: 'toggle' },
    ],
  },
]

export const CATEGORIES = [
  { id: 'sport' as const, emoji: '🏊', label: 'Спорт и бассейны', color: '#3B82F6' },
  { id: 'loft' as const, emoji: '🏢', label: 'Лофты', color: '#F97316' },
  { id: 'meeting' as const, emoji: '💼', label: 'Переговорные', color: '#A855F7' },
  { id: 'hotel' as const, emoji: '🏨', label: 'Отели', color: '#EC4899' },
]

export const FEATURES = [
  { icon: 'zap' as const, title: 'Мгновенное бронирование', desc: 'Выбери слот — оплати — готово за 2 минуты', color: '#22C55E' },
  { icon: 'plus-circle' as const, title: 'Услуги при бронировании', desc: 'Закуски, напитки, оборудование — всё в одном заказе', color: '#F97316' },
  { icon: 'shield-check' as const, title: 'Гарантия брони', desc: 'Подтверждение сразу, отмена за 24 часа бесплатно', color: '#3B82F6' },
]

export function getLoft(id: string) {
  return LOFTS.find((l) => l.id === id)
}

export function getAddonPrice(addon: AddOn, optionId?: string) {
  if (addon.mode === 'select' && addon.options && optionId) {
    const option = addon.options.find((o) => o.id === optionId)
    return option?.price ?? addon.price
  }
  return addon.price
}

export function getAddonOption(addon: AddOn, optionId?: string) {
  if (!addon.options || !optionId) return undefined
  return addon.options.find((o) => o.id === optionId)
}

export function getCourt(id: number): Court | undefined {
  return COURTS.find((c) => c.id === id)
}

export function getPartnerCourts(partnerId: string): Court[] {
  if (partnerId === 'aquasport') {
    return COURTS.filter((c) => ['Бассейн', 'Теннис', 'Футбол', 'Волейбол', 'Баскетбол'].includes(c.sport))
  }
  return []
}
