import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, CalendarCheck, Clock, ChevronRight, Share2, Edit2, LogOut, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBookings } from '../../contexts/BookingContext'
import { useNavigate } from 'react-router-dom'
import { apiGetProfile, type UserProfile } from '../../lib/api'

const MENU = [
  { icon: Edit2, label: 'Редактировать профиль', color: '#22c55e' },
  { icon: Share2, label: 'Пригласить друга', color: '#3b82f6' },
]

function Spinner() {
  return (
    <motion.div
      style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#22c55e', display: 'inline-block' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function ProfileTab() {
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    apiGetProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [user])

  const totalBookings = bookings.length
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming').length
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 2, fontFamily: 'var(--font-display)' }}>
          Профиль
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Управление аккаунтом и личными данными</p>
      </motion.div>

      <div className="dashboard-profile-layout">
        {/* Левая колонка — карточка профиля */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, #1a3a2a, #162d40)', borderRadius: 24, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(34,197,94,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(59,130,246,0.08)' }} />

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
              <motion.div
                style={{ width: 76, height: 76, borderRadius: 22, background: 'linear-gradient(135deg, #22c55e, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 8px 20px rgba(34,197,94,0.25)' }}
                whileHover={{ scale: 1.05, rotate: 3 }}
              >
                {user?.avatar}
              </motion.div>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                  {loading ? <Spinner /> : (profile?.name ?? user?.name ?? '—')}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 6px' }}>
                  {profile?.email ?? user?.email}
                </p>
                {profile?.phone ?? user?.phone ? (
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '0 0 10px' }}>{profile?.phone ?? user?.phone}</p>
                ) : null}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.35)', padding: '4px 12px', borderRadius: 100 }}>
                  <Star size={11} color="#22c55e" style={{ fill: '#22c55e' }} />
                  <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>Участник</span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
              {[
                { icon: CalendarCheck, value: String(totalBookings), label: 'Всего броней' },
                { icon: Clock, value: memberSince ?? '—', label: 'С нами с', small: true },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 8px' }}>
                    <Icon size={16} color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }} />
                    <div style={{ fontSize: s.small ? 12 : 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <motion.button
            onClick={() => { logout(); navigate('/login') }}
            style={{ width: '100%', marginTop: 16, padding: '15px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <LogOut size={17} />
            Выйти из аккаунта
          </motion.button>
        </motion.div>

        {/* Правая колонка — статистика и меню */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: CalendarCheck, value: totalBookings, label: 'Всего броней', color: '#22c55e' },
              { icon: Clock, value: upcomingBookings, label: 'Предстоящих', color: '#3b82f6' },
              { icon: TrendingUp, value: `${totalBookings * 15}%`, label: 'Активность', color: '#f97316' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="card" style={{ padding: '18px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={17} color={s.color} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                </div>
              )
            })}
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {MENU.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.label} className="card-hover"
                  style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', borderBottom: i < MENU.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  whileHover={{ x: 4 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={item.color} />
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{item.label}</span>
                  <ChevronRight size={16} color="#475569" />
                </motion.div>
              )
            })}
          </div>

          {bookings.length > 0 && (
            <div className="card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>Последние бронирования</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookings.slice(0, 3).map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: b.court.photos[0], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {b.court.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.court.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.date}, {b.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
