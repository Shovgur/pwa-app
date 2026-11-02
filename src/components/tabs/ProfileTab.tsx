import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCheck, Clock, ChevronRight, Share2, Edit2, LogOut, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBookings } from '../../contexts/BookingContext'
import { useNavigate } from 'react-router-dom'
import { apiGetProfile, apiChangePassword, type UserProfile } from '../../lib/api'
import { CharacterAvatar } from '../ui/CharacterAvatar'
import { getDominantOutfit, OUTFITS } from '../../utils/characterOutfit'
import { FieldError, errorInputStyle } from '../ui/FieldError'
import { useFieldErrors } from '../../hooks/useFieldErrors'

const MENU = [
  { icon: Edit2, label: 'Редактировать профиль', color: '#22c55e' },
  { icon: Share2, label: 'Пригласить друга', color: '#3b82f6' },
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
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
  fontSize: 11,
  fontWeight: 700,
  color: '#94a3b8',
  marginBottom: 7,
  letterSpacing: 0.5,
}

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
  const { bookings } = useBookings()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdBusy, setPwdBusy] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const { errors, handleInvalid, clearError, setErrors } = useFieldErrors()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    apiGetProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [user])

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess(false)

    const nextErrors: Record<string, string> = {}
    if (!currentPassword) nextErrors.currentPassword = 'Введите текущий пароль'
    if (newPassword.length < 6) nextErrors.newPassword = 'Пароль должен быть не короче 6 символов'
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Пароли не совпадают'
    if (currentPassword && newPassword && currentPassword === newPassword) {
      nextErrors.newPassword = 'Новый пароль должен отличаться от текущего'
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setPwdBusy(true)
    try {
      await apiChangePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPwdSuccess(true)
      window.setTimeout(() => setPwdSuccess(false), 3500)
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Не удалось сменить пароль')
    } finally {
      setPwdBusy(false)
    }
  }

  const totalBookings = bookings.length
  const upcomingBookings = bookings.filter(b => b.status === 'upcoming').length
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    : null

  const outfitKey = getDominantOutfit(bookings)
  const outfit = OUTFITS[outfitKey]

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 2, fontFamily: 'var(--font-display)' }}>
          Профиль
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Управление аккаунтом и личными данными</p>
      </motion.div>

      <div className="dashboard-profile-layout">
        {/* Левая колонка — карточка профиля */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, #1a3a2a, #162d40)', borderRadius: 24, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(34,197,94,0.08)' }} />
            <div style={{ position: 'absolute', bottom: -20, left: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(59,130,246,0.08)' }} />

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
              <CharacterAvatar size={112} />
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                  {loading ? <Spinner /> : (profile?.name ?? user?.name ?? '—')}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 6px' }}>
                  {profile?.email ?? user?.email}
                </p>
                {profile?.phone ?? user?.phone ? (
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: '0 0 10px' }}>{profile?.phone ?? user?.phone}</p>
                ) : null}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.35)', padding: '4px 12px', borderRadius: 100 }}>
                  <span style={{ color: '#22c55e', fontSize: 12, fontWeight: 700 }}>{outfit.label}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '10px 0 0', lineHeight: 1.5, maxWidth: 220 }}>
                  {outfit.caption}
                </p>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
              {[
                { icon: CalendarCheck, value: String(totalBookings), label: 'Всего броней' },
                { icon: Clock, value: memberSince ?? '—', label: 'С нами с', small: true },
              ].map(s => {
                const Icon = s.icon
                return (
                  <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: '12px 8px' }}>
                    <Icon size={16} color="rgba(255,255,255,0.6)" style={{ marginBottom: 4 }} />
                    <div style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: s.small ? 12 : 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.label}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <motion.button
            onClick={() => { logout(); navigate('/login') }}
            style={{ width: '100%', marginTop: 16, padding: '15px', borderRadius: 14, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <LogOut size={17} />
            Выйти из аккаунта
          </motion.button>
        </motion.div>

        {/* Правая колонка — статистика, безопасность, меню */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: CalendarCheck, value: totalBookings, label: 'Всего броней', color: '#22c55e' },
              { icon: Clock, value: upcomingBookings, label: 'Предстоящих', color: '#3b82f6' },
              { icon: TrendingUp, value: `${totalBookings * 15}%`, label: 'Активность', color: '#f97316' },
            ].map(s => {
              const Icon = s.icon
              return (
                <div key={s.label} className="card" style={{ padding: '18px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <Icon size={17} color={s.color} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', fontFamily: 'var(--font-display)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                </div>
              )
            })}
          </div>

          <div className="card" style={{ padding: '20px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={17} color="#3b82f6" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Смена пароля</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>После восстановления задайте свой постоянный пароль</div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>ТЕКУЩИЙ ПАРОЛЬ</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); clearError('currentPassword'); setPwdError('') }}
                  onInvalid={handleInvalid('currentPassword')}
                  placeholder="Введите текущий пароль"
                  required
                  autoComplete="current-password"
                  disabled={pwdBusy}
                  style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.currentPassword)) }}
                />
                <FieldError message={errors.currentPassword} />
              </div>

              <div>
                <label style={labelStyle}>НОВЫЙ ПАРОЛЬ</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); clearError('newPassword'); setPwdError('') }}
                  onInvalid={handleInvalid('newPassword')}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={pwdBusy}
                  style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.newPassword)) }}
                />
                <FieldError message={errors.newPassword} />
              </div>

              <div>
                <label style={labelStyle}>ПОВТОРИТЕ НОВЫЙ ПАРОЛЬ</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword'); setPwdError('') }}
                  onInvalid={handleInvalid('confirmPassword')}
                  placeholder="Ещё раз"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={pwdBusy}
                  style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.confirmPassword)) }}
                />
                <FieldError message={errors.confirmPassword} />
              </div>

              <AnimatePresence>
                {pwdSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, padding: '10px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac', fontSize: 13 }}
                  >
                    <CheckCircle2 size={15} /> Пароль обновлён
                  </motion.p>
                )}
                {pwdError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ margin: 0, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13 }}
                  >
                    {pwdError}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={pwdBusy}
                style={{
                  width: '100%',
                  marginTop: 4,
                  padding: '13px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: pwdBusy ? 'wait' : 'pointer',
                  opacity: pwdBusy ? 0.75 : 1,
                  fontFamily: 'inherit',
                  boxShadow: '0 8px 20px rgba(34,197,94,0.25)',
                }}
                whileHover={pwdBusy ? undefined : { scale: 1.01 }}
                whileTap={pwdBusy ? undefined : { scale: 0.98 }}
              >
                {pwdBusy ? 'Сохраняем…' : 'Сохранить новый пароль'}
              </motion.button>
            </form>
          </div>

          <div className="card" style={{ overflow: 'hidden' }}>
            {MENU.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div key={item.label} className="card-hover"
                  style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', borderBottom: i < MENU.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                  whileHover={{ x: 4 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={17} color={item.color} />
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{item.label}</span>
                  <ChevronRight size={16} color="#475569" />
                </motion.div>
              )
            })}
          </div>

          {bookings.length > 0 && (
            <div className="card" style={{ padding: '18px 20px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>Последние бронирования</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bookings.slice(0, 3).map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: b.court.photos[0], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {b.court.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.court.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.date}, {b.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
