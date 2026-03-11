import { motion } from 'framer-motion'
import { Star, CalendarCheck, Clock, Trophy, Edit2, ChevronRight, Share2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const SPORTS_PREF = [
  { emoji: '🎾', label: 'Теннис', sessions: 12, color: '#22c55e' },
  { emoji: '⚽', label: 'Футбол', sessions: 8, color: '#3b82f6' },
  { emoji: '🏀', label: 'Баскетбол', sessions: 4, color: '#f97316' },
]

const ACHIEVEMENTS = [
  { icon: '🏆', title: 'Активный игрок', desc: '10+ бронирований', earned: true },
  { icon: '⚡', title: 'Быстрое бронирование', desc: 'Забронировал за 1 мин', earned: true },
  { icon: '🎯', title: 'Постоянный клиент', desc: 'Посетил 5 разных площадок', earned: false },
  { icon: '⭐', title: 'Топ-игрок', desc: 'Рейтинг 5.0', earned: false },
]

const MENU = [
  { icon: Edit2, label: 'Редактировать профиль', color: '#22c55e' },
  { icon: Star, label: 'Избранные площадки', color: '#f97316' },
  { icon: Share2, label: 'Пригласить друга', color: '#3b82f6' },
]

export function ProfileTab() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Профиль хедер */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ background: 'linear-gradient(135deg, #1a3a2a, #162d40)', borderRadius: 24, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(34,197,94,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(59,130,246,0.08)' }} />

          <div style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'center' }}>
            <motion.div
              style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg, #22c55e, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 8px 20px rgba(34,197,94,0.25)' }}
              whileHover={{ scale: 1.05, rotate: 3 }}
            >
              {user?.avatar}
            </motion.div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{user?.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 10px' }}>{user?.email}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.35)', padding: '4px 12px', borderRadius: 100 }}>
                <Star size={11} color="#22c55e" style={{ fill: '#22c55e' }} />
                <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>4.8 рейтинг</span>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 20 }}>
            {[
              { icon: CalendarCheck, value: '24', label: 'Брони' },
              { icon: Clock, value: '48ч', label: 'Сыграно' },
              { icon: Trophy, value: '2', label: 'Награды' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 8px' }}>
                  <Icon size={16} color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }} />
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Любимые виды спорта */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Любимые виды спорта</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SPORTS_PREF.map((s, i) => (
            <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{s.label}</span>
                    <span style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.sessions} сессий</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <motion.div style={{ height: '100%', borderRadius: 5, background: s.color }}
                      initial={{ width: 0 }} animate={{ width: `${(s.sessions / 12) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Достижения */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Достижения</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ACHIEVEMENTS.map((a, i) => (
            <motion.div key={a.title} className="card"
              style={{ padding: '14px', opacity: a.earned ? 1 : 0.45 }}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: a.earned ? 1 : 0.45, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.06 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{a.desc}</div>
              {a.earned && <div style={{ marginTop: 6, fontSize: 10, color: '#22c55e', fontWeight: 700 }}>✓ ПОЛУЧЕНО</div>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Меню */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {MENU.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div key={item.label} className="card-hover"
                style={{ padding: '15px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', borderBottom: i < MENU.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                whileHover={{ x: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={17} color={item.color} />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{item.label}</span>
                <ChevronRight size={16} color="#475569" />
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Выход */}
      <motion.button
        onClick={() => { logout(); navigate('/login') }}
        style={{ width: '100%', padding: '15px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
      >
        Выйти из аккаунта
      </motion.button>
    </div>
  )
}
