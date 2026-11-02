import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Clock, MapPin, X, CalendarPlus } from 'lucide-react'
import { useBookings } from '../../contexts/BookingContext'
import type { Booking } from '../../contexts/BookingContext'
import { BOOKING_STATUS_META, type BookingStatus } from '../../lib/partnerCrm'
import {
  CANCEL_REASON_OPTIONS,
  type CancelReasonCode,
} from '../../utils/cancelReasons'

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

function resolveStatusMeta(booking: Booking): { label: string; color: string } {
  if (booking.crmStatus && booking.crmStatus in BOOKING_STATUS_META) {
    const crm = BOOKING_STATUS_META[booking.crmStatus as BookingStatus]
    return { label: booking.statusLabel ?? crm.label, color: crm.color }
  }
  if (booking.statusLabel) {
    return { label: booking.statusLabel, color: STATUS_META[booking.status].color }
  }
  return STATUS_META[booking.status]
}

function BookingRow({
  booking,
  onCancelClick,
  cancelling,
}: {
  booking: Booking
  onCancelClick: (id: number) => void
  cancelling: boolean
}) {
  const meta = resolveStatusMeta(booking)
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
          {booking.code && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 600 }}>
              Код брони · {booking.code}
            </div>
          )}
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
            type="button"
            onClick={() => onCancelClick(booking.id)}
            disabled={cancelling}
            aria-label="Отменить бронь"
            style={{
              width: 30, height: 30, borderRadius: 10, flexShrink: 0,
              border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)',
              color: '#f87171', cursor: cancelling ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: cancelling ? 0.55 : 1,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  )
}

function CancelBookingDialog({
  booking,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  booking: Booking
  busy: boolean
  error: string | null
  onClose: () => void
  onConfirm: (opts: { reason: string; reasonCode: CancelReasonCode }) => void
}) {
  const [code, setCode] = useState<CancelReasonCode | null>(null)
  const [customText, setCustomText] = useState('')

  const canSubmit = code != null && (code !== 'other' || customText.trim().length > 0)

  function submit() {
    if (!code || !canSubmit || busy) return
    const reason = code === 'other'
      ? customText.trim()
      : (CANCEL_REASON_OPTIONS.find(o => o.code === code)?.label ?? code)
    onConfirm({ reason, reasonCode: code })
  }

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 12000,
        background: 'rgba(2,6,23,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: '#1a2332',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          padding: 20,
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>
              Отменить бронь?
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8', lineHeight: 1.45 }}>
              {booking.court.name} · {booking.date} · {booking.time}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: 8, color: '#94a3b8', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
          ПРИЧИНА ОТМЕНЫ
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CANCEL_REASON_OPTIONS.map(opt => {
            const active = code === opt.code
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setCode(opt.code)}
                style={{
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: active ? '1px solid rgba(248,113,113,0.55)' : '1px solid rgba(255,255,255,0.08)',
                  background: active ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#fecaca' : '#e2e8f0',
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {code === 'other' && (
          <textarea
            value={customText}
            onChange={e => setCustomText(e.target.value)}
            placeholder="Опишите причину"
            rows={3}
            style={{
              width: '100%',
              marginTop: 12,
              boxSizing: 'border-box',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#243354',
              color: '#fff',
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
            }}
          />
        )}

        {error && (
          <p style={{ margin: '12px 0 0', fontSize: 13, color: '#f87171' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
              color: '#cbd5e1', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Назад
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || busy}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 12, border: 'none',
              background: canSubmit && !busy ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(248,113,113,0.25)',
              color: '#fff', fontWeight: 700, fontSize: 14,
              cursor: canSubmit && !busy ? 'pointer' : 'default',
              fontFamily: 'inherit',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Отменяем…' : 'Отменить бронь'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}

export function BookingsTab() {
  const navigate = useNavigate()
  const { bookings, cancelBooking, error: loadError, reload } = useBookings()
  const [filter, setFilter] = useState<typeof FILTERS[number]['id']>('all')
  const [actionError, setActionError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [cancelTargetId, setCancelTargetId] = useState<number | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)

  const cancelTarget = cancelTargetId != null
    ? bookings.find(b => b.id === cancelTargetId) ?? null
    : null

  async function confirmCancel(opts: { reason: string; reasonCode: CancelReasonCode }) {
    if (cancelTargetId == null || cancellingId != null) return
    setDialogError(null)
    setActionError(null)
    setCancellingId(cancelTargetId)
    try {
      await cancelBooking(cancelTargetId, opts)
      setCancelTargetId(null)
    } catch (e) {
      setDialogError(e instanceof Error ? e.message : 'Не удалось отменить бронь')
    } finally {
      setCancellingId(null)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)
  const counts = {
    all: bookings.length,
    upcoming: bookings.filter(b => b.status === 'upcoming').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }
  const bannerError = actionError ?? loadError

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

      {bannerError && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ flex: 1 }}>{bannerError}</span>
          {loadError && (
            <button
              type="button"
              onClick={() => void reload()}
              style={{
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.08)',
                color: '#f1f5f9',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Повторить
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {filtered.map(b => (
              <BookingRow
                key={b.id}
                booking={b}
                onCancelClick={(id) => {
                  setDialogError(null)
                  setCancelTargetId(id)
                }}
                cancelling={cancellingId === b.id}
              />
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

      <AnimatePresence>
        {cancelTarget && (
          <CancelBookingDialog
            booking={cancelTarget}
            busy={cancellingId === cancelTarget.id}
            error={dialogError}
            onClose={() => {
              if (cancellingId != null) return
              setCancelTargetId(null)
              setDialogError(null)
            }}
            onConfirm={opts => void confirmCancel(opts)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
