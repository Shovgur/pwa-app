import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  Info,
  Pencil,
  Percent,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { fetchPartnerVenues, type PartnerVenue } from '../lib/partnerVenues'
import {
  PROMO_TYPE_META,
  createPartnerPromotion,
  deletePartnerPromotion,
  fetchPartnerPromotions,
  promotionBadgeLabel,
  updatePartnerPromotion,
  type CreatePromotionPayload,
  type PromoType,
  type VenuePromotion,
} from '../lib/partnerPromotions'
import { PARTNER_VENUES_PATH } from '../utils/partnerAccess'
import { FormSelect } from '../components/ui/FormSelect'
import { usePartnerAuth } from '../contexts/PartnerAuthContext'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  background: '#243354',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: 7,
}

function PromoForm({
  venueId,
  submitting,
  initial,
  onCancel,
  onSubmit,
}: {
  venueId: string
  submitting: boolean
  initial?: VenuePromotion | null
  onCancel: () => void
  onSubmit: (payload: CreatePromotionPayload) => Promise<void>
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [promoType, setPromoType] = useState<PromoType>(initial?.promoType ?? 'evening')
  const [discountPercent, setDiscountPercent] = useState(
    initial?.discountPercent != null ? String(initial.discountPercent) : '15',
  )
  const [timeFrom, setTimeFrom] = useState(initial?.timeFrom ?? '18:00')
  const [timeTo, setTimeTo] = useState(initial?.timeTo ?? '22:00')
  const [startsAt, setStartsAt] = useState(initial?.startsAt ?? '')
  const [endsAt, setEndsAt] = useState(initial?.endsAt ?? '')
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const percent = parseInt(discountPercent, 10)
    await onSubmit({
      venueId,
      title: title.trim(),
      description: description.trim(),
      promoType,
      discountPercent: Number.isFinite(percent) && percent > 0 ? percent : null,
      timeFrom: promoType === 'time_window' || promoType === 'evening' || promoType === 'low_occupancy'
        ? timeFrom
        : null,
      timeTo: promoType === 'time_window' || promoType === 'evening' || promoType === 'low_occupancy'
        ? timeTo
        : null,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
      isActive: initial?.isActive ?? true,
      isFeatured,
    })
  }

  const typeOptions = (Object.keys(PROMO_TYPE_META) as PromoType[]).map(value => ({
    value,
    label: PROMO_TYPE_META[value].label,
  }))

  return (
    <form onSubmit={e => void handleSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <FormSelect
          label="Тип акции"
          value={promoType}
          options={typeOptions}
          onChange={v => setPromoType(v as PromoType)}
          accent="#f97316"
        />
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>{PROMO_TYPE_META[promoType].hint}</p>
      </div>

      <div>
        <label style={labelStyle}>Название</label>
        <input
          required
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Вечер −20%"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Описание для клиентов</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="Кратко, что получает клиент"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Скидка, %</label>
          <input
            type="number"
            min={1}
            max={90}
            value={discountPercent}
            onChange={e => setDiscountPercent(e.target.value)}
            style={inputStyle}
          />
        </div>
        {(promoType === 'time_window' || promoType === 'evening' || promoType === 'low_occupancy') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={labelStyle}>С</label>
              <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>До</label>
              <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} style={inputStyle} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Начало (опц.)</label>
          <input type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Конец (опц.)</label>
          <input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <p style={{ margin: '-6px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
        Можно запланировать заранее (например через 3 дня). До даты начала акция будет только в кабинете; на сайте появится автоматически.
      </p>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#cbd5e1' }}>
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={e => setIsFeatured(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: '#22c55e' }}
        />
        Показывать в ленте акций на сайте и поднимать площадку
      </label>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '11px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
            background: 'transparent', color: '#94a3b8', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          style={{
            padding: '11px 18px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#fff', fontWeight: 700, fontFamily: 'inherit',
            cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Сохраняем…' : (initial ? 'Сохранить' : 'Создать акцию')}
        </button>
      </div>
    </form>
  )
}

function VenuePromoCard({
  venue,
  promotions,
  canManage,
  onCreated,
  onUpdated,
  onDeleted,
}: {
  venue: PartnerVenue
  promotions: VenuePromotion[]
  canManage: boolean
  onCreated: (p: VenuePromotion) => void
  onUpdated: (p: VenuePromotion) => void
  onDeleted: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<VenuePromotion | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(payload: CreatePromotionPayload) {
    setBusy(true)
    setError('')
    try {
      const promo = await createPartnerPromotion(payload)
      onCreated(promo)
      setFormOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать акцию')
      throw e
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate(payload: CreatePromotionPayload) {
    if (!editing) return
    setBusy(true)
    setError('')
    try {
      const { venueId: _venueId, ...rest } = payload
      const updated = await updatePartnerPromotion(editing.id, rest)
      onUpdated(updated)
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить акцию')
      throw e
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(promo: VenuePromotion) {
    setBusy(true)
    try {
      const updated = await updatePartnerPromotion(promo.id, { isActive: !promo.isActive })
      onUpdated(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setBusy(false)
    }
  }

  async function remove(promo: VenuePromotion) {
    setBusy(true)
    try {
      await deletePartnerPromotion(promo.id)
      onDeleted(promo.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Building2 size={18} color="#f97316" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{venue.name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {venue.city} · {promotions.length} акци{promotions.length === 1 ? 'я' : promotions.length < 5 ? 'и' : 'й'}
            {!canManage && ' · только просмотр'}
          </div>
        </div>
        {promotions.some(p => p.isActive) && (
          <span style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            background: 'rgba(249,115,22,0.15)', color: '#fb923c',
          }}>
            АКТИВНО
          </span>
        )}
        <ChevronDown
          size={18}
          color="#64748b"
          style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {error && (
                <p style={{ margin: 0, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 13 }}>
                  {error}
                </p>
              )}

              {promotions.length === 0 && !formOpen && (
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Акций пока нет</p>
              )}

              {promotions.map(promo => (
                editing?.id === promo.id ? (
                  <div
                    key={promo.id}
                    style={{ padding: 14, borderRadius: 14, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Редактирование акции</span>
                      <button type="button" onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>
                    <PromoForm
                      key={promo.id}
                      venueId={venue.id}
                      initial={promo}
                      submitting={busy}
                      onCancel={() => setEditing(null)}
                      onSubmit={handleUpdate}
                    />
                  </div>
                ) : (
                <div
                  key={promo.id}
                  style={{
                    padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}
                >
                  <div style={{
                    padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800,
                    background: 'rgba(249,115,22,0.18)', color: '#fb923c', flexShrink: 0,
                  }}>
                    {promotionBadgeLabel(promo)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{promo.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                      {PROMO_TYPE_META[promo.promoType]?.label ?? promo.promoType}
                      {promo.isFeatured ? ' · в ленте' : ''}
                      {!promo.isActive ? ' · скрыта' : ''}
                      {promo.isActive && promo.startsAt && promo.startsAt > new Date().toISOString().slice(0, 10)
                        ? ` · на сайте с ${promo.startsAt.slice(8, 10)}.${promo.startsAt.slice(5, 7)}`
                        : ''}
                      {promo.endsAt ? ` · до ${promo.endsAt.slice(8, 10)}.${promo.endsAt.slice(5, 7)}` : ''}
                    </div>
                    {promo.description && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.45 }}>{promo.description}</p>
                    )}
                  </div>
                  {canManage && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setFormOpen(false)
                          setEditing(promo)
                        }}
                        aria-label="Изменить"
                        style={{
                          padding: 8, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', cursor: 'pointer',
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void toggleActive(promo)}
                        style={{
                          padding: '7px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                          color: '#cbd5e1', cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {promo.isActive ? 'Скрыть' : 'Показать'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void remove(promo)}
                        aria-label="Удалить"
                        style={{
                          padding: 8, borderRadius: 10, border: '1px solid rgba(248,113,113,0.25)',
                          background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                )
              ))}

              {canManage && !formOpen && !editing && (
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
                    padding: '10px 14px', borderRadius: 11, border: '1px dashed rgba(249,115,22,0.4)',
                    background: 'rgba(249,115,22,0.08)', color: '#fb923c', fontWeight: 700,
                    fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Добавить акцию
                </button>
              )}

              {formOpen && !editing && (
                <div style={{ padding: 14, borderRadius: 14, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Новая акция</span>
                    <button type="button" onClick={() => setFormOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                  <PromoForm
                    venueId={venue.id}
                    submitting={busy}
                    onCancel={() => setFormOpen(false)}
                    onSubmit={handleCreate}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PartnerPromotionsPage() {
  const { partner } = usePartnerAuth()
  const [venues, setVenues] = useState<PartnerVenue[]>([])
  const [promotions, setPromotions] = useState<VenuePromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [v, p] = await Promise.all([fetchPartnerVenues(), fetchPartnerPromotions()])
        if (!cancelled) {
          setVenues(v)
          setPromotions(p)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const byVenue = useMemo(() => {
    const map = new Map<string, VenuePromotion[]>()
    for (const p of promotions) {
      const list = map.get(p.venueId) ?? []
      list.push(p)
      map.set(p.venueId, list)
    }
    return map
  }, [promotions])

  function canManageVenue(venue: PartnerVenue): boolean {
    if (venue.canEdit === true) return true
    if (venue.canEdit === false) return false
    if (!partner?.staffId) return false
    return String(venue.managedByStaffId ?? '') === String(partner.staffId)
  }

  const list = venues

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
          Акции
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Акции по вашим площадкам — клиенты увидят бейджи и ленту на сайте
        </p>
      </motion.div>

      <div className="card" style={{ padding: '16px 18px', marginBottom: 20, display: 'flex', gap: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={17} color="#f97316" />
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
          Вы видите все площадки компании, но акции и правки — только по своей точке.
          {' '}
          <Link to={PARTNER_VENUES_PATH} style={{ color: '#22c55e', fontWeight: 600 }}>К площадкам</Link>
        </p>
      </div>

      {error && (
        <p style={{ padding: '11px 14px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          [0, 1].map(i => <div key={i} className="card crm-skeleton" style={{ height: 72 }} />)
        ) : list.length === 0 ? (
          <div className="card" style={{ padding: '42px 24px', textAlign: 'center' }}>
            <Percent size={22} color="#64748b" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Сначала создайте площадку</p>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
              Акции привязываются к объектам в разделе «Площадки»
            </p>
            <Link
              to={PARTNER_VENUES_PATH}
              style={{
                display: 'inline-flex', marginTop: 16, padding: '11px 16px', borderRadius: 12,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                fontWeight: 700, textDecoration: 'none', fontSize: 13,
              }}
            >
              Открыть площадки
            </Link>
          </div>
        ) : (
          list.map(venue => (
            <VenuePromoCard
              key={venue.id}
              venue={venue}
              promotions={byVenue.get(venue.id) ?? []}
              canManage={canManageVenue(venue)}
              onCreated={p => setPromotions(prev => [p, ...prev])}
              onUpdated={p => setPromotions(prev => prev.map(x => (x.id === p.id ? p : x)))}
              onDeleted={id => setPromotions(prev => prev.filter(x => x.id !== id))}
            />
          ))
        )}
      </div>

      {!loading && list.length > 0 && (
        <div className="card" style={{ marginTop: 16, padding: '14px 16px', display: 'flex', gap: 12 }}>
          <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
            Отметьте «в ленте», чтобы акция попала наверх каталога. Чип «Акции» на сайте покажет только площадки со скидками.
          </p>
        </div>
      )}
    </div>
  )
}
