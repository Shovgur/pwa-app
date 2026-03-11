import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Star, Filter, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SPORTS = ['Все', 'Теннис', 'Футбол', 'Баскетбол', 'Бадминтон', 'Волейбол', 'Бассейн']

const COURTS = [
  { id: 1, emoji: '🎾', sport: 'Теннис', name: 'Корт "Спарта"', location: 'Парк Горького, Москва', rating: 4.9, reviews: 128, price: 1500, duration: '1 ч', amenities: ['Освещение', 'Душ', 'Прокат'], color: '#22c55e', available: true, distance: '1.2 км' },
  { id: 2, emoji: '⚽', sport: 'Футбол', name: 'Поле "Олимп" 5×5', location: 'Олимпийский, Москва', rating: 4.6, reviews: 95, price: 2400, duration: '1 ч', amenities: ['Газон', 'Табло', 'Раздевалки'], color: '#3b82f6', available: true, distance: '2.4 км' },
  { id: 3, emoji: '🏀', sport: 'Баскетбол', name: 'Arena ЦСКА', location: 'Ленинградский пр., Москва', rating: 4.7, reviews: 84, price: 900, duration: '1 ч', amenities: ['Трибуны', 'Табло', 'Кафе'], color: '#f97316', available: true, distance: '3.1 км' },
  { id: 4, emoji: '🏸', sport: 'Бадминтон', name: 'Бадминтон Plaza', location: 'Сокольники, Москва', rating: 4.8, reviews: 56, price: 700, duration: '1 ч', amenities: ['Освещение', 'Прокат'], color: '#a855f7', available: false, distance: '4.5 км' },
  { id: 5, emoji: '🎾', sport: 'Теннис', name: 'Лужники — Корт 1', location: 'Лужники, Москва', rating: 5.0, reviews: 210, price: 3000, duration: '1 ч', amenities: ['Освещение', 'Душ', 'Тренер'], color: '#22c55e', available: true, distance: '5.0 км' },
  { id: 6, emoji: '🏊', sport: 'Бассейн', name: 'Aqua Sport', location: 'Измайлово, Москва', rating: 4.5, reviews: 312, price: 600, duration: '1 ч', amenities: ['50м', 'Раздевалки', 'Сауна'], color: '#f59e0b', available: true, distance: '6.3 км' },
  { id: 7, emoji: '🏐', sport: 'Волейбол', name: 'Динамо Волей', location: 'Динамо, Москва', rating: 4.4, reviews: 43, price: 1200, duration: '1 ч', amenities: ['Сетки', 'Трибуны'], color: '#06b6d4', available: true, distance: '3.8 км' },
]

export function CourtsTab() {
  const [query, setQuery] = useState('')
  const [sport, setSport] = useState('Все')
  const [onlyFree, setOnlyFree] = useState(false)
  const [selected, setSelected] = useState<typeof COURTS[0] | null>(null)
  const navigate = useNavigate()

  const filtered = COURTS.filter(c =>
    (sport === 'Все' || c.sport === sport) &&
    (!onlyFree || c.available) &&
    (c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Заголовок */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Площадки</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>{filtered.length} объектов рядом с вами</p>
      </motion.div>

      {/* Поиск */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск площадок..."
            style={{ width: '100%', padding: '13px 40px', borderRadius: 14, background: '#1a2332', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          {query && (
            <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Фильтр по спорту */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {SPORTS.map(s => (
          <button key={s} onClick={() => setSport(s)}
            style={{ padding: '8px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: sport === s ? '#22c55e' : 'rgba(255,255,255,0.06)', color: sport === s ? '#fff' : '#94a3b8' }}>
            {s}
          </button>
        ))}
      </motion.div>

      {/* Доп. фильтр */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setOnlyFree(!onlyFree)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, background: onlyFree ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)', color: onlyFree ? '#22c55e' : '#94a3b8', transition: 'all 0.2s' }}>
          <Filter size={13} /> Только свободные
        </button>
      </div>

      {/* Список */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence>
          {filtered.map((c, i) => (
            <motion.div key={c.id} className="card card-hover"
              style={{ padding: '16px', cursor: 'pointer', opacity: c.available ? 1 : 0.65 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: c.available ? 1 : 0.65, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ x: 4 }} onClick={() => setSelected(c)}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {c.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{c.name}</h3>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9' }}>{c.price} ₽</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>/ час</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} />{c.location}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>• {c.distance}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.amenities.slice(0, 2).map(a => (
                        <span key={a} style={{ fontSize: 11, background: 'rgba(255,255,255,0.07)', padding: '3px 8px', borderRadius: 100, color: '#94a3b8' }}>{a}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: '#f97316', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Star size={11} style={{ fill: '#f97316' }} /> {c.rating}
                        <span style={{ color: '#475569' }}> ({c.reviews})</span>
                      </span>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, fontWeight: 600, background: c.available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)', color: c.available ? '#22c55e' : '#f87171' }}>
                        {c.available ? 'Свободно' : 'Занято'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Модалка бронирования */}
      <AnimatePresence>
        {selected && (
          <motion.div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', padding: 0 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              style={{ width: '100%', background: '#1a2332', borderRadius: '24px 24px 0 0', padding: 24, paddingBottom: 40, maxHeight: '80vh', overflowY: 'auto' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: `${selected.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{selected.emoji}</div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>{selected.name}</h3>
                    <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{selected.location}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '14px', background: '#243354', borderRadius: 14 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{selected.price} ₽</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>/ час</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Star size={16} style={{ fill: '#f97316' }} />{selected.rating}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{selected.reviews} отзывов</div>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#06b6d4' }}>{selected.distance}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>от вас</div>
                </div>
              </div>

              <h4 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 10 }}>УДОБСТВА</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {selected.amenities.map(a => (
                  <span key={a} style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13 }}>{a}</span>
                ))}
              </div>

              <motion.button
                onClick={() => { navigate('/dashboard/bookings'); setSelected(null) }}
                disabled={!selected.available}
                style={{ width: '100%', padding: 16, borderRadius: 14, border: 'none', cursor: selected.available ? 'pointer' : 'not-allowed', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: '#fff', background: selected.available ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.1)', boxShadow: selected.available ? '0 8px 24px rgba(34,197,94,0.3)' : 'none' }}
                whileHover={selected.available ? { scale: 1.02 } : {}}
                whileTap={selected.available ? { scale: 0.97 } : {}}
              >
                {selected.available ? '📅 Забронировать' : '🔒 Площадка занята'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
