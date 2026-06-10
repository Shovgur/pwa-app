import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, MapPin, CheckCircle2 } from 'lucide-react'
import { getCourt } from '../data/venues'
import { useBookings } from '../contexts/BookingContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { paths } from '../config/features'
import { useBookingPageReset } from '../hooks/useBookingPageReset'
import { colors } from '../theme/tokens'

const DAYS = ['Пн 9', 'Вт 10', 'Ср 11', 'Чт 12', 'Пт 13', 'Сб 14', 'Вс 15']

export function SportBookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addBooking } = useBookings()
  const { isAuthenticated } = useAuth()
  const court = getCourt(Number(id))

  const [selectedDay, setSelectedDay] = useState(1)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useBookingPageReset(id, () => {
    setSelectedDay(1)
    setSelectedSlot(null)
    setSuccess(false)
  })

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

  function handleBook() {
    if (!selectedSlot) return
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/sport/${id}` } })
      return
    }
    addBooking(venue, DAYS[selectedDay].split(' ')[1] + ' июня', selectedSlot, 60)
    setSuccess(true)
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
      <div className="booking-main">
        <div className="site-container" style={{ paddingTop: 32, paddingBottom: 48 }}>
          <button type="button" className="booking-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Назад
          </button>

          <motion.div className="booking-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="booking-hero-image" style={{ background: venue.photos[0] }}>
              <span className="booking-hero-badge">{venue.sport}</span>
              <span style={{ position: 'absolute', bottom: 24, left: 24, fontSize: 48, zIndex: 1 }}>{venue.emoji}</span>
            </div>
            <div className="booking-hero-info">
              <h1>{venue.name}</h1>
              <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.55 }}>{venue.description}</p>
              <div className="booking-hero-meta">
                <span><Star size={15} fill="#EAB308" color="#EAB308" /> {venue.rating} · {venue.reviews} отзывов</span>
                <span><MapPin size={15} color={colors.green} /> {venue.location}</span>
              </div>
              <p style={{ fontSize: 13, color: colors.text2 }}>{venue.amenities.slice(0, 4).join(' · ')}</p>
            </div>
          </motion.div>

          <section className="booking-section">
            <div className="booking-section-head">
              <div>
                <h2>Выберите дату</h2>
                <p>Ближайшие доступные дни</p>
              </div>
            </div>
            <div className="booking-slots" style={{ marginBottom: 32 }}>
              {DAYS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  className={`booking-slot booking-slot--green ${selectedDay === i ? 'booking-slot--active' : ''}`}
                  onClick={() => setSelectedDay(i)}
                  style={{ minWidth: 72, textAlign: 'center' }}
                >
                  <span style={{ display: 'block', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>{d.split(' ')[0]}</span>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>{d.split(' ')[1]}</span>
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

      <aside className="booking-sidebar">
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: colors.text }}>Ваш заказ</h2>

        <div className="booking-summary-list">
          <div className="booking-summary-row">
            <span>{venue.name}</span>
            <span>{price.toLocaleString()} ₽</span>
          </div>
          {selectedSlot && (
            <motion.div className="booking-summary-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span>{DAYS[selectedDay].split(' ')[1]} июня · {selectedSlot}</span>
              <span>1 час</span>
            </motion.div>
          )}
        </div>

        <div className="booking-summary-divider" />

        <div className="booking-summary-total">
          <span>Итого</span>
          <span style={{ color: colors.green }}>{price.toLocaleString()} ₽</span>
        </div>

        <div className="booking-summary-spacer" />

        <Button disabled={!selectedSlot} onClick={handleBook} style={{ width: '100%' }}>
          Забронировать →
        </Button>
      </aside>
    </div>
  )
}
