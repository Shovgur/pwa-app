import { useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, MapPin, Clock, Star, TrendingUp, Users, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBookings, COURTS } from '../../contexts/BookingContext'
import { useNavigate } from 'react-router-dom'
import { CourtDetailSheet } from '../CourtDetailSheet'
import type { Court } from '../../contexts/BookingContext'

const POPULAR = COURTS.filter(c => c.available).slice(0, 3)

export function HomeTab() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const navigate = useNavigate()
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)

  const upcoming = bookings.filter(b => b.status === 'upcoming')
  const completed = bookings.filter(b => b.status === 'completed')
  const totalMinutes = completed.reduce((sum, b) => sum + b.duration, 0)

  const STATS = [
    { icon: CalendarCheck, label: 'Всего бронирований', value: String(bookings.length), color: '#22c55e' },
    { icon: Clock, label: 'Часов сыграно', value: String(Math.round(totalMinutes / 60)), color: '#3b82f6' },
    { icon: Star, label: 'Предстоящих', value: String(upcoming.length), color: '#f97316' },
    { icon: Users, label: 'Завершённых', value: String(completed.length), color: '#a855f7' },
  ]

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
      {upcoming[0] ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', background: `linear-gradient(135deg, ${upcoming[0].court.color}cc 0%, ${upcoming[0].court.color}88 100%)`, padding: 20, position: 'relative', boxShadow: `0 8px 32px ${upcoming[0].court.color}40`, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/bookings')}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  БЛИЖАЙШЕЕ
                </span>
                <span style={{ fontSize: 28 }}>{upcoming[0].court.emoji}</span>
              </div>
              <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>{upcoming[0].court.name}</h3>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {upcoming[0].date}, {upcoming[0].time}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> {upcoming[0].court.location}
                </span>
              </div>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{upcoming[0].price.toLocaleString()} ₽</span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 100, color: '#fff', fontSize: 12, fontWeight: 600 }}>Подтверждено ✓</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', padding: 24, textAlign: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/courts')}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Нет предстоящих броней</div>
            <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>Забронировать площадку →</div>
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
              onClick={() => setSelectedCourt(c)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: c.photos[0], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {c.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={11} /> {c.location}
                    </span>
                    <span style={{ fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Star size={11} fill="#f59e0b" color="#f59e0b" /> {c.rating}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.color }}>{c.price.toLocaleString()} ₽</div>
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

      {/* Детальный лист площадки */}
      {selectedCourt && <CourtDetailSheet court={selectedCourt} onClose={() => setSelectedCourt(null)} />}
    </div>
  )
}
