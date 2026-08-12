import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ShieldCheck, Save, CheckCircle2 } from 'lucide-react'
import { usePartnerAuth } from '../contexts/PartnerAuthContext'
import { FieldError, errorInputStyle } from '../components/ui/FieldError'
import { useFieldErrors } from '../hooks/useFieldErrors'
import { can } from '../utils/partnerAccess'

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

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'rgba(255,255,255,0.03)',
  color: '#94a3b8',
  cursor: 'not-allowed',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#94a3b8',
  marginBottom: 7,
  letterSpacing: 0.5,
}

type Status = 'idle' | 'loading' | 'success' | 'error'

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="text" value={value} readOnly style={readOnlyStyle} />
    </div>
  )
}

function BtnSpinner() {
  return (
    <motion.div
      style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
    />
  )
}

export function PartnerSettingsPage() {
  const { partner, changePartnerPassword } = usePartnerAuth()
  // Реквизиты и комиссия — информация владельца, управляющему доступна только
  // смена собственного логина и пароля
  const showCompanyInfo = can(partner?.role ?? 'owner', 'companyInfo')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newLogin, setNewLogin]               = useState('')
  const [loginTouched, setLoginTouched]       = useState(false)
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError]   = useState('')
  const [mismatch, setMismatch] = useState('')
  const { errors, handleInvalid, clearError } = useFieldErrors()

  // Поле логина предзаполняем текущим логином, как только профиль подгрузится.
  // Это делается прямо в теле рендера (а не в useEffect), как рекомендует
  // React для синхронизации состояния с изменившимся значением извне —
  // так не возникает лишнего цикла рендер → эффект → рендер.
  const [syncedLogin, setSyncedLogin] = useState<string | null>(null)
  if (!loginTouched && partner?.login && partner.login !== syncedLogin) {
    setSyncedLogin(partner.login)
    setNewLogin(partner.login)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMismatch('')

    if (newPassword !== confirmPassword) {
      setMismatch('Пароли не совпадают')
      return
    }

    setStatus('loading')
    const result = await changePartnerPassword({
      currentPassword,
      newPassword,
      newLogin: newLogin.trim(),
    })

    if (result.success) {
      setStatus('success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      window.setTimeout(() => setStatus('idle'), 3000)
    } else {
      setError(result.error ?? 'Не удалось обновить данные')
      setStatus('error')
    }
  }

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
          Настройки аккаунта
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          {showCompanyInfo ? 'Информация о компании и безопасность входа' : 'Безопасность вашего входа в кабинет'}
        </p>
      </motion.div>

      {/* Информация о компании — только владельцу */}
      {showCompanyInfo && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ padding: '22px 24px', marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={17} color="#22c55e" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Информация о компании</span>
          </div>

          <div className="partner-info-grid">
            <ReadOnlyField label="НАЗВАНИЕ КОМПАНИИ" value={partner?.companyName || '—'} />
            <ReadOnlyField label="EMAIL" value={partner?.email || '—'} />
            <ReadOnlyField label="ГОРОД" value={partner?.city || '—'} />
            <ReadOnlyField label="КОМИССИЯ" value={partner ? `${partner.commissionPercent}%` : '—'} />
          </div>
        </motion.div>
      )}

      {/* Безопасность */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ padding: '22px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={17} color="#3b82f6" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Безопасность</span>
        </div>

        <form onSubmit={handleSubmit} className="partner-info-grid">
          <div>
            <label style={labelStyle}>ТЕКУЩИЙ ПАРОЛЬ</label>
            <input
              type="password" value={currentPassword}
              onChange={e => { setCurrentPassword(e.target.value); clearError('currentPassword') }}
              onInvalid={handleInvalid('currentPassword')}
              placeholder="Введите текущий пароль" required autoComplete="current-password"
              style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.currentPassword)) }}
            />
            <FieldError message={errors.currentPassword} />
          </div>

          <div>
            <label style={labelStyle}>НОВЫЙ ЛОГИН</label>
            <input
              type="text" value={newLogin}
              onChange={e => { setNewLogin(e.target.value); setLoginTouched(true); clearError('newLogin') }}
              onInvalid={handleInvalid('newLogin')}
              placeholder="Новый логин" required autoComplete="username"
              style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.newLogin)) }}
            />
            <FieldError message={errors.newLogin} />
          </div>

          <div>
            <label style={labelStyle}>НОВЫЙ ПАРОЛЬ</label>
            <input
              type="password" value={newPassword}
              onChange={e => { setNewPassword(e.target.value); clearError('newPassword'); setMismatch('') }}
              onInvalid={handleInvalid('newPassword')}
              placeholder="Минимум 6 символов" required minLength={6} autoComplete="new-password"
              style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.newPassword)) }}
            />
            <FieldError message={errors.newPassword} />
          </div>

          <div>
            <label style={labelStyle}>ПОДТВЕРЖДЕНИЕ НОВОГО ПАРОЛЯ</label>
            <input
              type="password" value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword'); setMismatch('') }}
              onInvalid={handleInvalid('confirmPassword')}
              placeholder="Повторите новый пароль" required autoComplete="new-password"
              style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.confirmPassword) || Boolean(mismatch)) }}
            />
            <FieldError message={errors.confirmPassword || mismatch} />
          </div>

          <AnimatePresence>
            {status === 'success' && (
              <motion.p
                className="full-width"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac', fontSize: 13, margin: 0 }}
              >
                <CheckCircle2 size={15} /> Данные обновлены
              </motion.p>
            )}
            {status === 'error' && error && (
              <motion.p
                className="full-width"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: 14, borderRadius: 12, marginTop: 4,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
              cursor: status === 'loading' ? 'default' : 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
              opacity: status === 'loading' ? 0.8 : 1,
            }}
          >
            {status === 'loading' ? <BtnSpinner /> : <><Save size={16} /><span>Сохранить изменения</span></>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
