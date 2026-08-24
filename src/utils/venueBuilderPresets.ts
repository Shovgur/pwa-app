import type { VenueKind } from '../lib/partnerCrm'
import type { ExtraBilling, VenueExtraService } from '../lib/partnerVenues'

export interface PresetExtra {
  name: string
  description: string
  price: number
  billing: ExtraBilling
}

export interface PresetAmenity {
  label: string
}

const SPORT_EXTRAS: PresetExtra[] = [
  { name: 'Аренда ракеток', description: '2 ракетки + мячи', price: 500, billing: 'per_booking' },
  { name: 'Инвентарь', description: 'Мячи, сетка, конусы', price: 300, billing: 'per_booking' },
  { name: 'Тренер', description: '1 час с инструктором', price: 2500, billing: 'per_hour' },
  { name: 'Раздевалка', description: 'Душ и шкафчики', price: 200, billing: 'per_person' },
]

const LOFT_EXTRAS: PresetExtra[] = [
  { name: 'Кейтеринг', description: 'Сет закусок на 10 чел.', price: 3500, billing: 'per_booking' },
  { name: 'Барная карта', description: 'Безлимит 2 часа', price: 5000, billing: 'per_booking' },
  { name: 'Проектор + экран', description: 'Full HD, HDMI', price: 800, billing: 'per_booking' },
  { name: 'DJ + звук', description: '2 часа, 2 колонки', price: 6000, billing: 'per_booking' },
  { name: 'Фотограф', description: '2 часа, 50 фото', price: 8000, billing: 'per_booking' },
  { name: 'Уборка premium', description: 'После мероприятия', price: 1500, billing: 'per_booking' },
]

const POOL_EXTRAS: PresetExtra[] = [
  { name: 'Полотенце', description: '1 шт.', price: 150, billing: 'per_person' },
  { name: 'Шапочка', description: 'Силиконовая', price: 100, billing: 'per_person' },
  { name: 'Тренер', description: 'Индивидуальное занятие', price: 2000, billing: 'per_hour' },
]

const MEETING_EXTRAS: PresetExtra[] = [
  { name: 'Кофе-брейк', description: 'Кофе, чай, вода', price: 350, billing: 'per_person' },
  { name: 'Проектор', description: 'Full HD + кабели', price: 600, billing: 'per_booking' },
  { name: 'Флипчарт', description: 'С маркерами', price: 300, billing: 'per_booking' },
  { name: 'Видеоконференция', description: 'Zoom/Teams setup', price: 500, billing: 'per_booking' },
]

const SPORT_AMENITIES = ['Парковка', 'Душ', 'Раздевалка', 'Освещение', 'Трибуны', 'Кафе', 'Wi‑Fi']
const LOFT_AMENITIES = ['Кухня', 'Бар', 'Панорамные окна', 'Мебель', 'Сцена', 'Гардероб', 'Кондиционер', 'Wi‑Fi']
const POOL_AMENITIES = ['Душ', 'Сауна', 'Шкафчики', 'Полотенца', 'Детская зона', 'Парковка', 'Wi‑Fi']
const MEETING_AMENITIES = ['Проектор', 'Доска', 'Видеосвязь', 'Кофемашина', 'Климат-контроль', 'Wi‑Fi', 'Парковка']

const TIME_PRESETS = [
  { label: 'Утро', timeFrom: '08:00', timeTo: '12:00' },
  { label: 'День', timeFrom: '12:00', timeTo: '17:00' },
  { label: 'Вечер', timeFrom: '17:00', timeTo: '22:00' },
  { label: 'Ночь', timeFrom: '22:00', timeTo: '02:00' },
]

export function presetExtrasForKind(kind: VenueKind): PresetExtra[] {
  switch (kind) {
    case 'sport': return SPORT_EXTRAS
    case 'loft': return LOFT_EXTRAS
    case 'pool': return POOL_EXTRAS
    case 'meeting': return MEETING_EXTRAS
  }
}

export function presetAmenitiesForKind(kind: VenueKind): string[] {
  switch (kind) {
    case 'sport': return SPORT_AMENITIES
    case 'loft': return LOFT_AMENITIES
    case 'pool': return POOL_AMENITIES
    case 'meeting': return MEETING_AMENITIES
  }
}

export function timePricePresets() {
  return TIME_PRESETS
}

export function makeExtraFromPreset(preset: PresetExtra): VenueExtraService {
  return {
    id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...preset,
  }
}

export const BILLING_LABEL: Record<ExtraBilling, string> = {
  per_booking: 'за бронь',
  per_hour: 'за час',
  per_person: 'за человека',
}
