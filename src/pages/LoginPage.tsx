import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ParticleField } from '../components/ParticleField'

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
    <div className="relative min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 100%)' }}>

      {/* Частицы — всегда в фоне */}
      <ParticleField />

      {/* Орб фиолетовый */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500, top: '-15%', left: '-10%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400, bottom: '-10%', right: '-5%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      {/* Форма */}
      <motion.div
        className="relative w-full max-w-sm"
        style={{ zIndex: 10 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Лого */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'rgba(124,58,237,0.2)',
              border: '1px solid rgba(124,58,237,0.5)',
              boxShadow: '0 0 25px rgba(124,58,237,0.4)',
            }}
            animate={{ boxShadow: ['0 0 20px rgba(124,58,237,0.3)', '0 0 40px rgba(124,58,237,0.6)', '0 0 20px rgba(124,58,237,0.3)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Zap size={28} className="text-purple-400" />
          </motion.div>
          <h1 className="text-3xl font-black gradient-text">NEXUS</h1>
          <p className="text-slate-500 text-xs mt-1 tracking-widest uppercase">Platform</p>
        </div>

        {/* Карточка */}
        <div className="glass rounded-3xl p-6 neon-border">
          <h2 className="text-xl font-bold text-white mb-1">Добро пожаловать</h2>
          <p className="text-slate-400 text-sm mb-6">Войдите в свой аккаунт</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Пароль</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl text-white text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {isLoading ? (
                <motion.div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <><LogIn size={16} /><span>Войти</span></>
              )}
            </motion.button>
          </form>

          <button
            onClick={() => { setEmail('demo@nexus.app'); setPassword('demo123') }}
            className="w-full py-2.5 mt-3 rounded-xl text-sm text-slate-400 glass-hover"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            Использовать demo аккаунт
          </button>

          <p className="text-center text-slate-500 text-sm mt-5">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-purple-400 font-medium">Зарегистрироваться</Link>
          </p>
        </div>

        <p className="text-center text-slate-700 text-xs mt-5">© 2026 Nexus Platform</p>
      </motion.div>
    </div>
  )
}
