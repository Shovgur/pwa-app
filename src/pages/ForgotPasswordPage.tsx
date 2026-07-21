import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, ArrowLeft } from 'lucide-react'
import { ParticleField } from '../components/ParticleField'
import { BackToSiteLink } from '../components/ui/BackToSiteLink'

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

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))', position: 'relative', background: 'linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)', boxSizing: 'border-box' }}>
      <ParticleField />

      <div style={{ position: 'fixed', top: 'calc(24px + env(safe-area-inset-top, 0px))', left: 24, zIndex: 50 }}>
        <BackToSiteLink />
      </div>

      <motion.div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div style={{ background: '#1a2332', borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={18} color="#fbbf24" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>Восстановление пароля</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            {submitted
              ? 'Восстановление пароля скоро будет доступно. Пока войдите в аккаунт, если помните пароль.'
              : 'Укажите email — мы отправим ссылку для сброса пароля, когда функция будет включена.'}
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>

              <motion.button
                type="submit"
                style={{ width: '100%', padding: 15, borderRadius: 12, marginTop: 4, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Отправить ссылку
              </motion.button>
            </form>
          ) : (
            <Link
              to={email ? `/login?login=${encodeURIComponent(email)}` : '/login'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Перейти ко входу
            </Link>
          )}

          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, color: '#64748b', fontSize: 13, textDecoration: 'none' }}
          >
            <ArrowLeft size={14} />
            Назад ко входу
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
