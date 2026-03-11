import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, UserPlus, Zap, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ParticleField } from '../components/ParticleField'
import { GlowOrbs } from '../components/GlowOrbs'
// Временно без variants, чтобы форма всегда была видна

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Минимум 8 символов', valid: password.length >= 8 },
    { label: 'Заглавная буква', valid: /[A-Z]/.test(password) },
    { label: 'Цифра', valid: /\d/.test(password) },
  ]

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-2 space-y-1"
    >
      {checks.map((c) => (
        <motion.div
          key={c.label}
          className="flex items-center gap-2 text-xs"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <motion.div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${c.valid ? 'bg-green-500' : 'bg-slate-700'}`}
            animate={{ scale: c.valid ? [1, 1.3, 1] : 1 }}
          >
            {c.valid && <Check size={10} className="text-white" />}
          </motion.div>
          <span className={c.valid ? 'text-green-400' : 'text-slate-500'}>{c.label}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = await register(name, email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error ?? 'Ошибка регистрации')
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #0a0a1a 100%)' }}
    >
      <ParticleField />
      <GlowOrbs />

      <motion.div
        className="relative z-10 w-full max-w-md px-4 py-8"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <motion.div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glass neon-border"
            whileHover={{ scale: 1.1, rotate: -5 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(6,182,212,0.3)',
                '0 0 40px rgba(6,182,212,0.6)',
                '0 0 20px rgba(6,182,212,0.3)',
              ],
            }}
            transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
          >
            <Zap size={28} className="text-cyan-400" />
          </motion.div>
          <h1 className="text-3xl font-black gradient-text">NEXUS</h1>
          <p className="text-slate-400 mt-1 text-sm tracking-widest uppercase">Platform</p>
        </motion.div>

        <motion.div
          className="glass rounded-3xl p-8 neon-border-cyan"
        >
          <motion.h2 className="text-2xl font-bold text-white mb-1">
            Создать аккаунт
          </motion.h2>
          <motion.p className="text-slate-400 text-sm mb-7">
            Присоединяйтесь к платформе Nexus
          </motion.p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Имя
              </label>
              <motion.input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                required
                minLength={2}
                className="w-full px-4 py-3 rounded-xl glass text-white placeholder-slate-500 outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                whileFocus={{ boxShadow: '0 0 0 2px rgba(6,182,212,0.4)' }}
              />
            </motion.div>

            <motion.div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl glass text-white placeholder-slate-500 outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                whileFocus={{ boxShadow: '0 0 0 2px rgba(6,182,212,0.4)' }}
              />
            </motion.div>

            <motion.div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Пароль
              </label>
              <div className="relative">
                <motion.input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl glass text-white placeholder-slate-500 outline-none"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  whileFocus={{ boxShadow: '0 0 0 2px rgba(6,182,212,0.4)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="px-4 py-3 rounded-xl text-red-400 text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-semibold text-white relative overflow-hidden mt-2"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)' }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.5)' }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Создаём аккаунт...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    <span>Зарегистрироваться</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <motion.p className="text-center text-slate-400 text-sm mt-6">
            Уже есть аккаунт?{' '}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Войти
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  )
}
