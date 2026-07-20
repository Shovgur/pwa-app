import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, CalendarCheck, Clock, ChevronRight, Share2, Edit2, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiGetProfile, apiGetBookings, type UserProfile, type ApiBooking } from '../../lib/api'

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
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiGetProfile().catch(() => null),
      apiGetBookings().catch(() => []),
    ]).then(([p, b]) => {
      if (p) setProfile(p)
      setBookings(Array.isArray(b) ? b : [])
    }).finally(() => setLoading(false))
  }, [])

  const totalBookings = bookings.length
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : null

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
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                {loading ? <Spinner /> : (profile?.name ?? user?.name ?? '—')}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 6px' }}>
                {profile?.email ?? user?.email}
              </p>
              {profile?.phone && (
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '0 0 10px' }}>{profile.phone}</p>
              )}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.35)', padding: '4px 12px', borderRadius: 100 }}>
                <Star size={11} color="#22c55e" style={{ fill: '#22c55e' }} />
                <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>Участник</span>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            {[
              { icon: CalendarCheck, value: loading ? '—' : String(totalBookings), label: 'Броней' },
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
      </motion.div>

      {/* Меню */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
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
        style={{ width: '100%', padding: '15px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        <LogOut size={17} />
        Выйти из аккаунта
      </motion.button>
    </div>
  )
}
