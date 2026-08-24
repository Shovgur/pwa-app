import { useRef, useState } from 'react'
import {
  Camera,
  ChevronDown,
  Clock,
  Layers,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Wrench,
  X,
} from 'lucide-react'
import type {
  CreateVenuePayload,
  ExtraBilling,
  VenueDurationRule,
  VenueExtraService,
  VenueKind,
  VenuePhoto,
  VenueTimePriceRule,
} from '../../lib/partnerVenues'
import { VENUE_KIND_OPTIONS } from '../../lib/partnerVenues'
import { FieldError, errorInputStyle } from '../ui/FieldError'
import { useFieldErrors } from '../../hooks/useFieldErrors'
import {
  BILLING_LABEL,
  makeExtraFromPreset,
  presetAmenitiesForKind,
  presetExtrasForKind,
  timePricePresets,
} from '../../utils/venueBuilderPresets'
import { parsePriceInput } from '../../utils/venuePrice'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
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
  letterSpacing: 0.5,
}

const sectionBtnStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '14px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
  color: '#e2e8f0',
  fontSize: 14,
  fontWeight: 700,
  fontFamily: 'inherit',
  cursor: 'pointer',
  textAlign: 'left',
}

const addRowBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 14px',
  borderRadius: 10,
  border: '1px dashed rgba(34,197,94,0.4)',
  background: 'rgba(34,197,94,0.06)',
  color: '#4ade80',
  fontSize: 12,
  fontWeight: 700,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const MAX_PHOTOS = 8
const MAX_FILE_MB = 2

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function Section({
  title,
  icon: Icon,
  count,
  open,
  onToggle,
  children,
}: {
  title: string
  icon: typeof Camera
  count?: number
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <button type="button" onClick={onToggle} style={sectionBtnStyle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={17} color="#22c55e" />
          {title}
          {count != null && count > 0 && (
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800,
              background: 'rgba(34,197,94,0.15)', color: '#22c55e',
            }}>
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          color="#64748b"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>
      {open && (
        <div style={{
          marginTop: 10, padding: '16px 16px 4px',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.12)',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}

function PriceInput({
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  error?: boolean
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      className="partner-no-spinner"
      value={value}
      onChange={e => onChange(e.target.value.replace(/[^\d\s,]/g, ''))}
      placeholder={placeholder}
      required={required}
      style={{ ...inputStyle, ...errorInputStyle(!!error) }}
    />
  )
}

export interface VenueBuilderFormProps {
  onSubmit: (payload: CreateVenuePayload) => Promise<void>
  onCancel: () => void
  submitting: boolean
}

export function VenueBuilderForm({ onSubmit, onCancel, submitting }: VenueBuilderFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { errors, handleInvalid, clearError } = useFieldErrors()

  const [openSections, setOpenSections] = useState({
    basic: true,
    photos: true,
    pricing: true,
    extras: false,
    amenities: false,
  })

  const [name, setName] = useState('')
  const [venueKind, setVenueKind] = useState<VenueKind>('sport')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<VenuePhoto[]>([])
  const [basePrice, setBasePrice] = useState('')
  const [timeRules, setTimeRules] = useState<VenueTimePriceRule[]>([])
  const [durationRules, setDurationRules] = useState<VenueDurationRule[]>([])
  const [extras, setExtras] = useState<VenueExtraService[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [customAmenity, setCustomAmenity] = useState('')
  const [formError, setFormError] = useState('')

  const [newExtra, setNewExtra] = useState({
    name: '', description: '', price: '', billing: 'per_booking' as ExtraBilling,
  })

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handlePhotos(files: FileList | null) {
    if (!files?.length) return
    setFormError('')

    const remaining = MAX_PHOTOS - photos.length
    const batch = Array.from(files).slice(0, remaining)

    for (const file of batch) {
      if (!file.type.startsWith('image/')) {
        setFormError('Можно загружать только изображения')
        continue
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        setFormError(`Файл «${file.name}» больше ${MAX_FILE_MB} МБ`)
        continue
      }

      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
        reader.readAsDataURL(file)
      })

      setPhotos(prev => {
        const photo: VenuePhoto = {
          id: uid('ph'),
          url,
          isCover: prev.length === 0,
        }
        return [...prev, photo]
      })
    }
  }

  function removePhoto(id: string) {
    setPhotos(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length && !next.some(p => p.isCover)) next[0].isCover = true
      return [...next]
    })
  }

  function setCover(id: string) {
    setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === id })))
  }

  function addTimeRule(preset?: { label: string; timeFrom: string; timeTo: string }) {
    setTimeRules(prev => [...prev, {
      id: uid('tr'),
      label: preset?.label ?? '',
      timeFrom: preset?.timeFrom ?? '09:00',
      timeTo: preset?.timeTo ?? '12:00',
      pricePerHour: 0,
    }])
  }

  function addDurationRule() {
    setDurationRules(prev => [...prev, {
      id: uid('dr'),
      hours: 2,
      price: 0,
      label: '',
    }])
  }

  function addCustomExtra() {
    const price = parsePriceInput(newExtra.price)
    if (!newExtra.name.trim() || !price) {
      setFormError('Укажите название и цену услуги')
      return
    }
    setExtras(prev => [...prev, {
      id: uid('ex'),
      name: newExtra.name.trim(),
      description: newExtra.description.trim(),
      price,
      billing: newExtra.billing,
    }])
    setNewExtra({ name: '', description: '', price: '', billing: 'per_booking' })
    setFormError('')
  }

  function toggleAmenity(label: string) {
    setAmenities(prev =>
      prev.includes(label) ? prev.filter(a => a !== label) : [...prev, label],
    )
  }

  function addCustomAmenity() {
    const v = customAmenity.trim()
    if (!v) return
    if (!amenities.includes(v)) setAmenities(prev => [...prev, v])
    setCustomAmenity('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    const base = parsePriceInput(basePrice)
    const filledTimeRules = timeRules
      .map(r => ({ ...r, pricePerHour: parsePriceInput(String(r.pricePerHour)) ?? 0 }))
      .filter(r => r.pricePerHour > 0)

    if (!base && filledTimeRules.length === 0) {
      setFormError('Укажите базовую цену или хотя бы один тариф по времени')
      setOpenSections(s => ({ ...s, pricing: true }))
      return
    }

    const payload: CreateVenuePayload = {
      name: name.trim(),
      venueKind,
      city: city.trim(),
      address: address.trim(),
      description: description.trim(),
      photos,
      basePricePerHour: base ?? 0,
      timePriceRules: filledTimeRules,
      durationRules: durationRules
        .map(r => ({ ...r, price: parsePriceInput(String(r.price)) ?? 0 }))
        .filter(r => r.hours > 0 && r.price > 0),
      extraServices: extras,
      amenities,
    }

    await onSubmit(payload)
  }

  const kindPresets = presetExtrasForKind(venueKind)
  const kindAmenities = presetAmenitiesForKind(venueKind)

  return (
    <form onSubmit={handleSubmit}>
      <Section
        title="Основное"
        icon={Layers}
        open={openSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="partner-info-grid">
          <div>
            <label style={labelStyle}>НАЗВАНИЕ</label>
            <input
              type="text" value={name}
              onChange={e => { setName(e.target.value); clearError('name') }}
              onInvalid={handleInvalid('name')}
              placeholder='Корт "Спарта"' required
              style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.name)) }}
            />
            <FieldError message={errors.name} />
          </div>
          <div>
            <label style={labelStyle}>ТИП ПЛОЩАДКИ</label>
            <select
              value={venueKind}
              onChange={e => setVenueKind(e.target.value as VenueKind)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {VENUE_KIND_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>ГОРОД</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Москва" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>АДРЕС</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="ул. Примерная, 1" required style={inputStyle} />
          </div>
          <div className="full-width">
            <label style={labelStyle}>ОПИСАНИЕ</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Кратко опишите площадку, правила, вместимость"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 88 }}
            />
          </div>
        </div>
      </Section>

      <Section
        title="Фотографии"
        icon={Camera}
        count={photos.length}
        open={openSections.photos}
        onToggle={() => toggleSection('photos')}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => { void handlePhotos(e.target.files); e.target.value = '' }}
        />
        <div className="venue-photo-grid">
          {photos.map(photo => (
            <div key={photo.id} className="venue-photo-item">
              <img src={photo.url} alt="" />
              <div className="venue-photo-actions">
                <button type="button" onClick={() => setCover(photo.id)} title="Сделать обложкой" className={photo.isCover ? 'is-cover' : ''}>
                  <Star size={14} />
                </button>
                <button type="button" onClick={() => removePhoto(photo.id)} title="Удалить">
                  <Trash2 size={14} />
                </button>
              </div>
              {photo.isCover && <span className="venue-photo-cover-badge">Обложка</span>}
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button type="button" className="venue-photo-add" onClick={() => fileRef.current?.click()}>
              <Camera size={22} color="#64748b" />
              <span>Добавить</span>
            </button>
          )}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 12, color: '#64748b' }}>
          До {MAX_PHOTOS} фото, макс. {MAX_FILE_MB} МБ каждое. Первая или отмеченная звездой — обложка в каталоге.
        </p>
      </Section>

      <Section
        title="Цены и тарифы"
        icon={Clock}
        count={timeRules.length + durationRules.length + (basePrice ? 1 : 0)}
        open={openSections.pricing}
        onToggle={() => toggleSection('pricing')}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>БАЗОВАЯ ЦЕНА ЗА ЧАС, ₽</label>
          <PriceInput value={basePrice} onChange={setBasePrice} placeholder="1500" />
          <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#64748b' }}>
            Используется, если время брони не попадает ни в один тариф ниже
          </p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1' }}>Цены по времени суток</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {timePricePresets().map(p => (
                <button key={p.label} type="button" style={{ ...addRowBtnStyle, padding: '6px 10px' }} onClick={() => addTimeRule(p)}>
                  + {p.label}
                </button>
              ))}
              <button type="button" style={addRowBtnStyle} onClick={() => addTimeRule()}>
                <Plus size={13} /> Свой
              </button>
            </div>
          </div>

          {timeRules.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Например: утро 08:00–12:00 — 1200 ₽/ч, вечер 18:00–22:00 — 2500 ₽/ч</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {timeRules.map(rule => (
                <div key={rule.id} className="venue-rule-row">
                  <input
                    type="text" value={rule.label} placeholder="Название"
                    onChange={e => setTimeRules(prev => prev.map(r => r.id === rule.id ? { ...r, label: e.target.value } : r))}
                    style={{ ...inputStyle, flex: '1 1 120px' }}
                  />
                  <input
                    type="time" value={rule.timeFrom}
                    onChange={e => setTimeRules(prev => prev.map(r => r.id === rule.id ? { ...r, timeFrom: e.target.value } : r))}
                    style={{ ...inputStyle, flex: '0 0 110px' }}
                  />
                  <span style={{ color: '#64748b', fontSize: 12 }}>—</span>
                  <input
                    type="time" value={rule.timeTo}
                    onChange={e => setTimeRules(prev => prev.map(r => r.id === rule.id ? { ...r, timeTo: e.target.value } : r))}
                    style={{ ...inputStyle, flex: '0 0 110px' }}
                  />
                  <PriceInput
                    value={rule.pricePerHour ? String(rule.pricePerHour) : ''}
                    onChange={v => setTimeRules(prev => prev.map(r => r.id === rule.id ? { ...r, pricePerHour: parsePriceInput(v) ?? 0 } : r))}
                    placeholder="₽/ч"
                  />
                  <button type="button" onClick={() => setTimeRules(prev => prev.filter(r => r.id !== rule.id))} style={{ padding: 10, border: 'none', background: 'rgba(248,113,113,0.1)', borderRadius: 10, color: '#f87171', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1' }}>Пакеты по длительности</span>
            <button type="button" style={addRowBtnStyle} onClick={addDurationRule}>
              <Plus size={13} /> Пакет
            </button>
          </div>
          {durationRules.length === 0 ? (
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Например: 2 часа — 2800 ₽, 3 часа — 3900 ₽ (фиксированная цена)</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {durationRules.map(rule => (
                <div key={rule.id} className="venue-rule-row">
                  <input
                    type="text" value={rule.label} placeholder="Название (опц.)"
                    onChange={e => setDurationRules(prev => prev.map(r => r.id === rule.id ? { ...r, label: e.target.value } : r))}
                    style={{ ...inputStyle, flex: '1 1 140px' }}
                  />
                  <input
                    type="text" inputMode="numeric" className="partner-no-spinner"
                    value={rule.hours ? String(rule.hours) : ''}
                    placeholder="Часов"
                    onChange={e => setDurationRules(prev => prev.map(r => r.id === rule.id ? { ...r, hours: Number(e.target.value.replace(/\D/g, '')) || 0 } : r))}
                    style={{ ...inputStyle, flex: '0 0 90px' }}
                  />
                  <PriceInput
                    value={rule.price ? String(rule.price) : ''}
                    onChange={v => setDurationRules(prev => prev.map(r => r.id === rule.id ? { ...r, price: parsePriceInput(v) ?? 0 } : r))}
                    placeholder="Цена ₽"
                  />
                  <button type="button" onClick={() => setDurationRules(prev => prev.filter(r => r.id !== rule.id))} style={{ padding: 10, border: 'none', background: 'rgba(248,113,113,0.1)', borderRadius: 10, color: '#f87171', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Доп. услуги"
        icon={Wrench}
        count={extras.length}
        open={openSections.extras}
        onToggle={() => toggleSection('extras')}
      >
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
          Готовые для «{VENUE_KIND_OPTIONS.find(o => o.value === venueKind)?.label}»:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {kindPresets.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setExtras(prev => [...prev, makeExtraFromPreset(preset)])}
              style={{
                padding: '8px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', fontSize: 12,
                fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              }}
            >
              + {preset.name}
            </button>
          ))}
        </div>

        {extras.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {extras.map(ex => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {ex.description || '—'} · {ex.price.toLocaleString('ru-RU')} ₽ {BILLING_LABEL[ex.billing]}
                  </div>
                </div>
                <button type="button" onClick={() => setExtras(prev => prev.filter(e => e.id !== ex.id))} style={{ padding: 8, border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="partner-info-grid">
          <div>
            <label style={labelStyle}>СВОЯ УСЛУГА</label>
            <input type="text" value={newExtra.name} onChange={e => setNewExtra(s => ({ ...s, name: e.target.value }))} placeholder="Аренда ракеток" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ЦЕНА, ₽</label>
            <PriceInput value={newExtra.price} onChange={v => setNewExtra(s => ({ ...s, price: v }))} placeholder="500" />
          </div>
          <div>
            <label style={labelStyle}>ТИП НАЧИСЛЕНИЯ</label>
            <select
              value={newExtra.billing}
              onChange={e => setNewExtra(s => ({ ...s, billing: e.target.value as ExtraBilling }))}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {(Object.entries(BILLING_LABEL) as [ExtraBilling, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="full-width">
            <label style={labelStyle}>ОПИСАНИЕ</label>
            <input type="text" value={newExtra.description} onChange={e => setNewExtra(s => ({ ...s, description: e.target.value }))} placeholder="2 ракетки + мячи" style={inputStyle} />
          </div>
          <button type="button" onClick={addCustomExtra} style={{ ...addRowBtnStyle, width: 'fit-content' }}>
            <Plus size={13} /> Добавить услугу
          </button>
        </div>
      </Section>

      <Section
        title="Удобства и оснащение"
        icon={Sparkles}
        count={amenities.length}
        open={openSections.amenities}
        onToggle={() => toggleSection('amenities')}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {kindAmenities.map(label => {
            const active = amenities.includes(label)
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleAmenity(label)}
                style={{
                  padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer',
                  border: active ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  background: active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#4ade80' : '#94a3b8',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text" value={customAmenity} onChange={e => setCustomAmenity(e.target.value)}
            placeholder="Своё удобство" style={{ ...inputStyle, flex: 1 }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity() } }}
          />
          <button type="button" onClick={addCustomAmenity} style={{ ...addRowBtnStyle, flexShrink: 0 }}>
            <Plus size={13} /> Добавить
          </button>
        </div>
      </Section>

      {formError && (
        <p style={{ padding: '11px 14px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, margin: '0 0 12px' }}>
          {formError}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: 14, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
            cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.7 : 1,
          }}
        >
          <Plus size={16} />
          {submitting ? 'Сохраняем...' : 'Создать площадку'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '14px 18px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: '#94a3b8', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
