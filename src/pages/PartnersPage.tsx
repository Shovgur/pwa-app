import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Percent, Zap, BarChart3,
  CheckCircle2, Handshake, Send,
} from 'lucide-react'
import { ParticleField } from '../components/ParticleField'
import { BackToSiteLink } from '../components/ui/BackToSiteLink'
import { SeoHead } from '../components/SeoHead'
import { FieldError, errorInputStyle } from '../components/ui/FieldError'
import { useFieldErrors } from '../hooks/useFieldErrors'
import { apiApplyPartner, type PartnerApplicationPayload } from '../lib/api'

const VENUE_TYPES = ['Бассейн', 'Футбольное поле', 'Лофт', 'Картинг', 'Другое']

const BENEFITS = [
  {
    icon: Users,
    title: 'Новые клиенты',
    desc: 'Мы привлекаем трафик на вашу площадку из каталога и рекламы BookinGo',
    color: '#22c55e',
  },
  {
    icon: Percent,
    title: 'Прозрачная комиссия',
    desc: 'Платите только за результат — без абонплаты и скрытых платежей',
    color: '#3b82f6',
  },
  {
    icon: Zap,
    title: 'Простое подключение',
    desc: 'Без сложной интеграции — заполните заявку, и мы всё настроим сами',
    color: '#f97316',
  },
  {
    icon: BarChart3,
    title: 'Аналитика',
    desc: 'Видите сколько клиентов пришло от нас и сколько вы на этом заработали',
    color: '#a855f7',
  },
]

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: 7,
  letterSpacing: 0.5,
}

const EMPTY_FORM: PartnerApplicationPayload = {
  venueName: '',
  venueType: '',
  city: '',
  contactName: '',
  phone: '',
  email: '',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

function BtnSpinner() {
  return (
    <motion.div
      style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function PartnersPage() {
  const [form, setForm] = useState<PartnerApplicationPayload>(EMPTY_FORM)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const { errors, handleInvalid, clearError, resetErrors } = useFieldErrors()

  function update<K extends keyof PartnerApplicationPayload>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    clearError(key)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await apiApplyPartner(form)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить заявку. Попробуйте ещё раз.')
      setStatus('error')
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM)
    setStatus('idle')
    setError('')
    resetErrors()
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)' }}>
      <SeoHead
        title="Стать партнёром BookinGo"
        description="Разместите свою площадку на BookinGo и привлекайте новых клиентов без затрат на рекламу. Комиссия только за реальных клиентов."
        path="/partners"
      />
      <ParticleField />

      <div style={{ position: 'fixed', top: 'calc(24px + env(safe-area-inset-top, 0px))', left: 24, zIndex: 50 }}>
        <BackToSiteLink />
      </div>

      {/* Орбы */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        <motion.div style={{ position: 'absolute', width: 600, height: 600, top: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 12, repeat: Infinity }} />
        <motion.div style={{ position: 'absolute', width: 400, height: 400, bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)', filter: 'blur(80px)', borderRadius: '50%' }}
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 10, repeat: Infinity, delay: 3 }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, padding: 'calc(96px + env(safe-area-inset-top, 0px)) 24px 80px' }}>
        <div className="site-container" style={{ maxWidth: 1080, margin: '0 auto', padding: 0 }}>

          {/* HERO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 100, marginBottom: 20,
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            }}>
              <Handshake size={14} color="#22c55e" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>Партнёрская программа</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: 16,
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}>
              Разместите свою площадку<br />на <span className="gradient-text">BookinGo</span>
            </h1>

            <p style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', marginBottom: 10, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              Привлекайте новых клиентов без затрат на рекламу
            </p>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
              Мы берём комиссию только за реальных клиентов. Вы ничего не платите заранее.
            </p>
          </motion.div>

          {/* ПРЕИМУЩЕСТВА */}
          <div className="partners-benefits-grid" style={{ marginBottom: 64 }}>
            {BENEFITS.map((b, i) => {
              const Icon = b.icon
              return (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  whileHover={{ y: -3 }}
                  style={{
                    background: '#1a2332',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    padding: '24px 22px',
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: `${b.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <Icon size={22} color={b.color} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{b.title}</h3>
                  <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{b.desc}</p>
                </motion.div>
              )
            })}
          </div>

          {/* ФОРМА ЗАЯВКИ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{
              maxWidth: 680,
              margin: '0 auto',
              background: '#1a2332',
              borderRadius: 24,
              padding: '36px 32px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            }}
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: 'spring' }}
                  style={{ textAlign: 'center', padding: '16px 0' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                    style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 16px 40px rgba(34,197,94,0.35)',
                    }}
                  >
                    <CheckCircle2 size={36} color="#fff" />
                  </motion.div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                    ✅ Спасибо! Мы свяжемся с вами в течение 24 часов
                  </h2>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                    Заявка на подключение площадки «{form.venueName}» получена
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      padding: '11px 22px',
                      color: '#e2e8f0',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Отправить ещё одну заявку
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Заявка на подключение</h2>
                  <p style={{ color: '#64748b', fontSize: 14, marginBottom: 26 }}>
                    Расскажите немного о вашей площадке — свяжемся в течение 24 часов
                  </p>

                  <form onSubmit={handleSubmit} className="partners-form-grid">
                    <div>
                      <label style={labelStyle}>НАЗВАНИЕ ПЛОЩАДКИ</label>
                      <input
                        type="text" value={form.venueName}
                        onChange={e => update('venueName', e.target.value)}
                        onInvalid={handleInvalid('venueName')}
                        placeholder="Например, «Спарта Арена»"
                        required style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.venueName)) }}
                      />
                      <FieldError message={errors.venueName} />
                    </div>

                    <div>
                      <label style={labelStyle}>ТИП ПЛОЩАДКИ</label>
                      <input
                        type="text" value={form.venueType}
                        onChange={e => update('venueType', e.target.value)}
                        onInvalid={handleInvalid('venueType')}
                        placeholder="Например, бассейн, футбольное поле, лофт..."
                        list="venue-type-suggestions"
                        required style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.venueType)) }}
                      />
                      <datalist id="venue-type-suggestions">
                        {VENUE_TYPES.map(t => <option key={t} value={t} />)}
                      </datalist>
                      <FieldError message={errors.venueType} />
                    </div>

                    <div>
                      <label style={labelStyle}>ГОРОД</label>
                      <input
                        type="text" value={form.city}
                        onChange={e => update('city', e.target.value)}
                        onInvalid={handleInvalid('city')}
                        placeholder="Москва" required style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.city)) }}
                      />
                      <FieldError message={errors.city} />
                    </div>

                    <div>
                      <label style={labelStyle}>ИМЯ КОНТАКТНОГО ЛИЦА</label>
                      <input
                        type="text" value={form.contactName}
                        onChange={e => update('contactName', e.target.value)}
                        onInvalid={handleInvalid('contactName')}
                        placeholder="Иван Иванов" required autoComplete="name" style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.contactName)) }}
                      />
                      <FieldError message={errors.contactName} />
                    </div>

                    <div>
                      <label style={labelStyle}>ТЕЛЕФОН</label>
                      <input
                        type="tel" value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                        onInvalid={handleInvalid('phone')}
                        placeholder="+7 999 123-45-67" required autoComplete="tel" inputMode="tel" style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.phone)) }}
                      />
                      <FieldError message={errors.phone} />
                    </div>

                    <div>
                      <label style={labelStyle}>EMAIL</label>
                      <input
                        type="email" value={form.email}
                        onChange={e => update('email', e.target.value)}
                        onInvalid={handleInvalid('email')}
                        placeholder="you@example.com" required autoComplete="email" style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.email)) }}
                      />
                      <FieldError message={errors.email} />
                    </div>

                    <AnimatePresence>
                      {status === 'error' && (
                        <motion.p
                          className="full-width"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, margin: 0 }}
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={status === 'loading'}
                      className="full-width"
                      whileHover={status === 'loading' ? {} : { scale: 1.01 }}
                      whileTap={status === 'loading' ? {} : { scale: 0.98 }}
                      style={{
                        width: '100%', padding: 15, borderRadius: 12, marginTop: 4,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                        cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
                        opacity: status === 'loading' ? 0.8 : 1,
                      }}
                    >
                      {status === 'loading' ? <BtnSpinner /> : <><Send size={16} /><span>Отправить заявку</span></>}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
