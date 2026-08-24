import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import type { SchemaVenue } from '../components/SeoHead'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, MapPin, Sparkles, CheckCircle2, Clock, Tag } from 'lucide-react'
import { getLoft, getAddonPrice, getAddonOption } from '../data/venues'
import type { AddOn } from '../data/venues'
import { useBookings } from '../contexts/BookingContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { AddonCard } from '../components/ui/AddonCard'
import { BookingSummaryPanel } from '../components/ui/BookingSummaryPanel'
import type { SummaryLineItem } from '../components/ui/BookingSummaryPanel'
import { paths } from '../config/features'
import { useBookingPageReset } from '../hooks/useBookingPageReset'
import { colors } from '../theme/tokens'

export function LoftBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const loft = getLoft(id ?? '')
  const { addLoftBooking } = useBookings()
  const { isAuthenticated } = useAuth()

  const [selectedSlot, setSelectedSlot] = useState(1)
  const [enabledAddons, setEnabledAddons] = useState<Set<string>>(() => new Set())
  const [addonOptions, setAddonOptions] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  useBookingPageReset(id, () => {
    setSelectedSlot(1)
    setEnabledAddons(new Set())
    setAddonOptions({})
    setSuccess(false)
  })

  const selectedAddons = useMemo(() => {
    if (!loft) return []
    return loft.addOns.filter((a) => enabledAddons.has(a.id))
  }, [loft, enabledAddons])

  const addonTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addon) => {
      return sum + getAddonPrice(addon, addonOptions[addon.id])
    }, 0)
  }, [selectedAddons, addonOptions])

  const basePrice = loft ? loft.price * 2 : 0
  const total = basePrice + addonTotal
  const discount = addonTotal > 0 ? Math.round(addonTotal * 0.15) : 0

  if (!loft) {
    return (
      <div className="page-center">
        <p style={{ color: colors.muted, marginBottom: 16 }}>Лофт не найден</p>
        <Link to="/catalog"><Button>К каталогу</Button></Link>
      </div>
    )
  }

  const venue = loft
  const seoTitle = `${venue.name} — аренда лофта`
  const seoDesc = `${venue.description.slice(0, 130)}. Забронируй онлайн от ${venue.price.toLocaleString()} ₽/час. Услуги включены.`
  const schema: SchemaVenue = {
    name: venue.name,
    description: venue.description,
    address: venue.location,
    pricePerHour: venue.price,
    rating: venue.rating,
    type: 'EventVenue',
    url: `https://bookingo.ru/loft/${id}`,
  }

  function toggleAddon(addon: AddOn) {
    setEnabledAddons((prev) => {
      const next = new Set(prev)
      if (next.has(addon.id)) {
        next.delete(addon.id)
        setAddonOptions((opts) => {
          const copy = { ...opts }
          delete copy[addon.id]
          return copy
        })
      } else {
        next.add(addon.id)
        if (addon.mode === 'select' && addon.options?.[0]) {
          setAddonOptions((opts) => ({ ...opts, [addon.id]: addon.options![0].id }))
        }
      }
      return next
    })
  }

  function selectAddonOption(addonId: string, optionId: string) {
    setEnabledAddons((prev) => new Set(prev).add(addonId))
    setAddonOptions((prev) => ({ ...prev, [addonId]: optionId }))
  }

  async function handleBook() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/loft/${id}` } })
      return
    }
    const addons = selectedAddons.map((addon) => {
      const option = getAddonOption(addon, addonOptions[addon.id])
      const price = getAddonPrice(addon, addonOptions[addon.id])
      return {
        ...addon,
        name: option ? `${addon.name} · ${option.name}` : addon.name,
        price,
      }
    })
    try {
      await addLoftBooking(venue, venue.timeSlots[selectedSlot], addons, total - discount)
      setSuccess(true)
    } catch {
      // остаёмся на форме
    }
  }

  if (success) {
    return (
      <motion.div
        className="page-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle2 size={64} color={colors.orange} />
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Лофт забронирован!</h2>
        <p style={{ color: colors.muted, marginBottom: 8 }}>{venue.name} · {venue.timeSlots[selectedSlot]}</p>
        <p style={{ color: colors.orange, fontWeight: 700, marginBottom: 32, fontSize: 22 }}>{(total - discount).toLocaleString()} ₽</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to={paths.catalog}><Button variant="loft">К каталогу</Button></Link>
          <Link to={paths.home}><Button variant="ghost">На главную</Button></Link>
        </div>
      </motion.div>
    )
  }

  const selectedCount = selectedAddons.length

  const summaryLines: SummaryLineItem[] = [
    {
      id: 'rent',
      label: 'Аренда лофта',
      value: `${basePrice.toLocaleString()} ₽`,
    },
    ...selectedAddons.map((addon) => {
      const option = getAddonOption(addon, addonOptions[addon.id])
      const price = getAddonPrice(addon, addonOptions[addon.id])
      return {
        id: addon.id,
        label: addon.name,
        sublabel: option?.name,
        value: `${price.toLocaleString()} ₽`,
        isAddon: true,
        animated: true,
      }
    }),
  ]

  return (
    <div className="booking-layout">
      <SeoHead title={seoTitle} description={seoDesc} path={`/loft/${id}`} schema={schema} />
      <div className="booking-main">
        <div className="site-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
          <button type="button" className="booking-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Назад
          </button>

          <motion.div className="booking-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="booking-hero-image" style={{ background: venue.gradient }}>
              <span className="booking-hero-badge">Loft & Co</span>
            </div>
            <div className="booking-hero-info">
              <h1>{venue.name} · {venue.sqm}м²</h1>
              <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.55 }}>{venue.description}</p>
              <div className="booking-hero-meta">
                <span><Star size={15} fill="#EAB308" color="#EAB308" /> {venue.rating} · {venue.reviews} отзывов</span>
                <span><MapPin size={15} color={colors.orange} /> {venue.metro}</span>
              </div>
              <p style={{ fontSize: 13, color: colors.text2 }}>{venue.features.join(' · ')}</p>
            </div>
          </motion.div>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Выберите время</h2>
                <p>Доступные слоты на сегодня</p>
              </div>
            </div>
            <div className="booking-slots">
              {venue.timeSlots.map((slot, i) => (
                <button
                  key={slot}
                  type="button"
                  className={`booking-slot ${selectedSlot === i ? 'booking-slot--active' : ''}`}
                  onClick={() => setSelectedSlot(i)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Дополнительные услуги</h2>
                <p>Добавьте всё необходимое прямо при бронировании</p>
              </div>
              {selectedCount > 0 && (
                <span className="booking-selected-badge">
                  <Sparkles size={14} /> {selectedCount} выбрано
                </span>
              )}
            </div>
            <div className="booking-addons">
              {venue.addOns.map((addon, i) => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  active={enabledAddons.has(addon.id)}
                  selectedOptionId={addonOptions[addon.id]}
                  onToggle={() => toggleAddon(addon)}
                  onSelectOption={(optionId) => selectAddonOption(addon.id, optionId)}
                  index={i}
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      <BookingSummaryPanel
        venueName={venue.name}
        venueMeta={`${venue.sqm}м² · ${venue.metro}`}
        venueImage={venue.gradient}
        metaChips={[
          { icon: <Clock size={14} />, text: venue.timeSlots[selectedSlot] },
          { icon: <Tag size={14} />, text: '2 часа' },
        ]}
        lines={summaryLines}
        emptyMessage={selectedCount === 0 ? 'Услуги не выбраны' : undefined}
        discount={discount > 0 ? {
          title: 'Экономия 15%',
          description: `−${discount.toLocaleString()} ₽ на услуги`,
        } : null}
        total={total - discount}
        accent="loft"
        buttonVariant="loft"
        onConfirm={handleBook}
      />
    </div>
  )
}
