import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, UserPlus, LogIn, KeyRound } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ParticleField } from '../components/ParticleField'
import { BackToSiteLink } from '../components/ui/BackToSiteLink'
import { AuthTransitionLoader } from '../components/ui/Loaders'

function BtnSpinner() {
  return (
    <motion.div
      style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
    />
  )
}

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

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [emailExists, setEmailExists] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [sendingCode, setSendingCode] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const { register, sendCode, verifyCodeAndLogin, isLoading } = useAuth()
  const navigate = useNavigate()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setEmailExists(false)
    const result = await register(name, email, password, phone)
    if (!result.success) {
      setEmailExists(Boolean(result.emailExists))
      setError(result.error ?? 'Ошибка регистрации')
      return
    }

    setStep('verify')
    setSendingCode(true)
    setVerifyError('')

    const sent = await sendCode(email)
    setSendingCode(false)
    if (!sent.success) {
      setVerifyError(sent.error ?? 'Не удалось отправить код. Попробуйте ещё раз.')
    }
  }

  const showOverlay = (isLoading && step === 'form') || redirecting
  const verifyBusy = isLoading || sendingCode

  async function submitCode(value: string) {
    setVerifyError('')
    if (value.trim().length !== 6 || isLoading || sendingCode) return

    const result = await verifyCodeAndLogin(email, value)
    if (result.success) {
      setRedirecting(true)
      navigate('/profile', { replace: true })
    } else {
      setVerifyError(result.error ?? 'Неверный код')
      setCode('')
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    await submitCode(code)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))', position: 'relative', background: 'linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)', boxSizing: 'border-box' }}>
      <AnimatePresence>
        {(showOverlay || redirecting) && (
          <AuthTransitionLoader
            message={redirecting ? 'Открываем профиль...' : 'Создаём аккаунт...'}
          />
        )}
      </AnimatePresence>
      <ParticleField />

      <div style={{ position: 'fixed', top: 'calc(24px + env(safe-area-inset-top, 0px))', left: 24, zIndex: 50 }}>
        <BackToSiteLink />
      </div>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <motion.div style={{ position: 'absolute', width: 500, height: 500, top: '-15%', right: '-10%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity }} />
        <motion.div style={{ position: 'absolute', width: 400, height: 400, bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 3 }} />
      </div>

      <motion.div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }} className="logo-text">BookinGo</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            {step === 'form' ? 'Создайте аккаунт бесплатно' : ''}
          </p>
        </div>

        <div style={{ background: '#1a2332', borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          {step === 'form' && (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Регистрация</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>
                Начните бронировать площадки прямо сейчас
              </p>
            </>
          )}

          <AnimatePresence initial={false}>
            {step === 'form' ? (
              <motion.form
                key="register-form"
                onSubmit={handleRegister}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>ИМЯ</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" required autoComplete="name" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (emailExists) {
                        setEmailExists(false)
                        setError('')
                      }
                    }}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>ТЕЛЕФОН</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 999 123-45-67" required autoComplete="tel" inputMode="tel" style={inputStyle} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>ПАРОЛЬ</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 6 символов" required minLength={6} autoComplete="new-password"
                      style={{ ...inputStyle, padding: '13px 48px 13px 16px' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}>
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {emailExists && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: 'rgba(251,191,36,0.08)',
                        border: '1px solid rgba(251,191,36,0.22)',
                      }}
                    >
                      <p style={{ color: '#fcd34d', fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>
                        Этот email уже зарегистрирован
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Link
                          to="/login"
                          state={{ login: email }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 6px 18px rgba(34,197,94,0.25)',
                          }}
                        >
                          <LogIn size={16} />
                          Войти
                        </Link>
                        <Link
                          to={`/forgot-password?email=${encodeURIComponent(email)}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            padding: '12px 14px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#e2e8f0',
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          <KeyRound size={16} />
                          Забыли пароль?
                        </Link>
                      </div>
                    </motion.div>
                  )}
                  {error && !emailExists && (
                    <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, margin: 0 }}>
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button type="submit" disabled={isLoading}
                  style={{ width: '100%', padding: 15, borderRadius: 12, marginTop: 4, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700, cursor: isLoading ? 'default' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(34,197,94,0.3)', opacity: isLoading ? 0.8 : 1 }}
                  whileHover={isLoading ? {} : { scale: 1.02 }} whileTap={isLoading ? {} : { scale: 0.97 }}>
                  {isLoading ? <BtnSpinner /> : <><UserPlus size={17} /><span>Создать аккаунт</span></>}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="verify-step"
                onSubmit={handleVerify}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={e => {
                    const next = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setCode(next)
                    if (next.length === 6) void submitCode(next)
                  }}
                  placeholder="000000"
                  required
                  disabled={sendingCode || verifyBusy}
                  style={{
                    ...inputStyle,
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '0.35em',
                    textAlign: 'center',
                    padding: '16px',
                  }}
                />

                <AnimatePresence>
                  {verifyError && (
                    <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, margin: 0, textAlign: 'center' }}>
                      {verifyError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>

          {step === 'form' && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginTop: 20 }}>
              Уже есть аккаунт?{' '}
              <Link to="/login" style={{ color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Войти</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
