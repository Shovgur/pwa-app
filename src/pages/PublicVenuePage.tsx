import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, MapPin, Tag } from 'lucide-react'
import { SeoHead } from '../components/SeoHead'
import { VenueReviewList } from '../components/reviews/VenueReviewList'
import { Button } from '../components/ui/Button'
import { RatingBadge } from '../components/ui/RatingBadge'
import { BookingSummaryPanel } from '../components/ui/BookingSummaryPanel'
import { VenueMap } from '../components/ui/VenueMap'
import { useAuth } from '../contexts/AuthContext'
import { useBookings } from '../contexts/BookingContext'
import { loadPublicVenueById, usePublicVenues } from '../contexts/PublicVenuesContext'
import type { PartnerVenue } from '../lib/partnerVenues'
import { VENUE_KIND_LABEL } from '../lib/partnerVenues'
import { partnerVenueToCourt, resolveVenueImageUrl, venueCoverImage } from '../utils/venueAdapters'
import { isAuthExpiredError } from '../lib/authErrors'
import { bookingCreateErrorMessage, fetchCourtAvailability, isSlotTakenError } from '../lib/venueAvailability'
import { venueMinPricePerHour } from '../utils/venuePrice'
import { colors } from '../theme/tokens'
import { paths } from '../config/features'
import { isDemoMode } from '../demo/demoMode'
import { redirectToYookassa } from '../lib/yookassaPayments'
import { trackVenueView } from '../lib/venueViews'
import { BILLING_LABEL } from '../utils/venueBuilderPresets'
import {
  clearBookingDraft,
  loadBookingDraft,
  stashBookingBeforeAuth,
  type BookingDraft,
} from '../utils/bookingDraft'

import { upcomingBookingDays } from '../utils/bookingDates'
import { useVenueSlots } from '../hooks/useVenueSlots'
import { VenueSlotPicker } from '../components/ui/VenueSlotPicker'

const BOOKING_DURATION_MINUTES = 60

type RestoreBanner = 'ready' | 'slot_taken' | null

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
  const [bookingCode, setBookingCode] = useState<string | null>(null)
  const [bookError, setBookError] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [restoreBanner, setRestoreBanner] = useState<RestoreBanner>(null)
  const [pendingRestore, setPendingRestore] = useState<BookingDraft | null>(null)
  const restoreTried = useRef(false)

  const selectedDateIso = days[selectedDay]?.iso ?? days[0].iso
  const {
    slotTimes,
    loading: slotsLoading,
    error: slotsError,
    reload: reloadSlots,
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
    void trackVenueView(id)
  }, [id])

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

  // После login/register: подтянуть день из черновика
  useEffect(() => {
    if (!isAuthenticated || !id || restoreTried.current) return
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
    setPendingRestore(draft)
  }, [isAuthenticated, id, days])

  // Применить слот только когда слоты загружены (иначе эффект выше сбросит выбор)
  useEffect(() => {
    if (!pendingRestore || slotsLoading) return
    if (days[selectedDay]?.iso !== pendingRestore.dateIso) return
    if (slotTimes.includes(pendingRestore.slot)) {
      setSelectedSlot(pendingRestore.slot)
      setRestoreBanner('ready')
    } else {
      setRestoreBanner('slot_taken')
    }
    clearBookingDraft()
    setPendingRestore(null)
  }, [pendingRestore, slotsLoading, slotTimes, selectedDay, days])

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

  function redirectToLoginWithDraft() {
    if (!selectedSlot || !id) return
    const returnPath = `/venue/${id}`
    stashBookingBeforeAuth({
      venueId: id,
      dateIso: days[selectedDay].iso,
      slot: selectedSlot,
      durationMinutes: BOOKING_DURATION_MINUTES,
      returnPath,
    })
    navigate('/login', { state: { from: returnPath } })
  }

  async function handleBook() {
    if (!selectedSlot || !id || booking) return
    if (!isAuthenticated) {
      redirectToLoginWithDraft()
      return
    }
    setBookError(null)
    setRestoreBanner(null)
    setBooking(true)
    try {
      const fresh = await fetchCourtAvailability({
        venueId: id,
        date: days[selectedDay].iso,
        durationMinutes: BOOKING_DURATION_MINUTES,
      })
      if (!fresh.slots.some((s) => s.time === selectedSlot)) {
        reloadSlots()
        setSelectedSlot(null)
        setBookError('Это время уже занято. Выберите другой слот.')
        return
      }
      clearBookingDraft()
      const created = await addBooking(court, days[selectedDay].date, selectedSlot, BOOKING_DURATION_MINUTES, {
        isoDate: days[selectedDay].iso,
        paymentMethod: 'online',
      })
      if (isDemoMode()) {
        reloadSlots()
        setBookingCode(created.code ?? null)
        setSuccess(true)
        return
      }
      try {
        const left = await redirectToYookassa(created.id)
        if (left) return
        reloadSlots()
        setBookingCode(created.code ?? null)
        setSuccess(true)
        return
      } catch (payErr) {
        reloadSlots()
        setBookingCode(created.code ?? null)
        const payMessage = payErr instanceof Error ? payErr.message : 'Не удалось открыть оплату'
        setBookError(
          `Бронь создана (${created.code ?? created.id}), но оплата не открылась: ${payMessage}`,
        )
        return
      }
    } catch (e) {
      if (isAuthExpiredError(e)) {
        redirectToLoginWithDraft()
        return
      }
      const message = bookingCreateErrorMessage(e)
      if (isSlotTakenError(e instanceof Error ? e.message : '')) {
        reloadSlots()
        setSelectedSlot(null)
      }
      setBookError(message)
    } finally {
      setBooking(false)
    }
  }

  if (success) {
    return (
      <motion.div className="page-center" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <CheckCircle2 size={64} color={colors.green} />
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '24px 0 8px' }}>
          {isDemoMode()
            ? 'Заявка отправлена · ожидает подтверждения'
            : 'Бронь создана!'}
        </h2>
        <p style={{ color: colors.muted, marginBottom: isDemoMode() ? 12 : 32 }}>
          {venue.name} · {selectedSlot}
          {bookingCode ? ` · код ${bookingCode}` : ''}
        </p>
        {isDemoMode() && (
          <p style={{ color: colors.muted, marginBottom: 32, fontSize: 14 }}>
            Демо: списание не производится
          </p>
        )}
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
        schema={{
          name: venue.name,
          description: venue.description,
          address: `${venue.city}, ${venue.address}`,
          pricePerHour: venueMinPricePerHour(venue) || venue.basePricePerHour,
          rating: (venue.ratingCount ?? 0) > 0 ? venue.ratingAvg ?? null : null,
          reviewCount: venue.ratingCount ?? 0,
          type: venue.venueKind === 'loft' || venue.venueKind === 'meeting'
            ? 'EventVenue'
            : 'SportsActivityLocation',
          url: `https://bookingo.ru/venue/${venue.id}`,
        }}
      />

      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: colors.muted, cursor: 'pointer', marginBottom: 24, fontFamily: 'inherit', fontSize: 14 }}
      >
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
            lineHeight: 1.45,
          }}
        >
          {restoreBanner === 'ready'
            ? 'Вы вошли — проверьте детали и нажмите Оплатить'
            : 'Выбранное время недоступно — выберите другое время'}
        </div>
      )}

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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.2)', color: '#4ade80', fontSize: 11, fontWeight: 700 }}>
                  {VENUE_KIND_LABEL[venue.venueKind]}
                </span>
                {(venue.promotions ?? []).slice(0, 2).map(p => (
                  <span
                    key={p.id}
                    style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: 'rgba(249,115,22,0.25)', color: '#fb923c', fontSize: 11, fontWeight: 800 }}
                  >
                    {p.discountLabel || p.title}
                  </span>
                ))}
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>{venue.name}</h1>
              <p style={{ margin: 0, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, flexWrap: 'wrap' }}>
                <MapPin size={14} /> {venue.city}, {venue.address}
                <RatingBadge rating={venue.ratingAvg} count={venue.ratingCount ?? 0} showCount size={14} />
              </p>
            </div>
          </div>

          {(venue.promotions?.length ?? 0) > 0 && (
            <div style={{ marginBottom: 20, padding: 14, borderRadius: 14, border: '1px solid rgba(249,115,22,0.25)', background: 'rgba(249,115,22,0.08)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fb923c', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Tag size={14} /> Акции
              </h3>
              {venue.promotions!.map(p => (
                <div key={p.id} style={{ fontSize: 13, color: colors.text2, marginBottom: 4 }}>
                  <strong style={{ color: colors.text }}>{p.discountLabel}</strong>
                  {' · '}{p.title}
                </div>
              ))}
            </div>
          )}

          <p style={{ color: colors.text2, lineHeight: 1.65, marginBottom: 20 }}>{venue.description}</p>

          <VenueReviewList venueId={venue.id} />

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
          buttonLabel={booking ? (isDemoMode() ? 'Отправляем…' : 'Переходим к оплате…') : (isDemoMode() ? 'Отправить заявку' : 'Оплатить по СБП')}
          buttonDisabled={!selectedSlot || booking}
          onConfirm={handleBook}
          footerNote={isDemoMode()
            ? 'Демо: списание не производится · партнёр подтвердит заявку'
            : 'Оплата по СБП через ЮKassa · принимая, вы соглашаетесь с офертой'}
        />
        {bookError && (
          <div
            style={{
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#fca5a5',
              fontSize: 13,
            }}
          >
            {bookError}
          </div>
        )}
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
