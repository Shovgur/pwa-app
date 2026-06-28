import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import { motion } from 'framer-motion'
import { SlidersHorizontal, MapPin, Calendar } from 'lucide-react'
import { VenueCard } from '../components/ui/VenueCard'
import { COURTS } from '../contexts/BookingContext'
import { LOFTS } from '../data/venues'
import { colors } from '../theme/tokens'

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const initialType = params.get('type') ?? 'all'
  const city = params.get('city') ?? ''
  const date = params.get('date') ?? ''
  const [filter, setFilter] = useState<string>(initialType)

  useEffect(() => {
    setFilter(initialType)
  }, [initialType])

  const sportItems = useMemo(() => COURTS.filter((c) => c.available).slice(0, 4).map((c) => ({
    to: `/sport/${c.id}`,
    badge: c.sport,
    title: c.name,
    location: c.location,
    description: c.description.slice(0, 90) + '…',
    price: `${c.price.toLocaleString()} ₽/час`,
    rating: c.rating,
    gradient: c.photos[0],
    type: 'sport' as const,
  })), [])

  const loftItems = useMemo(() => LOFTS.map((l) => ({
    to: `/loft/${l.id}`,
    badge: 'Лофт + услуги',
    title: l.name,
    location: l.location,
    description: l.description,
    price: `${l.price.toLocaleString()} ₽/час`,
    rating: l.rating,
    gradient: l.gradient,
    type: 'loft' as const,
  })), [])

  const allItems = useMemo(() => [...sportItems, ...loftItems], [sportItems, loftItems])

  const filtered = useMemo(() => {
    if (filter === 'all') return allItems
    if (filter === 'sport') return allItems.filter((i) => i.type === 'sport')
    if (filter === 'loft') return allItems.filter((i) => i.type === 'loft')
    return allItems
  }, [filter, allItems])

  const pills = [
    { id: 'all', emoji: '✨', label: `Все · ${allItems.length}` },
    { id: 'sport', emoji: '🏊', label: `Спорт · ${sportItems.length}` },
    { id: 'loft', emoji: '🏢', label: `Лофты · ${loftItems.length}` },
  ]

  function setFilterAndUrl(id: string) {
    setFilter(id)
    const next = new URLSearchParams(params)
    if (id === 'all') next.delete('type')
    else next.set('type', id)
    setParams(next)
  }

  const dateLabel = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : null

  return (
    <div className="site-container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <SeoHead
        title="Каталог площадок — спорт, лофты, переговорные"
        description="Бронируй спортивные залы, бассейны, лофты и переговорные онлайн. Москва, Санкт-Петербург. Быстрое бронирование, выбор времени и услуг."
        path="/catalog"
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title" style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Все площадки</h1>
        <p style={{ color: colors.muted, fontSize: 16, marginBottom: 16 }}>3 партнёра · Спорт, лофты и переговорные</p>
        {(city || dateLabel) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
            {city && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, background: colors.greenDim, fontSize: 13, fontWeight: 600, color: colors.green }}>
                <MapPin size={14} /> {city}
              </span>
            )}
            {dateLabel && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, background: 'rgba(59,130,246,0.15)', fontSize: 13, fontWeight: 600, color: '#3B82F6' }}>
                <Calendar size={14} /> {dateLabel}
              </span>
            )}
          </div>
        )}
      </motion.div>

      <motion.div className="catalog-filters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {pills.map((p) => (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => setFilterAndUrl(p.id)}
            className={`catalog-filter-chip ${filter === p.id ? 'catalog-filter-chip--active' : ''}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>{p.emoji}</span> {p.label}
          </motion.button>
        ))}
        <motion.button
          type="button"
          className="catalog-filter-chip catalog-filter-chip--filters"
          whileHover={{ scale: 1.03 }}
        >
          <SlidersHorizontal size={16} /> Фильтры
        </motion.button>
      </motion.div>

      <motion.div
        className="site-grid-catalog"
        layout
      >
        {filtered.map((item, i) => (
          <VenueCard key={item.to} {...item} variant="featured" delay={i * 0.05} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: colors.muted, padding: 48 }}>Нет площадок в этой категории</p>
      )}
    </div>
  )
}
