import { motion } from 'framer-motion'
import { LogOut, User, Mail, Phone, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ParticleField } from '../components/ParticleField'

export function ProfilePage() {
  const { user, logout, isLoading } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const avatar = user?.name ? user.name.trim().slice(0, 2).toUpperCase() : '?'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', background: 'linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)', position: 'relative', boxSizing: 'border-box' }}>
      <ParticleField />

      {/* Орбы */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <motion.div style={{ position: 'absolute', width: 500, height: 500, top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 14, repeat: Infinity }} />
        <motion.div style={{ position: 'absolute', width: 400, height: 400, bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 4 }} />
      </div>

      <motion.div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>

        {/* Аватар + имя */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {isLoading ? (
            <motion.div style={{ width: 80, height: 80, borderRadius: 26, background: 'rgba(255,255,255,0.06)', margin: '0 auto 12px' }}
              animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} />
          ) : (
            <motion.div
              style={{ width: 80, height: 80, borderRadius: 26, background: 'linear-gradient(135deg, #22c55e, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              {avatar}
            </motion.div>
          )}
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
            {user?.name ?? '—'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Ваш профиль BookinGo</p>
        </div>

        {/* Карточка с данными */}
        <div style={{ background: '#1a2332', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', overflow: 'hidden', marginBottom: 16 }}>
          {[
            { icon: User,   label: 'Имя',    value: user?.name  ?? '—' },
            { icon: Mail,   label: 'Email',  value: user?.email ?? '—' },
            { icon: Phone,  label: 'Телефон', value: user?.phone ?? 'Не указан' },
            { icon: Shield, label: 'ID',      value: user?.id ? `#${user.id}` : '—' },
          ].map((row, i, arr) => {
            const Icon = row.icon
            return (
              <div key={row.label} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color="#22c55e" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 2, fontWeight: 600, letterSpacing: 0.3 }}>{row.label.toUpperCase()}</div>
                  <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 500 }}>{row.value}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Кнопка выход */}
        <motion.button
          onClick={handleLogout}
          style={{ width: '100%', padding: '15px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.07)', color: '#f87171', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
        >
          <LogOut size={17} />
          Выйти из аккаунта
        </motion.button>
      </motion.div>
    </div>
  )
}
