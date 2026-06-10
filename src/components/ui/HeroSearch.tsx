import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, LayoutGrid } from 'lucide-react'
import { SelectMenu } from './SelectMenu'
import { DatePickerField } from './DatePickerField'
import { colors } from '../../theme/tokens'

const CITIES = [
  { value: 'Москва', label: 'Москва' },
  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
  { value: 'Казань', label: 'Казань' },
]

const CATEGORIES = [
  { value: 'all', label: 'Все категории' },
  { value: 'sport', label: 'Спорт и бассейны' },
  { value: 'loft', label: 'Лофты' },
  { value: 'meeting', label: 'Переговорные' },
  { value: 'hotel', label: 'Отели' },
]

export function HeroSearch() {
  const navigate = useNavigate()
  const [city, setCity] = useState('Москва')
  const [date, setDate] = useState('2026-06-10')
  const [category, setCategory] = useState('all')

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (category !== 'all') params.set('type', category)
    params.set('city', city)
    params.set('date', date)
    navigate(`/catalog?${params.toString()}`)
  }

  return (
    <motion.form
      onSubmit={handleSearch}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="hero-search"
    >
      <div className="hero-search-fields">
        <div className="hero-search-field">
          <SelectMenu
            label="Город"
            icon={<MapPin size={13} color={colors.green} />}
            value={city}
            options={CITIES}
            onChange={setCity}
            accent={colors.green}
          />
        </div>

        <div className="hero-search-field">
          <DatePickerField
            label="Дата"
            icon={<Calendar size={13} color={colors.blue} />}
            value={date}
            onChange={setDate}
          />
        </div>

        <div className="hero-search-field hero-search-field--last">
          <SelectMenu
            label="Категория"
            icon={<LayoutGrid size={13} color={colors.orange} />}
            value={category}
            options={CATEGORIES}
            onChange={setCategory}
            accent={colors.orange}
          />
        </div>
      </div>

      <motion.button
        type="submit"
        className="hero-search-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Search size={20} />
        <span>Найти площадки</span>
      </motion.button>
    </motion.form>
  )
}

export function HeroStats() {
  const stats = [
    { v: '3', l: 'Партнёра' },
    { v: '50+', l: 'Площадок' },
    { v: '4.9', l: 'Средний рейтинг' },
  ]

  return (
    <motion.div
      className="hero-stats"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
    >
      {stats.map((s, i) => (
        <div key={s.l} className="hero-stat-item">
          {i > 0 && <div className="hero-stat-divider" />}
          <div>
            <p className="hero-stat-value">{s.v}</p>
            <p className="hero-stat-label">{s.l}</p>
          </div>
        </div>
      ))}
    </motion.div>
  )
}
