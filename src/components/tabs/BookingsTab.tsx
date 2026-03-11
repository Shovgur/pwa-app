import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, AlertTriangle, X, RotateCcw } from 'lucide-react'
import { useBookings } from '../../contexts/BookingContext'
import type { Booking } from '../../contexts/BookingContext'
import { CourtDetailSheet } from '../CourtDetailSheet'

type Tab = 'upcoming' | 'completed' | 'cancelled'

const TABS: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'completed', label: 'Завершённые' },
  { id: 'cancelled', label: 'Отменённые' },
]

const STATUS_COLORS: Record<Tab, string> = {
  upcoming: '#22c55e',
  completed: '#3b82f6',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<Tab, string> = {
  upcoming: 'Предстоит',
  completed: 'Завершено',
  cancelled: 'Отменено',
}

interface CancelPopupProps {
  booking: Booking
  onConfirm: () => void
  onClose: () => void
}

function CancelPopup({ booking, onConfirm, onClose }: CancelPopupProps) {
  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 11000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        }}
      />
      {/* Centering wrapper — позиционируем через flex, не transform */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 11001,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px', pointerEvents: 'none',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.82, y: 24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 380 }}
          onClick={e => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%', maxWidth: 360,
            background: '#111827', borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: 24, boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
          }}
        >
        {/* Иконка предупреждения */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={28} color="#ef4444" />
          </div>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', textAlign: 'center', marginBottom: 8 }}>
          Отменить бронирование?
        </h3>
        <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.5, marginBottom: 20 }}>
          Вы уверены, что хотите отменить бронь<br />
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>{booking.court.name}</span> на {booking.date} в {booking.time}?
        </p>

        {/* Карточка брони */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px 14px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <span style={{ fontSize: 28 }}>{booking.court.emoji}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{booking.court.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{booking.date}, {booking.time} · {booking.price.toLocaleString()} ₽</div>
          </div>
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 10 }}>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            style={{
              flex: 1, padding: '13px', borderRadius: 14,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Оставить
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onConfirm}
            style={{
              flex: 1, padding: '13px', borderRadius: 14,
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              border: 'none', fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(239,68,68,0.4)',
            }}
          >
            Отменить
          </motion.button>
        </div>
        </motion.div>
      </div>
    </>
  )
}

function BookingCard({ booking, onCancel, onRebook }: { booking: Booking; onCancel?: () => void; onRebook?: () => void }) {
  const status = booking.status as Tab
  const color = STATUS_COLORS[status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, overflow: 'hidden',
      }}
    >
      {/* Полоска статуса сверху */}
      <div style={{ height: 3, background: color, opacity: status === 'cancelled' ? 0.5 : 1 }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Верхняя строка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, background: booking.court.photos[0],
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
          }}>
            {booking.court.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{booking.court.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color="#64748b" />
              <span style={{ fontSize: 12, color: '#64748b' }}>{booking.court.location}</span>
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 8,
            background: `${color}18`, color: color,
            fontSize: 11, fontWeight: 700,
          }}>
            {STATUS_LABELS[status]}
          </div>
        </div>

        {/* Детали */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14,
          background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 12px',
        }}>
          {[
            ['📅', 'Дата', booking.date],
            ['⏰', 'Время', booking.time],
            ['⏱', 'Длит.', `${booking.duration} мин`],
          ].map(([icon, label, val]) => (
            <div key={label as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Итог и кнопки */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#475569', marginBottom: 1 }}>Оплачено</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: color }}>{booking.price.toLocaleString()} ₽</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {onRebook && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={onRebook}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px',
                  borderRadius: 12, background: `${booking.court.color}18`,
                  border: `1px solid ${booking.court.color}40`,
                  color: booking.court.color, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <RotateCcw size={13} />
                Снова
              </motion.button>
            )}
            {onCancel && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={onCancel}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px',
                  borderRadius: 12, background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <X size={13} />
                Отменить
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function BookingsTab() {
  const { bookings, cancelBooking } = useBookings()
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [rebookCourt, setRebookCourt] = useState<typeof bookings[0]['court'] | null>(null)

  const filtered = bookings.filter(b => b.status === activeTab)

  const handleConfirmCancel = () => {
    if (cancelTarget) {
      cancelBooking(cancelTarget.id)
      setCancelTarget(null)
    }
  }

  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length

  return (
    <div style={{ padding: '24px 16px', paddingBottom: 100 }}>
      {/* Заголовок */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>Мои брони</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {upcomingCount > 0 ? `${upcomingCount} предстоящих визита` : 'Нет предстоящих бронирований'}
        </p>
      </motion.div>

      {/* Табы */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: 14, padding: 4, marginBottom: 20,
        }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          const count = bookings.filter(b => b.status === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '9px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isActive ? STATUS_COLORS[tab.id] : 'transparent',
                color: isActive ? '#fff' : '#64748b',
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                fontFamily: 'inherit', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {tab.label}
              {count > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '1px 6px', fontSize: 11, fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </motion.div>

      {/* Список */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#475569' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '✅' : '❌'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#64748b' }}>
                {activeTab === 'upcoming' ? 'Нет предстоящих броней' : activeTab === 'completed' ? 'Нет завершённых броней' : 'Нет отменённых броней'}
              </div>
              <div style={{ fontSize: 13 }}>
                {activeTab === 'upcoming' && 'Найдите и забронируйте площадку'}
              </div>
            </div>
          ) : (
            filtered.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={booking.status === 'upcoming' ? () => setCancelTarget(booking) : undefined}
                onRebook={booking.status !== 'upcoming' ? () => setRebookCourt(booking.court) : undefined}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Попап отмены */}
      {cancelTarget && (
        <CancelPopup
          booking={cancelTarget}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}

      {/* Повторное бронирование */}
      {rebookCourt && (
        <CourtDetailSheet court={rebookCourt} onClose={() => setRebookCourt(null)} />
      )}
    </div>
  )
}
