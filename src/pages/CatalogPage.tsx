import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import { motion } from 'framer-motion'
import { SlidersHorizontal, MapPin, Calendar, Search, X } from 'lucide-react'
import { VenueCard } from '../components/ui/VenueCard'
import { SportFilterChips } from '../components/ui/SportFilterChips'
import { usePublicVenues } from '../contexts/PublicVenuesContext'
import { COURTS } from '../contexts/BookingContext'
import { LOFTS } from '../data/venues'
import { POOLS } from '../data/pools'
import {
  ALL_VENUE_CHIP,
  buildVenueFilterChips,
  getSportByLabel,
  sportChipsMatchingQuery,
  type VenueFilterChip,
} from '../data/sportTypes'
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
  sportTypeId?: string | null
}

function itemMatchesSearch(item: CatalogItem, q: string): boolean {
  const query = q.trim().toLowerCase()
  if (!query) return true
  return (
    item.title.toLowerCase().includes(query)
    || item.location.toLowerCase().includes(query)
    || item.badge.toLowerCase().includes(query)
    || item.description.toLowerCase().includes(query)
    || sportChipsMatchingQuery(query).some(c => c.id === item.sportTypeId)
  )
}

function itemMatchesSportChip(item: CatalogItem, chipId: string): boolean {
  if (chipId === 'all') return true
  if (chipId === 'pool') return item.type === 'pool'
  if (chipId === 'loft') return item.type === 'loft'
  if (chipId === 'meeting') return item.type === 'meeting'
  return item.sportTypeId === chipId
}

export function CatalogPage() {
  const { catalogItems } = usePublicVenues()
  const [params, setParams] = useSearchParams()
  const initialType = params.get('type') ?? 'all'
  const initialSport = params.get('sport') ?? 'all'
  const initialQuery = params.get('q') ?? ''
  const city = params.get('city') ?? ''
  const date = params.get('date') ?? ''
  const [filter, setFilter] = useState<string>(initialType)
  const [sportFilter, setSportFilter] = useState(initialSport)
  const [search, setSearch] = useState(initialQuery)

  useEffect(() => {
    setFilter(initialType)
    setSportFilter(initialSport)
    setSearch(initialQuery)
  }, [initialType, initialSport, initialQuery])

  const sportItems = useMemo<CatalogItem[]>(() => COURTS.filter((c) => c.available).map((c) => ({
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
    sportTypeId: getSportByLabel(c.sport)?.id ?? null,
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
    sportTypeId: 'swimming',
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
      sportTypeId: 'sportTypeId' in item ? (item as CatalogItem).sportTypeId : null,
    })),
    [catalogItems],
  )

  const allItems = useMemo(
    () => [...partnerItems, ...sportItems, ...loftItems, ...poolItems],
    [partnerItems, sportItems, loftItems, poolItems],
  )

  const sportChips = useMemo((): VenueFilterChip[] => {
    const sportIds = new Set<string>()
    for (const item of allItems) {
      if (item.sportTypeId) sportIds.add(item.sportTypeId)
    }
    const fromItems = buildVenueFilterChips(
      allItems.map(i => ({
        id: 0,
        emoji: '',
        sport: i.badge,
        sportTypeId: i.sportTypeId ?? undefined,
        venueType: i.type === 'loft' ? 'loft' : i.type === 'pool' ? 'pool' : 'sport',
        name: i.title,
        location: i.location,
        address: i.location,
        rating: i.rating,
        reviews: 0,
        price: 0,
        color: '',
        available: true,
        distance: '',
        amenities: [],
        description: i.description,
        photos: [i.gradient],
        slots: [],
      })),
    ).filter(c => c.kind === 'sport' || c.kind === 'venue')
    return fromItems.filter(c => c.id !== 'all')
  }, [allItems])

  const searchSportSuggestions = useMemo(
    () => sportChipsMatchingQuery(search),
    [search],
  )

  const visibleSportChips = useMemo(() => {
    if (search.trim()) {
      const suggested = searchSportSuggestions
      if (suggested.length) return suggested
    }
    if (filter === 'sport' || sportFilter !== 'all') return sportChips
    if (search.trim()) return sportChips
    return []
  }, [search, filter, sportFilter, sportChips, searchSportSuggestions])

  const filtered = useMemo(() => {
    let items = allItems
    if (filter === 'sport') items = items.filter(i => i.type === 'sport')
    else if (filter === 'loft') items = items.filter(i => i.type === 'loft')
    else if (filter === 'pool') items = items.filter(i => i.type === 'pool')
    else if (filter === 'meeting') items = items.filter(i => i.type === 'meeting')

    if (sportFilter !== 'all') {
      items = items.filter(i => itemMatchesSportChip(i, sportFilter))
    }

    if (search.trim()) {
      items = items.filter(i => itemMatchesSearch(i, search))
    }

    return items
  }, [filter, sportFilter, search, allItems])

  const pills = [
    { id: 'all', emoji: '✨', label: `Все · ${allItems.length}` },
    { id: 'sport', emoji: '🏅', label: `Спорт · ${allItems.filter(i => i.type === 'sport').length}` },
    { id: 'loft', emoji: '🏢', label: `Лофты · ${allItems.filter(i => i.type === 'loft').length}` },
    { id: 'pool', emoji: '🏊', label: `Бассейны · ${allItems.filter(i => i.type === 'pool').length}` },
    ...(partnerItems.some(i => i.type === 'meeting')
      ? [{ id: 'meeting', emoji: '💼', label: `Переговорные · ${allItems.filter(i => i.type === 'meeting').length}` }]
      : []),
  ]

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === 'all') next.delete(key)
      else next.set(key, value)
    }
    setParams(next)
  }

  function setFilterAndUrl(id: string) {
    setFilter(id)
    if (id !== 'sport') setSportFilter('all')
    updateParams({ type: id === 'all' ? null : id, sport: id === 'sport' ? sportFilter : null })
  }

  function setSportFilterAndUrl(id: string) {
    setSportFilter(id)
    if (id !== 'all' && filter === 'all') setFilter('sport')
    updateParams({
      sport: id,
      type: id !== 'all' ? 'sport' : filter === 'all' ? null : filter,
      q: search.trim() || null,
    })
  }

  function setSearchAndUrl(value: string) {
    setSearch(value)
    updateParams({ q: value.trim() || null })
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{ position: 'relative', maxWidth: 480, marginBottom: 18 }}
      >
        <Search size={16} color={colors.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={search}
          onChange={e => setSearchAndUrl(e.target.value)}
          placeholder="Поиск по названию или виду спорта…"
          style={{
            width: '100%',
            padding: '13px 40px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: colors.text,
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearchAndUrl('')}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: colors.muted, display: 'flex' }}
          >
            <X size={16} />
          </button>
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

      {visibleSportChips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: 14, marginBottom: 20 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.muted, marginBottom: 8 }}>
            {search.trim() ? 'Виды спорта по запросу' : 'Виды спорта'}
          </div>
          <SportFilterChips
            chips={[ALL_VENUE_CHIP, ...visibleSportChips]}
            activeId={sportFilter}
            onSelect={setSportFilterAndUrl}
          />
        </motion.div>
      )}

      <motion.div className="site-grid-catalog" layout>
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
