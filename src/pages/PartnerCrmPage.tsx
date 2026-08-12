import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Inbox,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  Wallet,
  X,
} from 'lucide-react'
import { usePartnerCrm } from '../contexts/PartnerCrmContext'
import {
  BOOKING_STATUS_META,
  PAYMENT_METHOD_LABEL,
  STATUS_TRANSITIONS,
  TRANSITION_LABEL,
  VENUE_KIND_LABEL,
  type BookingStatus,
  type PartnerBooking,
} from '../lib/partnerCrm'
import {
  digitsOnly,
  formatDateTime,
  formatDayLabel,
  formatMoney,
  formatRelative,
  isToday,
} from '../utils/partnerCrmFormat'

type Filter = 'all' | BookingStatus

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all',       label: 'Все' },
  { id: 'pending',   label: 'Новые' },
  { id: 'confirmed', label: 'Подтверждённые' },
  { id: 'paid',      label: 'Оплаченные' },
  { id: 'completed', label: 'Завершённые' },
  { id: 'cancelled', label: 'Отменённые' },
]

const TRANSITION_ICON: Record<BookingStatus, typeof Check> = {
  pending:   RotateCcw,
  confirmed: Check,
  paid:      Wallet,
  completed: CheckCheck,
  cancelled: X,
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const meta = BOOKING_STATUS_META[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 999,
        background: `${meta.color}1f`,
        border: `1px solid ${meta.color}40`,
        color: meta.color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
      {meta.label}
    </span>
  )
}

function TransitionButton({
  status,
  onClick,
  disabled,
  variant = 'compact',
}: {
  status: BookingStatus
  onClick: () => void
  disabled: boolean
  variant?: 'compact' | 'full'
}) {
  const Icon = TRANSITION_ICON[status]
  const danger = status === 'cancelled'
  const neutral = status === 'completed' || status === 'pending'

  const background = danger
    ? 'rgba(248,113,113,0.12)'
    : neutral
      ? 'rgba(255,255,255,0.06)'
      : 'linear-gradient(135deg, #22c55e, #16a34a)'

  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: variant === 'full' ? '12px 16px' : '9px 14px',
        width: variant === 'full' ? '100%' : undefined,
        borderRadius: 11,
        border: danger ? '1px solid rgba(248,113,113,0.3)' : neutral ? '1px solid rgba(255,255,255,0.1)' : 'none',
        background,
        color: danger ? '#f87171' : neutral ? '#cbd5e1' : '#fff',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={15} />
      {TRANSITION_LABEL[status]}
    </button>
  )
}

function BookingRow({
  booking,
  onOpen,
  onAction,
  isUpdating,
}: {
  booking: PartnerBooking
  onOpen: () => void
  onAction: (status: BookingStatus) => void
  isUpdating: boolean
}) {
  // В списке показываем только продвигающее действие — отмена живёт в карточке,
  // чтобы её нельзя было нажать случайно при скролле
  const primary = STATUS_TRANSITIONS[booking.status].find(s => s !== 'cancelled')

  return (
    <div
      className="crm-row card card-hover"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
    >
      <div className="crm-cell-status">
        <StatusBadge status={booking.status} />
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, fontWeight: 600 }}>{booking.code}</div>
        {/* По новым заявкам видно, сколько клиент уже ждёт ответа */}
        {booking.status === 'pending' && (
          <div style={{ fontSize: 10.5, color: '#f59e0b', marginTop: 2, fontWeight: 600 }}>
            {formatRelative(booking.createdAt)}
          </div>
        )}
      </div>

      <div className="crm-cell-customer" style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {booking.customerName}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
          <Phone size={11} /> {booking.customerPhone}
        </div>
      </div>

      <div className="crm-cell-venue" style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {booking.venueName}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{VENUE_KIND_LABEL[booking.venueKind]}</div>
      </div>

      <div className="crm-cell-when">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>
          <CalendarDays size={12} color="#64748b" />
          {formatDayLabel(booking.date)}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
          {booking.timeFrom}–{booking.timeTo} · {booking.guests} чел.
        </div>
      </div>

      <div className="crm-cell-amount">
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
          {formatMoney(booking.amount)}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
          {PAYMENT_METHOD_LABEL[booking.paymentMethod]}
        </div>
      </div>

      <div className="crm-cell-actions">
        {primary && (
          <TransitionButton status={primary} onClick={() => onAction(primary)} disabled={isUpdating} />
        )}
        <ChevronRight size={18} color="#475569" style={{ flexShrink: 0 }} />
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 0.4, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
    </div>
  )
}

function BookingDetailModal({
  booking,
  onClose,
  onAction,
  isUpdating,
}: {
  booking: PartnerBooking
  onClose: () => void
  onAction: (status: BookingStatus) => void
  isUpdating: boolean
}) {
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const transitions = STATUS_TRANSITIONS[booking.status]
  const remaining = Math.max(0, booking.amount - booking.paidAmount)

  return createPortal(
    <motion.div
      className="crm-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="crm-modal"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <StatusBadge status={booking.status} />
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{booking.code}</span>
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>
              {booking.customerName}
            </h2>
            <a
              href={`tel:${digitsOnly(booking.customerPhone)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 14, color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}
            >
              <Phone size={13} /> {booking.customerPhone}
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            style={{ display: 'flex', padding: 8, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer', flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="crm-detail-grid">
          <DetailField label="ПЛОЩАДКА" value={booking.venueName} />
          <DetailField label="ТИП" value={VENUE_KIND_LABEL[booking.venueKind]} />
          <DetailField label="ДАТА" value={formatDayLabel(booking.date)} />
          <DetailField label="ВРЕМЯ" value={`${booking.timeFrom}–${booking.timeTo}`} />
          <DetailField label="ГОСТЕЙ" value={`${booking.guests} чел.`} />
          <DetailField label="СПОСОБ ОПЛАТЫ" value={PAYMENT_METHOD_LABEL[booking.paymentMethod]} />
          <DetailField label="СУММА БРОНИ" value={formatMoney(booking.amount)} />
          <DetailField
            label="ОПЛАЧЕНО"
            value={remaining === 0 ? 'Полностью' : `${formatMoney(booking.paidAmount)} · остаток ${formatMoney(remaining)}`}
          />
          <DetailField label="СОЗДАНА" value={formatDateTime(booking.createdAt)} />
        </div>

        {booking.comment && (
          <div style={{ display: 'flex', gap: 10, marginTop: 18, padding: '12px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}>
            <MessageSquare size={15} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{booking.comment}</p>
          </div>
        )}

        {transitions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
            {transitions.map(status => {
              if (status !== 'cancelled') {
                return (
                  <div key={status} style={{ flex: '1 1 180px' }}>
                    <TransitionButton status={status} onClick={() => onAction(status)} disabled={isUpdating} variant="full" />
                  </div>
                )
              }

              return (
                <div key={status} style={{ flex: '1 1 180px' }}>
                  {confirmCancel ? (
                    <button
                      type="button"
                      onClick={() => onAction('cancelled')}
                      disabled={isUpdating}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: 11,
                        border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                        cursor: isUpdating ? 'default' : 'pointer', opacity: isUpdating ? 0.6 : 1,
                      }}
                    >
                      Точно отменить бронь?
                    </button>
                  ) : (
                    <TransitionButton status="cancelled" onClick={() => setConfirmCancel(true)} disabled={isUpdating} variant="full" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  )
}

export function PartnerCrmPage() {
  const { bookings, isLoading, error, updatingId, reload, changeStatus } = usePartnerCrm()

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: bookings.length, pending: 0, confirmed: 0, paid: 0, completed: 0, cancelled: 0,
    }
    for (const b of bookings) base[b.status] += 1
    return base
  }, [bookings])

  const todayCount = useMemo(
    () => bookings.filter(b => isToday(b.date) && b.status !== 'cancelled').length,
    [bookings],
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const qDigits = digitsOnly(q)

    return bookings
      .filter(b => filter === 'all' || b.status === filter)
      .filter(b => {
        if (!q) return true
        if (qDigits.length >= 3 && digitsOnly(b.customerPhone).includes(qDigits)) return true
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.venueName.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        // Новые заявки всегда сверху — с ними и работает дежурный администратор
        const aNew = a.status === 'pending' ? 0 : 1
        const bNew = b.status === 'pending' ? 0 : 1
        if (aNew !== bNew) return aNew - bNew
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        return a.timeFrom < b.timeFrom ? -1 : 1
      })
  }, [bookings, filter, query])

  const openBooking = openId ? bookings.find(b => b.id === openId) ?? null : null

  async function handleAction(id: string, status: BookingStatus) {
    setActionError('')
    const result = await changeStatus(id, status)
    if (!result.success) {
      setActionError(result.error ?? 'Не удалось изменить статус')
      return
    }
    // Отменённую или завершённую бронь больше не нужно держать открытой
    if (status === 'cancelled' || status === 'completed') setOpenId(null)
  }

  const STAT_CARDS = [
    { label: 'Ждут подтверждения', value: counts.pending,   color: '#f59e0b' },
    { label: 'На сегодня',         value: todayCount,       color: '#3b82f6' },
    { label: 'Подтверждено',       value: counts.confirmed, color: '#22c55e' },
    { label: 'Оплачено',           value: counts.paid,      color: '#a855f7' },
  ]

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
          Брони
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Подтверждайте заявки, отмечайте оплаты и закрывайте визиты
        </p>
      </motion.div>

      <div className="crm-stats-grid">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="crm-toolbar">
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск по имени, телефону, номеру брони"
            style={{
              width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12,
              background: '#243354', border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => void reload()}
          disabled={isLoading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 16px',
            borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)', color: '#cbd5e1',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            cursor: isLoading ? 'default' : 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <RefreshCw size={15} className={isLoading ? 'crm-spin' : undefined} />
          Обновить
        </button>
      </div>

      <div className="crm-filters">
        {FILTERS.map(f => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 14px', borderRadius: 999,
                border: active ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.08)',
                background: active ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.03)',
                color: active ? '#22c55e' : '#94a3b8',
                fontSize: 13, fontWeight: active ? 700 : 500,
                fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {f.label}
              <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#22c55e' : '#64748b' }}>
                {counts[f.id]}
              </span>
            </button>
          )
        })}
      </div>

      {(error || actionError) && (
        <p style={{ padding: '11px 14px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, marginBottom: 14 }}>
          {error || actionError}
        </p>
      )}

      {isLoading && bookings.length === 0 ? (
        <div className="crm-list">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card crm-skeleton" style={{ height: 84 }} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="card" style={{ padding: '46px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Inbox size={22} color="#64748b" />
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Броней не найдено</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
            {query ? 'Попробуйте изменить запрос или сбросить фильтр' : 'В этом статусе пока пусто'}
          </p>
        </div>
      ) : (
        <div className="crm-list">
          {visible.map(b => (
            <BookingRow
              key={b.id}
              booking={b}
              onOpen={() => { setActionError(''); setOpenId(b.id) }}
              onAction={status => void handleAction(b.id, status)}
              isUpdating={updatingId === b.id}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {openBooking && (
          <BookingDetailModal
            booking={openBooking}
            onClose={() => setOpenId(null)}
            onAction={status => void handleAction(openBooking.id, status)}
            isUpdating={updatingId === openBooking.id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
