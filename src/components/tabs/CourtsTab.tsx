import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Star, X } from 'lucide-react'
import { COURTS } from '../../contexts/BookingContext'
import type { Court } from '../../contexts/BookingContext'
import { CourtDetailSheet } from '../CourtDetailSheet'

const SPORTS = ['Все', 'Теннис', 'Футбол', 'Баскетбол', 'Бадминтон', 'Волейбол', 'Бассейн']

export function CourtsTab() {
  const [query, setQuery] = useState('')
  const [sport, setSport] = useState('Все')
  const [onlyFree, setOnlyFree] = useState(false)
  const [selected, setSelected] = useState<Court | null>(null)

  const filtered = COURTS.filter(c =>
    (sport === 'Все' || c.sport === sport) &&
    (!onlyFree || c.available) &&
    (c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="dashboard-page">
      {/* Заголовок + поиск в одну строку на десктопе */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          marginBottom: 18,
        }}
        className="dashboard-bookings-row"
      >
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 2, fontFamily: 'var(--font-display)' }}>
            Площадки
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{filtered.length} объектов рядом с вами</p>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск площадок..."
            style={{
              width: '100%', padding: '13px 40px', borderRadius: 12,
              background: '#222D3F', border: '1px solid rgba(255,255,255,0.08)',
              color: '#f1f5f9', fontSize: 14, outline: 'none',
              boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Фильтры */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}
      >
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {SPORTS.map(s => (
            <button key={s} onClick={() => setSport(s)} style={{
              padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', flexShrink: 0,
              fontFamily: 'inherit', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              background: sport === s ? '#22c55e' : '#222D3F',
              color: sport === s ? '#fff' : '#94a3b8',
            }}>
              {s}
            </button>
          ))}
        </div>

        <button onClick={() => setOnlyFree(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 10, border: `1px solid ${onlyFree ? '#22c55e' : 'rgba(255,255,255,0.08)'}`,
          background: onlyFree ? '#22c55e18' : 'transparent', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 12, fontWeight: 600, flexShrink: 0,
          color: onlyFree ? '#22c55e' : '#64748b', transition: 'all 0.2s',
          marginLeft: 'auto',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: onlyFree ? '#22c55e' : '#334155' }} />
          Только свободные
        </button>
      </motion.div>

      {/* Сетка карточек */}
      <div className="dashboard-courts-grid">
        {filtered.map((court, i) => (
          <motion.button
            key={court.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.4) }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(court)}
            style={{
              width: '100%', textAlign: 'left', background: '#222D3F',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18,
              padding: 0, cursor: 'pointer', overflow: 'hidden', display: 'block',
            }}
          >
            {/* Фото-баннер */}
            <div style={{ height: 150, background: court.photos[0], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 48, filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.6))' }}>{court.emoji}</span>
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: court.available ? 'rgba(34,197,94,0.85)' : 'rgba(239,68,68,0.75)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                padding: '3px 8px', borderRadius: 8,
              }}>
                {court.available ? '● Свободно' : '● Занято'}
              </div>
              <div style={{
                position: 'absolute', top: 10, left: 10,
                background: `${court.color}cc`, color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
              }}>
                {court.sport}
              </div>
            </div>

            {/* Инфо */}
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', flex: 1 }}>{court.name}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: court.color, whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
                  {court.price.toLocaleString()} ₽<span style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>/ч</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{court.rating}</span>
                  <span style={{ fontSize: 11, color: '#475569' }}>({court.reviews})</span>
                </div>
                <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#334155' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={11} color="#64748b" />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{court.location}</span>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>{court.distance}</div>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                {court.amenities.slice(0, 3).map(a => (
                  <span key={a} style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 6,
                    background: 'rgba(255,255,255,0.05)', color: '#64748b',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {a}
                  </span>
                ))}
                {court.amenities.length > 3 && (
                  <span style={{ fontSize: 10, color: '#475569', padding: '3px 4px' }}>+{court.amenities.length - 3}</span>
                )}
              </div>
            </div>
          </motion.button>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 20px', color: '#475569' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Ничего не найдено</div>
            <div style={{ fontSize: 13 }}>Попробуйте изменить фильтры</div>
          </div>
        )}
      </div>

      {selected && <CourtDetailSheet court={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
