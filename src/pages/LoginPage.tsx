import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ParticleField } from '../components/ParticleField'

const SPORTS = ['⚽', '🎾', '🏀', '🏐', '🏸', '🏊']

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (result.success) navigate('/dashboard')
    else setError(result.error ?? 'Ошибка входа')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', position: 'relative',
      background: 'linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)',
    }}>
      <ParticleField />

      {/* Орбы */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <motion.div style={{ position: 'absolute', width: 600, height: 600, top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity }} />
        <motion.div style={{ position: 'absolute', width: 400, height: 400, bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 3 }} />
      </div>

      {/* Левая панель — только на десктопе */}
      <div className="hidden lg:flex" style={{ width: '45%', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', position: 'relative', zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>SportBook</span>
          </div>
          <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
            Бронируйте<br />
            <span className="gradient-text">спортивные</span><br />
            площадки
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 48, maxWidth: 400 }}>
            Тысячи теннисных кортов, футбольных полей, баскетбольных площадок и других объектов по всему миру — всё в одном приложении.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {SPORTS.map((s, i) => (
              <motion.div key={i} style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}
                animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}>
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Правая панель — форма */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', zIndex: 10 }}>
        <motion.div
          style={{ width: '100%', maxWidth: 420 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Лого — только мобилка */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>SportBook</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 13 }}>Бронирование спортивных площадок</p>
          </div>

          {/* Карточка */}
          <div style={{ background: '#1a2332', borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Вход в аккаунт</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Войдите чтобы управлять бронированиями</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: 0.5 }}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: '#243354', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: 0.5 }}>ПАРОЛЬ</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    style={{ width: '100%', padding: '14px 48px 14px 16px', borderRadius: 12, background: '#243354', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, margin: 0 }}>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button type="submit" disabled={isLoading}
                style={{ width: '100%', padding: 15, borderRadius: 12, marginTop: 4, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: isLoading ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                {isLoading
                  ? <motion.div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                  : <><LogIn size={17} /><span>Войти</span></>}
              </motion.button>
            </form>

            <button onClick={() => { setEmail('demo@nexus.app'); setPassword('demo123') }}
              style={{ width: '100%', padding: '12px', marginTop: 10, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Использовать demo аккаунт
            </button>

            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 20 }}>
              Нет аккаунта?{' '}
              <Link to="/register" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Зарегистрироваться</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
