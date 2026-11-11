import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { SeoHead } from '../components/SeoHead'
import type { SchemaVenue } from '../components/SeoHead'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, CheckCircle2, Clock, Tag } from 'lucide-react'
import { RatingBadge } from '../components/ui/RatingBadge'
import { getCourt } from '../data/venues'
import { useBookings } from '../contexts/BookingContext'
import { useAuth } from '../contexts/AuthContext'
import { isAuthExpiredError } from '../lib/authErrors'
import { Button } from '../components/ui/Button'
import { BookingSummaryPanel } from '../components/ui/BookingSummaryPanel'
import { VenueMap } from '../components/ui/VenueMap'
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

import { upcomingBookingDays } from '../utils/bookingDates'

export function SportBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addBooking } = useBookings()
  const { isAuthenticated } = useAuth()
  const court = getCourt(Number(id))

  const days = upcomingBookingDays()
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookError, setBookError] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [restoreBanner, setRestoreBanner] = useState<'ready' | 'slot_taken' | null>(null)
  const restoreTried = useRef(false)

  useBookingPageReset(id, () => {
    setSelectedDay(0)
    setSelectedSlot(null)
    setSuccess(false)
    setBookError(null)
    setBooking(false)
    setRestoreBanner(null)
  })

  useEffect(() => {
    if (!isAuthenticated || !id || !court || restoreTried.current) return
    restoreTried.current = true
    const draft = loadBookingDraft(id)
    if (!draft) return
    const dayIdx = days.findIndex((d) => d.iso === draft.dateIso)
    if (dayIdx < 0) {
      clearBookingDraft()
      setRestoreBanner('slot_taken')
      return
    }
    setSelectedDay(dayIdx)
    if (court.slots.includes(draft.slot)) {
      setSelectedSlot(draft.slot)
      setRestoreBanner('ready')
    } else {
      setRestoreBanner('slot_taken')
    }
    clearBookingDraft()
  }, [isAuthenticated, id, court, days])

  if (!court) {
    return (
      <div className="page-center">
        <p style={{ color: colors.muted, marginBottom: 16 }}>Площадка не найдена</p>
        <Link to="/catalog"><Button>К каталогу</Button></Link>
      </div>
    )
  }

  const venue = court
  const price = venue.price

  function redirectToLoginWithDraft() {
    if (!selectedSlot || !id) return
    const returnPath = `/sport/${id}`
    stashBookingBeforeAuth({
      venueId: id,
      dateIso: days[selectedDay].iso,
      slot: selectedSlot,
      durationMinutes: 60,
      returnPath,
    })
    navigate('/login', { state: { from: returnPath } })
  }

  async function handleBook() {
    if (!selectedSlot || booking) return
    if (!isAuthenticated) {
      redirectToLoginWithDraft()
      return
    }
    setBookError(null)
    setRestoreBanner(null)
    setBooking(true)
    try {
      clearBookingDraft()
      const created = await addBooking(venue, days[selectedDay].date, selectedSlot, 60, {
        isoDate: days[selectedDay].iso,
        paymentMethod: 'online',
      })
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
        setSelectedSlot(null)
      }
      setBookError(message)
    } finally {
      setBooking(false)
    }
  }

  const seoTitle = `${venue.name} — бронирование ${venue.sport.toLowerCase()}`
  const seoDesc = `${venue.description.slice(0, 130)}. Забронируй онлайн от ${venue.price.toLocaleString()} ₽/час.`
  const schema: SchemaVenue = {
    name: venue.name,
    description: venue.description,
    address: venue.location,
    pricePerHour: venue.price,
    rating: venue.rating,
    reviewCount: venue.reviews,
    type: 'SportsActivityLocation',
    url: `https://bookingo.ru/sport/${id}`,
  }

  if (success) {
    return (
      <motion.div className="page-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <CheckCircle2 size={64} color={colors.green} />
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Бронь подтверждена!</h2>
        <p style={{ color: colors.muted, marginBottom: 32 }}>{venue.name} · {selectedSlot}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to={paths.catalog}><Button>К каталогу</Button></Link>
          <Link to={paths.home}><Button variant="ghost">На главную</Button></Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="booking-layout">
      <SeoHead title={seoTitle} description={seoDesc} path={`/sport/${id}`} schema={schema} />
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
            <div className="booking-hero-image" style={{ background: venue.photos[0] }}>
              <span className="booking-hero-badge">{venue.sport}</span>
              <span style={{ position: 'absolute', bottom: 24, left: 24, fontSize: 48, zIndex: 1 }}>{venue.emoji}</span>
            </div>
            <div className="booking-hero-info">
              <h1>{venue.name}</h1>
              <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.55 }}>{venue.description}</p>
              <div className="booking-hero-meta">
                <RatingBadge rating={venue.rating} count={venue.reviews} showCount />
                <span><MapPin size={15} color={colors.green} /> {venue.location}</span>
              </div>
              <p style={{ fontSize: 13, color: colors.text2 }}>{venue.amenities.slice(0, 4).join(' · ')}</p>
            </div>
          </motion.div>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Расположение</h2>
                <p>{venue.address || venue.location}</p>
              </div>
            </div>
            <VenueMap
              address={venue.address || venue.location}
              city={venue.location}
              lat={venue.lat}
              lng={venue.lng}
              height={280}
            />
          </section>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Выберите дату</h2>
                <p>Ближайшие доступные дни</p>
              </div>
            </div>
            <div className="booking-slots" style={{ marginBottom: 32 }}>
              {days.map((d, i) => (
                <button
                  key={d.iso}
                  type="button"
                  className={`booking-slot booking-slot--green ${selectedDay === i ? 'booking-slot--active' : ''}`}
                  onClick={() => setSelectedDay(i)}
                  style={{ minWidth: 72, textAlign: 'center' }}
                >
                  <span style={{ display: 'block', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>{d.label}</span>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>{d.date.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="booking-section-head">
              <div>
                <h2>Свободные слоты</h2>
                <p>Выберите удобное время</p>
              </div>
            </div>
            <div className="booking-slots">
              {venue.slots.slice(0, 8).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`booking-slot booking-slot--green ${selectedSlot === slot ? 'booking-slot--active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <BookingSummaryPanel
        venueName={venue.name}
        venueMeta={`${venue.sport} · ${venue.location}`}
        venueImage={venue.photos[0]}
        metaChips={selectedSlot ? [
          { icon: <Clock size={14} />, text: `${days[selectedDay].date} · ${selectedSlot}` },
          { icon: <Tag size={14} />, text: '1 час' },
        ] : []}
        lines={[
          {
            id: 'rent',
            label: 'Аренда площадки',
            value: `${price.toLocaleString()} ₽`,
          },
        ]}
        emptyMessage={!selectedSlot ? 'Время не выбрано' : undefined}
        total={price}
        accent="green"
        buttonLabel={booking ? 'Создаём бронь…' : 'Подтвердить бронь →'}
        buttonDisabled={!selectedSlot || booking}
        onConfirm={handleBook}
        error={bookError}
      />
    </div>
  )
}
