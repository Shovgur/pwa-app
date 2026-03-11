import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, Clock, MapPin, X, CheckCircle2, AlertCircle } from 'lucide-react'

const BOOKINGS = [
  { id: 1, emoji: '🎾', name: 'Корт "Спарта"', location: 'Парк Горького', date: '11 марта', time: '18:00 — 19:30', price: 2250, status: 'upcoming', color: '#22c55e' },
  { id: 2, emoji: '⚽', name: 'Поле "Олимп" 5×5', location: 'Олимпийский', date: '15 марта', time: '10:00 — 11:00', price: 2400, status: 'upcoming', color: '#3b82f6' },
  { id: 3, emoji: '🏀', name: 'Arena ЦСКА', location: 'Ленинградский пр.', date: '5 марта', time: '20:00 — 21:00', price: 900, status: 'completed', color: '#f97316' },
  { id: 4, emoji: '🏸', name: 'Бадминтон Plaza', location: 'Сокольники', date: '28 февр.', time: '12:00 — 13:00', price: 700, status: 'completed', color: '#a855f7' },
  { id: 5, emoji: '🎾', name: 'Лужники — Корт 1', location: 'Лужники', date: '20 февр.', time: '09:00 — 10:00', price: 3000, status: 'cancelled', color: '#64748b' },
]

const STATUS = {
  upcoming: { label: 'Предстоит', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CalendarCheck },
  completed: { label: 'Завершено', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: CheckCircle2 },
  cancelled: { label: 'Отменено', color: '#f87171', bg: 'rgba(239,68,68,0.12)', icon: AlertCircle },
}

export function BookingsTab() {
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')

  const filtered = BOOKINGS.filter(b => b.status === tab)
  const upcoming = BOOKINGS.filter(b => b.status === 'upcoming')
  const totalSpent = BOOKINGS.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Мои бронирования</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Управляйте всеми бронированиями</p>
      </motion.div>

      {/* Сводка */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#22c55e' }}>{upcoming.length}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Предстоящих</div>
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9' }}>{totalSpent.toLocaleString()} ₽</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Потрачено всего</div>
          </div>
        </div>
      </motion.div>

      {/* Вкладки */}
      <div style={{ display: 'flex', gap: 8, background: '#1a2332', borderRadius: 14, padding: 4 }}>
        {(['upcoming', 'completed', 'cancelled'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '9px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: tab === t ? STATUS[t].color : 'transparent', color: tab === t ? '#fff' : '#64748b' }}>
            {STATUS[t].label}
          </button>
        ))}
      </div>

      {/* Список */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <p style={{ color: '#64748b', fontSize: 15 }}>Нет бронирований</p>
            </motion.div>
          ) : (
            filtered.map((b, i) => {
              const statusConf = STATUS[b.status as keyof typeof STATUS]
              const StatusIcon = statusConf.icon
              return (
                <motion.div key={b.id} className="card"
                  style={{ padding: '16px', borderLeft: `3px solid ${statusConf.color}` }}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: i * 0.07 }} layout>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 15, background: `${b.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {b.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{b.name}</h3>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', flexShrink: 0 }}>{b.price.toLocaleString()} ₽</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {b.date}, {b.time}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> {b.location}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, fontWeight: 600, background: statusConf.bg, color: statusConf.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <StatusIcon size={11} /> {statusConf.label}
                        </span>
                        {b.status === 'upcoming' && (
                          <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <X size={11} /> Отменить
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
