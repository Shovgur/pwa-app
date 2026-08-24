import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, MapPin, Tag } from 'lucide-react'
import { SeoHead } from '../components/SeoHead'
import { Button } from '../components/ui/Button'
import { BookingSummaryPanel } from '../components/ui/BookingSummaryPanel'
import { VenueMap } from '../components/ui/VenueMap'
import { useAuth } from '../contexts/AuthContext'
import { useBookings } from '../contexts/BookingContext'
import { loadPublicVenueById, usePublicVenues } from '../contexts/PublicVenuesContext'
import type { PartnerVenue } from '../lib/partnerVenues'
import { VENUE_KIND_LABEL } from '../lib/partnerVenues'
import { partnerVenueToCourt, resolveVenueImageUrl, venueCoverImage } from '../utils/venueAdapters'
import { venueMinPricePerHour } from '../utils/venuePrice'
import { colors } from '../theme/tokens'
import { paths } from '../config/features'
import { BILLING_LABEL } from '../utils/venueBuilderPresets'

import { upcomingBookingDays } from '../utils/bookingDates'
import { useVenueSlots } from '../hooks/useVenueSlots'
import { VenueSlotPicker } from '../components/ui/VenueSlotPicker'

const BOOKING_DURATION_MINUTES = 60

export function PublicVenuePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getVenue } = usePublicVenues()
  const { addBooking } = useBookings()
  const { isAuthenticated } = useAuth()

  const [venue, setVenue] = useState<PartnerVenue | null>(() => (id ? getVenue(id) ?? null : null))
  const [loading, setLoading] = useState(!venue && Boolean(id))
  const days = upcomingBookingDays()
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const selectedDateIso = days[selectedDay]?.iso ?? days[0].iso
  const {
    slotTimes,
    loading: slotsLoading,
    error: slotsError,
  } = useVenueSlots({
    venueId: id,
    date: selectedDateIso,
    durationMinutes: BOOKING_DURATION_MINUTES,
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (selectedSlot && !slotTimes.includes(selectedSlot)) {
      setSelectedSlot(null)
    }
  }, [slotTimes, selectedSlot])

  useEffect(() => {
    if (!id) return
    const cached = getVenue(id)
    if (cached) {
      setVenue(cached)
      setLoading(false)
      return
    }
    let cancelled = false
    void loadPublicVenueById(id).then(v => {
      if (!cancelled) {
        setVenue(v)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, getVenue])

  if (loading) {
    return <div className="page-center"><p style={{ color: colors.muted }}>Загружаем площадку…</p></div>
  }

  if (!venue) {
    return (
      <div className="page-center">
        <p style={{ color: colors.muted, marginBottom: 16 }}>Площадка не найдена</p>
        <Link to="/catalog"><Button>К каталогу</Button></Link>
      </div>
    )
  }

  const cover = venueCoverImage(venue)
  const minPrice = venueMinPricePerHour(venue) || venue.basePricePerHour
  const court = partnerVenueToCourt(venue)

  async function handleBook() {
    if (!selectedSlot) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/venue/${id}` } })
      return
    }
    try {
      await addBooking(court, days[selectedDay].date, selectedSlot, 60, {
        isoDate: days[selectedDay].iso,
      })
      setSuccess(true)
    } catch {
      // остаёмся на форме
    }
  }

  if (success) {
    return (
      <motion.div className="page-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <CheckCircle2 size={64} color={colors.green} />
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>Бронь подтверждена!</h2>
        <p style={{ color: colors.muted, marginBottom: 32 }}>{venue.name} · {selectedSlot}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to={paths.catalog}><Button>К каталогу</Button></Link>
          <Link to="/dashboard"><Button variant="ghost">В кабинет</Button></Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="site-container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <SeoHead
        title={`${venue.name} — бронирование`}
        description={venue.description.slice(0, 140)}
        path={`/venue/${venue.id}`}
      />

      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: colors.muted, cursor: 'pointer', marginBottom: 24, fontFamily: 'inherit', fontSize: 14 }}
      >
        <ArrowLeft size={18} /> Назад
      </button>

      <div className="booking-layout">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div
            style={{
              height: 280,
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 24,
              background: cover ? undefined : 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              position: 'relative',
            }}
          >
            {cover && (
              <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85), transparent)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                {VENUE_KIND_LABEL[venue.venueKind]}
              </span>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{venue.name}</h1>
              <p style={{ margin: 0, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                <MapPin size={14} /> {venue.city}, {venue.address}
              </p>
            </div>
          </div>

          <p style={{ color: colors.text2, lineHeight: 1.65, marginBottom: 20 }}>{venue.description}</p>

          {venue.amenities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {venue.amenities.map(a => (
                <span key={a} style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', fontSize: 12, color: '#94a3b8' }}>{a}</span>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 10 }}>Расположение</h3>
            <VenueMap
              address={venue.address}
              city={venue.city}
              lat={venue.lat}
              lng={venue.lng}
              height={280}
            />
          </div>

          {venue.timePriceRules.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 10 }}>Тарифы по времени</h3>
              {venue.timePriceRules.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14, color: colors.text2 }}>
                  <span>{r.label || `${r.timeFrom}–${r.timeTo}`}</span>
                  <strong style={{ color: colors.text }}>{r.pricePerHour.toLocaleString('ru-RU')} ₽/ч</strong>
                </div>
              ))}
            </div>
          )}

          {venue.durationRules.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 10 }}>Пакеты</h3>
              {venue.durationRules.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14, color: colors.text2 }}>
                  <span>{r.label || `${r.hours} ч`}</span>
                  <strong style={{ color: colors.text }}>{r.price.toLocaleString('ru-RU')} ₽</strong>
                </div>
              ))}
            </div>
          )}

          {venue.extraServices.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 10 }}>Доп. услуги</h3>
              {venue.extraServices.map(ex => (
                <div key={ex.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 600, color: colors.text }}>{ex.name}</div>
                  <div style={{ fontSize: 13, color: colors.muted }}>{ex.description} · {ex.price.toLocaleString('ru-RU')} ₽ {BILLING_LABEL[ex.billing]}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 12 }}>Выберите день</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {days.map((d, i) => (
                <button
                  key={d.iso}
                  type="button"
                  onClick={() => {
                    setSelectedDay(i)
                    setSelectedSlot(null)
                  }}
                  style={{
                    padding: '10px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: selectedDay === i ? colors.green : 'rgba(255,255,255,0.06)',
                    color: selectedDay === i ? '#0f172a' : colors.text2,
                    fontWeight: 600, fontFamily: 'inherit',
                  }}
                >
                  {d.label}, {d.date}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} /> Время
            </h3>
            <VenueSlotPicker
              slots={slotTimes}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
              loading={slotsLoading}
              error={slotsError}
              accentColor={colors.green}
              minHeight={120}
            />
          </div>
        </motion.div>

        <BookingSummaryPanel
          venueName={venue.name}
          venueMeta={`${VENUE_KIND_LABEL[venue.venueKind]} · ${venue.city}`}
          venueImage={cover ?? 'linear-gradient(135deg, #0f172a, #1e3a5f)'}
          metaChips={selectedSlot ? [
            { icon: <Clock size={14} />, text: `${days[selectedDay].date} · ${selectedSlot}` },
            { icon: <Tag size={14} />, text: `от ${minPrice.toLocaleString('ru-RU')} ₽/ч` },
          ] : []}
          lines={[
            { id: 'date', label: 'Дата', value: `${days[selectedDay].label}, ${days[selectedDay].date}` },
            { id: 'time', label: 'Время', value: selectedSlot ?? '—' },
            { id: 'rate', label: 'Тариф', value: `от ${minPrice.toLocaleString('ru-RU')} ₽/ч` },
          ]}
          emptyMessage={!selectedSlot ? 'Выберите время' : undefined}
          total={selectedSlot ? minPrice : 0}
          accent="green"
          buttonLabel="Забронировать"
          buttonDisabled={!selectedSlot}
          onConfirm={handleBook}
          footerNote="4.9 · Партнёр BookinGo"
        />
      </div>

      {venue.photos.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 32 }}>
          {venue.photos.map(p => {
            const src = resolveVenueImageUrl(p.url)
            if (!src) return null
            return (
              <img key={p.id} src={src} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 12 }} />
            )
          })}
        </div>
      )}
    </div>
  )
}
