import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import type { SchemaVenue } from '../components/SeoHead'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Sparkles, CheckCircle2, Clock, Tag } from 'lucide-react'
import { RatingBadge } from '../components/ui/RatingBadge'
import { getLoft, getAddonPrice, getAddonOption } from '../data/venues'
import type { AddOn } from '../data/venues'
import { useBookings } from '../contexts/BookingContext'
import { useAuth } from '../contexts/AuthContext'
import { isAuthExpiredError } from '../lib/authErrors'
import { Button } from '../components/ui/Button'
import { AddonCard } from '../components/ui/AddonCard'
import { BookingSummaryPanel } from '../components/ui/BookingSummaryPanel'
import { VenueMap } from '../components/ui/VenueMap'
import type { SummaryLineItem } from '../components/ui/BookingSummaryPanel'
import { paths } from '../config/features'
import { useBookingPageReset } from '../hooks/useBookingPageReset'
import { colors } from '../theme/tokens'
import { isDemoMode } from '../demo/demoMode'
import { redirectToYookassa } from '../lib/yookassaPayments'
import { bookingCreateErrorMessage, isSlotTakenError } from '../lib/venueAvailability'
import {
  clearBookingDraft,
  loadBookingDraft,
  stashBookingBeforeAuth,
} from '../utils/bookingDraft'
import { todayIsoDate } from '../utils/bookingDates'

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
  const [bookError, setBookError] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [restoreBanner, setRestoreBanner] = useState<'ready' | 'slot_taken' | null>(null)
  const restoreTried = useRef(false)

  useBookingPageReset(id, () => {
    setSelectedSlot(1)
    setEnabledAddons(new Set())
    setAddonOptions({})
    setSuccess(false)
    setBookError(null)
    setBooking(false)
    setRestoreBanner(null)
  })

  useEffect(() => {
    if (!isAuthenticated || !id || !loft || restoreTried.current) return
    restoreTried.current = true
    const draft = loadBookingDraft(id)
    if (!draft) return
    const idx = loft.timeSlots.indexOf(draft.slot)
    if (idx >= 0) {
      setSelectedSlot(idx)
      setRestoreBanner('ready')
    } else {
      setRestoreBanner('slot_taken')
    }
    clearBookingDraft()
  }, [isAuthenticated, id, loft])

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
    reviewCount: venue.reviews,
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

  function redirectToLoginWithDraft() {
    if (!id || !venue) return
    const returnPath = `/loft/${id}`
    stashBookingBeforeAuth({
      venueId: id,
      dateIso: todayIsoDate(),
      slot: venue.timeSlots[selectedSlot] ?? venue.timeSlots[0],
      durationMinutes: 120,
      returnPath,
    })
    navigate('/login', { state: { from: returnPath } })
  }

  async function handleBook() {
    if (booking) return
    if (!isAuthenticated) {
      redirectToLoginWithDraft()
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
    setBookError(null)
    setRestoreBanner(null)
    setBooking(true)
    try {
      clearBookingDraft()
      const created = await addLoftBooking(venue, venue.timeSlots[selectedSlot], addons, total - discount)
      if (!isDemoMode()) {
        const left = await redirectToYookassa(created.id)
        if (left) return
      }
      setSuccess(true)
    } catch (e) {
      if (isAuthExpiredError(e)) {
        redirectToLoginWithDraft()
        return
      }
      const message = bookingCreateErrorMessage(e)
      if (isSlotTakenError(e instanceof Error ? e.message : '')) {
        setSelectedSlot(0)
      }
      setBookError(message)
    } finally {
      setBooking(false)
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

          {restoreBanner && (
            <div
              role="status"
              style={{
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 12,
                border: restoreBanner === 'ready'
                  ? '1px solid rgba(34,197,94,0.35)'
                  : '1px solid rgba(251,191,36,0.35)',
                background: restoreBanner === 'ready'
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(251,191,36,0.1)',
                color: restoreBanner === 'ready' ? '#86efac' : '#fcd34d',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {restoreBanner === 'ready'
                ? 'Вы вошли — проверьте детали и нажмите Оплатить'
                : 'Выбранное время недоступно — выберите другое время'}
            </div>
          )}

          <motion.div className="booking-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="booking-hero-image" style={{ background: venue.gradient }}>
              <span className="booking-hero-badge">Loft & Co</span>
            </div>
            <div className="booking-hero-info">
              <h1>{venue.name} · {venue.sqm}м²</h1>
              <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.55 }}>{venue.description}</p>
              <div className="booking-hero-meta">
                <RatingBadge rating={venue.rating} count={venue.reviews} showCount />
                <span><MapPin size={15} color={colors.orange} /> {venue.metro}</span>
              </div>
              <p style={{ fontSize: 13, color: colors.text2 }}>{venue.features.join(' · ')}</p>
            </div>
          </motion.div>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Расположение</h2>
                <p>{venue.location}{venue.metro ? ` · ${venue.metro}` : ''}</p>
              </div>
            </div>
            <VenueMap
              address={venue.location}
              height={280}
              accentColor={colors.orange}
            />
          </section>

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
        buttonLabel={booking ? 'Создаём бронь…' : 'Подтвердить бронь →'}
        buttonDisabled={booking}
        onConfirm={handleBook}
        error={bookError}
      />
    </div>
  )
}
