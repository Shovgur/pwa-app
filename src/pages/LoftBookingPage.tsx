import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, MapPin, Sparkles, CheckCircle2, Clock, Tag } from 'lucide-react'
import { getLoft, getAddonPrice, getAddonOption } from '../data/venues'
import type { AddOn } from '../data/venues'
import { useBookings } from '../contexts/BookingContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { AddonCard } from '../components/ui/AddonCard'
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

  function handleBook() {
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
    addLoftBooking(venue, venue.timeSlots[selectedSlot], addons, total - discount)
    setSuccess(true)
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

  return (
    <div className="booking-layout">
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

      <aside className="booking-sidebar">
        <div className="booking-summary-panel">
          <div className="booking-summary-scroll">
            <h2 className="booking-summary-title">Сводка заказа</h2>

            <div className="booking-summary-venue">
              <div className="booking-summary-venue-image" style={{ background: venue.gradient }} />
              <div>
                <p className="booking-summary-venue-name">{venue.name}</p>
                <p className="booking-summary-venue-meta">{venue.sqm}м² · {venue.metro}</p>
              </div>
            </div>

            <div className="booking-summary-meta-row">
              <span><Clock size={14} /> {venue.timeSlots[selectedSlot]}</span>
              <span><Tag size={14} /> 2 часа</span>
            </div>

            <div className="booking-summary-divider" />

            <div className="booking-summary-list">
              <div className="booking-summary-row">
                <span>Аренда лофта</span>
                <span>{basePrice.toLocaleString()} ₽</span>
              </div>
              {selectedAddons.map((addon) => {
                const option = getAddonOption(addon, addonOptions[addon.id])
                const price = getAddonPrice(addon, addonOptions[addon.id])
                return (
                  <motion.div key={addon.id} className="booking-summary-row booking-summary-row--addon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span>
                      {addon.name}
                      {option && <em>{option.name}</em>}
                    </span>
                    <span>{price.toLocaleString()} ₽</span>
                  </motion.div>
                )
              })}
              {selectedCount === 0 && (
                <p className="booking-summary-empty">Услуги не выбраны</p>
              )}
            </div>

            {discount > 0 && (
              <div className="booking-summary-discount">
                <p className="booking-summary-discount-title">Экономия 15%</p>
                <p className="booking-summary-discount-desc">−{discount.toLocaleString()} ₽ на услуги</p>
              </div>
            )}
          </div>

          <div className="booking-summary-footer">
            <div className="booking-summary-total">
              <span>Итого</span>
              <motion.span
                key={total - discount}
                className="booking-summary-total-price"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
              >
                {(total - discount).toLocaleString()} ₽
              </motion.span>
            </div>
            <Button variant="loft" onClick={handleBook} style={{ width: '100%' }}>
              Подтвердить бронь →
            </Button>
            <p className="booking-sidebar-note">Бесплатная отмена за 24 часа</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
