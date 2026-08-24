import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import { motion } from 'framer-motion'
import { SlidersHorizontal, MapPin, Calendar } from 'lucide-react'
import { VenueCard } from '../components/ui/VenueCard'
import { usePublicVenues } from '../contexts/PublicVenuesContext'
import { COURTS } from '../contexts/BookingContext'
import { LOFTS } from '../data/venues'
import { POOLS } from '../data/pools'
import { colors } from '../theme/tokens'

type CatalogItem = {
  to: string
  badge: string
  title: string
  location: string
  description: string
  price: string
  rating: number
  gradient: string
  image?: string
  type: 'sport' | 'loft' | 'pool' | 'meeting'
}

export function CatalogPage() {
  const { catalogItems } = usePublicVenues()
  const [params, setParams] = useSearchParams()
  const initialType = params.get('type') ?? 'all'
  const city = params.get('city') ?? ''
  const date = params.get('date') ?? ''
  const [filter, setFilter] = useState<string>(initialType)

  useEffect(() => {
    setFilter(initialType)
  }, [initialType])

  const sportItems = useMemo<CatalogItem[]>(() => COURTS.filter((c) => c.available).slice(0, 4).map((c) => ({
    to: `/sport/${c.id}`,
    badge: c.sport,
    title: c.name,
    location: c.location,
    description: c.description.slice(0, 90) + '…',
    price: `${c.price.toLocaleString()} ₽/час`,
    rating: c.rating,
    gradient: c.photos[0],
    image: undefined,
    type: 'sport' as const,
  })), [])

  const loftItems = useMemo<CatalogItem[]>(() => LOFTS.map((l) => ({
    to: `/loft/${l.id}`,
    badge: 'Лофт + услуги',
    title: l.name,
    location: l.location,
    description: l.description,
    price: `${l.price.toLocaleString()} ₽/час`,
    rating: l.rating,
    gradient: l.gradient,
    image: undefined,
    type: 'loft' as const,
  })), [])

  const poolItems = useMemo<CatalogItem[]>(() => POOLS.map((p) => ({
    to: `/pools/${p.id}`,
    badge: '🏊 Бассейн',
    title: p.name,
    location: `${p.address} · ${p.city}`,
    description: `${p.sauna ? 'Сауна · ' : ''}${p.medCert ? 'Мед. справка' : 'Без справки'}`,
    price: `от ${p.price}`,
    rating: 4.7,
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 100%)',
    image: p.image,
    type: 'pool' as const,
  })), [])

  const partnerItems = useMemo<CatalogItem[]>(
    () => catalogItems.map(item => ({
      to: item.to,
      badge: item.badge,
      title: item.title,
      location: item.location,
      description: item.description ?? '',
      price: item.price,
      rating: item.rating,
      gradient: item.gradient,
      image: item.image,
      type: item.type,
    })),
    [catalogItems],
  )

  const allItems = useMemo(
    () => [...partnerItems, ...sportItems, ...loftItems, ...poolItems],
    [partnerItems, sportItems, loftItems, poolItems],
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return allItems
    if (filter === 'sport') return allItems.filter((i) => i.type === 'sport')
    if (filter === 'loft') return allItems.filter((i) => i.type === 'loft')
    if (filter === 'pool') return allItems.filter((i) => i.type === 'pool')
    if (filter === 'meeting') return allItems.filter((i) => i.type === 'meeting')
    return allItems
  }, [filter, allItems])

  const pills = [
    { id: 'all', emoji: '✨', label: `Все · ${allItems.length}` },
    { id: 'sport', emoji: '🏅', label: `Спорт · ${allItems.filter(i => i.type === 'sport').length}` },
    { id: 'loft', emoji: '🏢', label: `Лофты · ${allItems.filter(i => i.type === 'loft').length}` },
    { id: 'pool', emoji: '🏊', label: `Бассейны · ${allItems.filter(i => i.type === 'pool').length}` },
    ...(partnerItems.some(i => i.type === 'meeting')
      ? [{ id: 'meeting', emoji: '💼', label: `Переговорные · ${allItems.filter(i => i.type === 'meeting').length}` }]
      : []),
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
        <p style={{ color: colors.muted, fontSize: 16, marginBottom: 16 }}>Спорт, лофты, бассейны и переговорные</p>
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
          <VenueCard key={item.to} {...item} image={item.image} variant="featured" delay={i * 0.05} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: colors.muted, padding: 48 }}>Нет площадок в этой категории</p>
      )}
    </div>
  )
}
