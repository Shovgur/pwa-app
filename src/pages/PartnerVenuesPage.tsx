import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Camera,
  ImageIcon,
  Info,
  MapPin,
  Plus,
  Power,
  Trash2,
  X,
} from 'lucide-react'
import {
  createPartnerVenue,
  deletePartnerVenue,
  fetchPartnerVenues,
  setPartnerVenueActive,
  VENUE_KIND_LABEL,
  type CreateVenuePayload,
  type PartnerVenue,
  type VenueKind,
} from '../lib/partnerVenues'
import { VenueBuilderForm } from '../components/partner/VenueBuilderForm'
import { venuePriceSummary } from '../utils/venuePrice'

const KIND_COLORS: Record<VenueKind, string> = {
  sport:   '#22c55e',
  pool:    '#06b6d4',
  loft:    '#a855f7',
  meeting: '#3b82f6',
}

function VenueCard({
  venue,
  onToggle,
  onDelete,
  busy,
}: {
  venue: PartnerVenue
  onToggle: () => void
  onDelete: () => void
  busy: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const kindColor = KIND_COLORS[venue.venueKind]
  const cover = venue.photos.find(p => p.isCover) ?? venue.photos[0]

  return (
    <div className="card partner-venue-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, minWidth: 0, flex: 1 }}>
        <div className="venue-card-thumb" style={{ background: cover ? undefined : `${kindColor}22` }}>
          {cover ? (
            <img src={cover.url} alt="" />
          ) : (
            <Building2 size={20} color={venue.isActive ? kindColor : '#64748b'} />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{venue.name}</span>
            <span style={{
              padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: `${kindColor}18`, color: kindColor,
              border: `1px solid ${kindColor}35`,
            }}>
              {VENUE_KIND_LABEL[venue.venueKind].toUpperCase()}
            </span>
            <span style={{
              padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: venue.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.12)',
              color: venue.isActive ? '#22c55e' : '#94a3b8',
              border: `1px solid ${venue.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.2)'}`,
            }}>
              {venue.isActive ? 'АКТИВНА' : 'СКРЫТА'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
            <MapPin size={12} />
            {venue.city}, {venue.address}
          </div>

          {venue.description && (
            <p style={{ margin: '0 0 6px', fontSize: 12, color: '#64748b', lineHeight: 1.45 }}>
              {venue.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#cbd5e1' }}>
            <span>{venuePriceSummary(venue)}</span>
            {venue.photos.length > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Camera size={12} /> {venue.photos.length}
              </span>
            )}
            {venue.extraServices.length > 0 && (
              <span>+{venue.extraServices.length} услуг</span>
            )}
            <span>Броней: <strong style={{ color: '#f1f5f9' }}>{venue.bookingsCount}</strong></span>
          </div>

          {venue.amenities.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {venue.amenities.slice(0, 5).map(a => (
                <span key={a} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 10, background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                  {a}
                </span>
              ))}
              {venue.amenities.length > 5 && (
                <span style={{ fontSize: 10, color: '#64748b' }}>+{venue.amenities.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 11,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
            color: '#cbd5e1', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, whiteSpace: 'nowrap',
          }}
        >
          <Power size={14} />
          {venue.isActive ? 'Скрыть' : 'Показать'}
        </button>

        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              aria-label="Отменить"
              style={{ display: 'flex', padding: 9, borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Удалить площадку"
            style={{ display: 'flex', padding: 10, borderRadius: 11, border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export function PartnerVenuesPage() {
  const [venues, setVenues]       = useState<PartnerVenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState('')
  const [busyId, setBusyId]       = useState<string | null>(null)
  const [formOpen, setFormOpen]   = useState(false)
  const [creating, setCreating]   = useState(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const list = await fetchPartnerVenues()
        if (!cancelled) setVenues(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Не удалось загрузить площадки')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleCreate(payload: CreateVenuePayload) {
    setError('')
    setCreating(true)
    try {
      const venue = await createPartnerVenue(payload)
      setVenues(prev => [...prev, venue])
      setFormOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать площадку')
      throw e
    } finally {
      setCreating(false)
    }
  }

  async function handleToggle(venue: PartnerVenue) {
    setError('')
    setBusyId(venue.id)
    try {
      const updated = await setPartnerVenueActive(venue.id, !venue.isActive)
      setVenues(prev => prev.map(v => (v.id === venue.id ? updated : v)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось изменить статус')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(venue: PartnerVenue) {
    setError('')
    setBusyId(venue.id)
    try {
      await deletePartnerVenue(venue.id)
      setVenues(prev => prev.filter(v => v.id !== venue.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить площадку')
    } finally {
      setBusyId(null)
    }
  }

  const activeCount = venues.filter(v => v.isActive).length

  return (
    <div className="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
            Площадки
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {activeCount > 0
              ? `${activeCount} активн${activeCount === 1 ? 'ая' : activeCount < 5 ? 'ые' : 'ых'} из ${venues.length}`
              : 'Добавьте объекты вашей компании'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen(o => !o)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px',
            borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,197,94,0.25)',
          }}
        >
          <Plus size={16} />
          Добавить площадку
        </button>
      </motion.div>

      <div className="card" style={{ padding: '16px 18px', marginBottom: 20, display: 'flex', gap: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={17} color="#3b82f6" />
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
          Настройте фото, тарифы по времени, пакеты по часам и доп. услуги. Публичный каталог пока на демо-данных —
          после подключения API ваши площадки появятся для клиентов.
        </p>
      </div>

      {formOpen && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '20px 22px', marginBottom: 20 }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Новая площадка</div>
          <VenueBuilderForm
            submitting={creating}
            onCancel={() => setFormOpen(false)}
            onSubmit={handleCreate}
          />
        </motion.div>
      )}

      {error && (
        <p style={{ padding: '11px 14px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, margin: '0 0 16px' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          [0, 1].map(i => <div key={i} className="card crm-skeleton" style={{ height: 100 }} />)
        ) : venues.length === 0 ? (
          <div className="card" style={{ padding: '42px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <ImageIcon size={22} color="#64748b" />
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Площадок пока нет</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
              Добавьте первый объект с фото, тарифами и услугами
            </p>
          </div>
        ) : (
          venues.map(venue => (
            <VenueCard
              key={venue.id}
              venue={venue}
              busy={busyId === venue.id}
              onToggle={() => void handleToggle(venue)}
              onDelete={() => void handleDelete(venue)}
            />
          ))
        )}
      </div>
    </div>
  )
}
