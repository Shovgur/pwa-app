import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Clock, MapPin, X, CalendarPlus } from 'lucide-react'
import { useBookings } from '../../contexts/BookingContext'
import type { Booking } from '../../contexts/BookingContext'

const FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'completed', label: 'Завершённые' },
  { id: 'cancelled', label: 'Отменённые' },
] as const

const STATUS_META: Record<Booking['status'], { label: string; color: string }> = {
  upcoming: { label: 'Предстоит', color: '#22c55e' },
  completed: { label: 'Завершено', color: '#64748b' },
  cancelled: { label: 'Отменено', color: '#ef4444' },
}

function BookingRow({ booking, onCancel }: { booking: Booking; onCancel: (id: number) => void }) {
  const meta = STATUS_META[booking.status]
  const court = booking.court

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, overflow: 'hidden' }}
      className="dashboard-bookings-row"
      style={{
        background: '#222D3F',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: '16px 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: court.photos[0],
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
        }}>
          {court.emoji}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {court.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <MapPin size={11} color="#64748b" />
            <span style={{ fontSize: 12, color: '#64748b' }}>{court.location}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarCheck size={13} color="#64748b" />
          <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{booking.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={13} color="#64748b" />
          <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>{booking.time} · {booking.duration} мин</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: court.color, fontFamily: 'var(--font-display)', minWidth: 72 }}>
          {booking.price.toLocaleString()} ₽
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 100,
          background: `${meta.color}18`, color: meta.color, whiteSpace: 'nowrap',
        }}>
          {meta.label}
        </span>
        {booking.status === 'upcoming' && (
          <button
            onClick={() => onCancel(booking.id)}
            aria-label="Отменить бронь"
            style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)',
              color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function BookingsTab() {
  const navigate = useNavigate()
  const { bookings, cancelBooking } = useBookings()
  const [filter, setFilter] = useState<typeof FILTERS[number]['id']>('all')

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const counts = {
    all: bookings.length,
    upcoming: bookings.filter(b => b.status === 'upcoming').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  return (
    <div className="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-bookings-row"
        style={{ marginBottom: 20 }}
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 2, fontFamily: 'var(--font-display)' }}>
            Мои брони
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>История и предстоящие бронирования</p>
        </div>
        <motion.button
          onClick={() => navigate('/dashboard/courts')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(34,197,94,0.25)',
          }}
        >
          <CalendarPlus size={16} />
          Забронировать
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 2 }}
      >
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
              background: filter === f.id ? '#22c55e' : '#222D3F',
              color: filter === f.id ? '#fff' : '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
            <span style={{
              fontSize: 11, padding: '1px 6px', borderRadius: 100,
              background: filter === f.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
            }}>
              {counts[f.id]}
            </span>
          </button>
        ))}
      </motion.div>

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {filtered.map(b => (
              <BookingRow key={b.id} booking={b} onCancel={cancelBooking} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            textAlign: 'center', padding: '64px 20px', background: '#222D3F',
            borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            {filter === 'all' ? 'Броней пока нет' : 'Здесь пока пусто'}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 28, lineHeight: 1.6 }}>
            Здесь будут отображаться<br />все ваши бронирования
          </div>
          <motion.button
            onClick={() => navigate('/dashboard/courts')}
            style={{
              padding: '13px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Найти площадку
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
