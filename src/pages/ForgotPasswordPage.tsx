import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, ArrowLeft, CheckCircle2, Mail, Lock } from 'lucide-react'
import { ParticleField } from '../components/ParticleField'
import { SiteLegalBar } from '../components/layout/SiteLegalBar'
import { BackToSiteLink } from '../components/ui/BackToSiteLink'
import { FieldError, errorInputStyle } from '../components/ui/FieldError'
import { useFieldErrors } from '../hooks/useFieldErrors'
import { apiForgotPassword, apiResetPassword } from '../lib/api'

type Step = 'email' | 'code' | 'password' | 'done'

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

const primaryBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: 15,
  borderRadius: 12,
  marginTop: 4,
  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
  border: 'none',
  color: '#fff',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
}

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(searchParams.get('email') ?? '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [resendAt, setResendAt] = useState(0)
  const { errors, handleInvalid, clearError, setErrors } = useFieldErrors()

  async function sendCode(targetEmail: string) {
    if (Date.now() < resendAt) {
      const sec = Math.ceil((resendAt - Date.now()) / 1000)
      setFormError(`Подождите ${sec} сек. перед повторной отправкой`)
      return
    }
    setBusy(true)
    setFormError('')
    try {
      await apiForgotPassword(targetEmail)
      setResendAt(Date.now() + 45_000)
      setStep('code')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Не удалось отправить код')
    } finally {
      setBusy(false)
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed.includes('@')) {
      setErrors({ email: 'Укажите корректный email' })
      return
    }
    await sendCode(trimmed)
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed.length < 4) {
      setErrors({ code: 'Введите код из письма' })
      return
    }
    setFormError('')
    setStep('password')
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (password.length < 6) nextErrors.password = 'Пароль должен быть не короче 6 символов'
    if (password !== password2) nextErrors.password2 = 'Пароли не совпадают'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setBusy(true)
    setFormError('')
    try {
      await apiResetPassword(email.trim(), code.trim(), password)
      setStep('done')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось сменить пароль'
      if (/код|code/i.test(message)) {
        setFormError(message)
        setStep('code')
      } else {
        setFormError(message)
      }
    } finally {
      setBusy(false)
    }
  }

  const titles: Record<Step, string> = {
    email: 'Восстановление пароля',
    code: 'Код из письма',
    password: 'Новый пароль',
    done: 'Пароль обновлён',
  }

  const subtitles: Record<Step, string> = {
    email: 'Укажите email аккаунта — отправим код для сброса пароля.',
    code: `Мы отправили код на ${email.trim()}. Введите его ниже.`,
    password: 'Придумайте новый пароль для входа.',
    done: 'Теперь можно войти с новым паролем.',
  }

  return (
    <div style={{ minHeight: '100dvh', height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))', position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)', boxSizing: 'border-box' }}>
      <ParticleField />

      <div style={{ position: 'fixed', top: 'calc(24px + env(safe-area-inset-top, 0px))', left: 24, zIndex: 50 }}>
        <BackToSiteLink />
      </div>

      <motion.div style={{ width: '100%', maxWidth: 420, maxHeight: '100%', overflowY: 'auto', position: 'relative', zIndex: 10 }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div style={{ background: '#1a2332', borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {step === 'done' ? <CheckCircle2 size={18} color="#22c55e" /> : <KeyRound size={18} color="#fbbf24" />}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{titles[step]}</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
            {subtitles[step]}
          </p>

          {formError && (
            <div style={{ marginBottom: 14, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5', fontSize: 13 }}>
              {formError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 'email' && (
              <motion.form
                key="email"
                onSubmit={handleEmailSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>EMAIL</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearError('email'); setFormError('') }}
                      onInvalid={handleInvalid('email')}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      disabled={busy}
                      style={{ ...inputStyle, paddingLeft: 40, ...errorInputStyle(Boolean(errors.email)) }}
                    />
                  </div>
                  <FieldError message={errors.email} />
                </div>

                <motion.button
                  type="submit"
                  disabled={busy}
                  style={{ ...primaryBtnStyle, opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer' }}
                  whileHover={busy ? undefined : { scale: 1.02 }}
                  whileTap={busy ? undefined : { scale: 0.97 }}
                >
                  {busy ? 'Отправляем…' : 'Отправить код'}
                </motion.button>
              </motion.form>
            )}

            {step === 'code' && (
              <motion.form
                key="code"
                onSubmit={handleCodeSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>КОД ИЗ ПИСЬМА</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={e => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      clearError('code')
                      setFormError('')
                    }}
                    onInvalid={handleInvalid('code')}
                    placeholder="123456"
                    required
                    maxLength={6}
                    disabled={busy}
                    style={{
                      ...inputStyle,
                      letterSpacing: 6,
                      fontFamily: 'monospace',
                      fontSize: 20,
                      textAlign: 'center',
                      ...errorInputStyle(Boolean(errors.code)),
                    }}
                  />
                  <FieldError message={errors.code} />
                </div>

                <motion.button
                  type="submit"
                  disabled={busy || code.trim().length < 4}
                  style={{ ...primaryBtnStyle, opacity: busy || code.trim().length < 4 ? 0.7 : 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Далее
                </motion.button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => sendCode(email.trim())}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'center', padding: 0 }}
                >
                  Не пришло письмо? <span style={{ color: '#22c55e', fontWeight: 600 }}>Отправить код снова</span>
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { setStep('email'); setCode(''); setFormError('') }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0 }}
                >
                  <ArrowLeft size={14} />
                  Изменить email
                </button>
              </motion.form>
            )}

            {step === 'password' && (
              <motion.form
                key="password"
                onSubmit={handlePasswordSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>НОВЫЙ ПАРОЛЬ</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); clearError('password'); setFormError('') }}
                      onInvalid={handleInvalid('password')}
                      placeholder="Минимум 6 символов"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      disabled={busy}
                      style={{ ...inputStyle, paddingLeft: 40, ...errorInputStyle(Boolean(errors.password)) }}
                    />
                  </div>
                  <FieldError message={errors.password} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 7, letterSpacing: 0.5 }}>ПОВТОРИТЕ ПАРОЛЬ</label>
                  <input
                    type="password"
                    value={password2}
                    onChange={e => { setPassword2(e.target.value); clearError('password2'); setFormError('') }}
                    onInvalid={handleInvalid('password2')}
                    placeholder="Ещё раз"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={busy}
                    style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.password2)) }}
                  />
                  <FieldError message={errors.password2} />
                </div>

                <motion.button
                  type="submit"
                  disabled={busy}
                  style={{ ...primaryBtnStyle, opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer' }}
                  whileHover={busy ? undefined : { scale: 1.02 }}
                  whileTap={busy ? undefined : { scale: 0.97 }}
                >
                  {busy ? 'Сохраняем…' : 'Сохранить пароль'}
                </motion.button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { setStep('code'); setFormError('') }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0 }}
                >
                  <ArrowLeft size={14} />
                  Назад к коду
                </button>
              </motion.form>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <Link
                  to={email ? `/login?login=${encodeURIComponent(email.trim())}` : '/login'}
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
              </motion.div>
            )}
          </AnimatePresence>

          {step !== 'done' && (
            <Link
              to="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 20, color: '#64748b', fontSize: 13, textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              Назад ко входу
            </Link>
          )}
        </div>
      </motion.div>
      <SiteLegalBar anchored />
    </div>
  )
}
