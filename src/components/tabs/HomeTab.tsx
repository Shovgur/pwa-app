import { motion } from 'framer-motion'
import { CalendarCheck, MapPin, Clock, Star, TrendingUp, Users, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const UPCOMING = [
  { id: 1, sport: '🎾', name: 'Теннисный корт №3', location: 'Лужники, Москва', date: 'Сегодня', time: '18:00 — 19:30', price: 1800, color: '#22c55e', status: 'confirmed' },
  { id: 2, sport: '⚽', name: 'Футбольное поле 5×5', location: 'Олимпийский, Москва', date: 'Завтра', time: '10:00 — 11:00', price: 2400, color: '#3b82f6', status: 'confirmed' },
]

const POPULAR = [
  { id: 1, sport: '🎾', name: 'Корт "Спарта"', rating: 4.9, reviews: 128, price: 1500, location: 'Парк Горького', color: '#22c55e', available: true },
  { id: 2, sport: '🏀', name: 'Баскетбол Arena', rating: 4.7, reviews: 84, price: 900, location: 'ЦСКА, Москва', color: '#f97316', available: true },
  { id: 3, sport: '🏸', name: 'Бадминтон Plaza', rating: 4.8, reviews: 56, price: 700, location: 'Сокольники', color: '#a855f7', available: false },
]

const STATS = [
  { icon: CalendarCheck, label: 'Всего бронирований', value: '24', color: '#22c55e' },
  { icon: Clock, label: 'Часов сыграно', value: '48', color: '#3b82f6' },
  { icon: Star, label: 'Средний рейтинг', value: '4.8', color: '#f97316' },
  { icon: Users, label: 'Партнёров', value: '12', color: '#a855f7' },
]

export function HomeTab() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер'

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Хедер */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>{greeting} 👋</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>{user?.name?.split(' ')[0]}</h1>
          </div>
          <motion.div
            style={{ padding: '8px 16px', borderRadius: 100, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/dashboard/bookings')}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            animate={{ boxShadow: ['0 0 0 rgba(34,197,94,0)', '0 0 12px rgba(34,197,94,0.3)', '0 0 0 rgba(34,197,94,0)'] }}
            transition={{ boxShadow: { duration: 2.5, repeat: Infinity } }}
          >
            <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>+ Забронировать</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Ближайшее бронирование */}
      {UPCOMING[0] && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', padding: 20, position: 'relative', boxShadow: '0 8px 32px rgba(22,163,74,0.25)' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  БЛИЖАЙШЕЕ
                </span>
                <span style={{ fontSize: 28 }}>{UPCOMING[0].sport}</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{UPCOMING[0].name}</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {UPCOMING[0].date}, {UPCOMING[0].time}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {UPCOMING[0].location}
                </span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{UPCOMING[0].price} ₽</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 100, color: '#fff', fontSize: 12, fontWeight: 600 }}>Подтверждено ✓</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Статистика */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {STATS.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div key={s.label} className="card" style={{ padding: '16px' }}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ scale: 1.02 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={s.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Популярные площадки */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Популярные площадки</h2>
          <button onClick={() => navigate('/dashboard/courts')}
            style={{ background: 'none', border: 'none', color: '#22c55e', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
            Все <ChevronRight size={15} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {POPULAR.map((c, i) => (
            <motion.div key={c.id} className="card card-hover"
              style={{ padding: '14px 16px', cursor: 'pointer' }}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.07 }}
              whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/courts')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {c.sport}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                    {!c.available && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 6px', borderRadius: 100, flexShrink: 0 }}>Занято</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={11} /> {c.location}
                    </span>
                    <span style={{ fontSize: 12, color: '#f97316', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Star size={11} style={{ fill: '#f97316' }} /> {c.rating}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{c.price} ₽</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>/ час</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Быстрый спорт */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>Найти по виду спорта</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { emoji: '🎾', label: 'Теннис', color: '#22c55e' },
            { emoji: '⚽', label: 'Футбол', color: '#3b82f6' },
            { emoji: '🏀', label: 'Баскетбол', color: '#f97316' },
            { emoji: '🏸', label: 'Бадминтон', color: '#a855f7' },
            { emoji: '🏐', label: 'Волейбол', color: '#06b6d4' },
            { emoji: '🏊', label: 'Бассейн', color: '#f59e0b' },
          ].map((s, i) => (
            <motion.div key={s.label} className="card card-hover"
              style={{ padding: '14px 10px', textAlign: 'center', cursor: 'pointer' }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 + i * 0.04 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/courts')}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{s.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Тренд активности */}
      <motion.div className="card" style={{ padding: '16px 20px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <TrendingUp size={18} color="#22c55e" />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Активность за неделю</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
          {[2, 5, 3, 7, 4, 6, 8].map((v, i) => {
            const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
            const px = Math.round((v / 8) * 48)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <motion.div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: i === 6 ? '#22c55e' : 'rgba(34,197,94,0.25)', minHeight: 4, height: px }}
                  initial={{ height: 0 }} animate={{ height: px }} transition={{ delay: 0.55 + i * 0.05, duration: 0.4 }} />
                <span style={{ fontSize: 9, color: '#475569' }}>{days[i]}</span>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
