import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Copy,
  Info,
  KeyRound,
  Power,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import {
  createPartnerStaff,
  deletePartnerStaff,
  fetchPartnerStaff,
  setPartnerStaffActive,
  type PartnerStaff,
} from '../lib/partnerCrm'
import { FieldError, errorInputStyle } from '../components/ui/FieldError'
import { useFieldErrors } from '../hooks/useFieldErrors'
import { formatDateTime, formatRelative } from '../utils/partnerCrmFormat'

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

const PASSWORD_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

function generatePassword(): string {
  const bytes = new Uint32Array(10)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, n => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length]).join('')
}

/** Показываем владельцу созданные данные один раз — передать сотруднику. */
function CredentialsPanel({ login, password }: { login: string; password: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Логин: ${login}\nПароль: ${password}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // буфер обмена недоступен — данные всё равно видны на экране
    }
  }

  return (
    <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <KeyRound size={15} color="#22c55e" />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#86efac' }}>Сотрудник создан — передайте данные для входа</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 14, color: '#e2e8f0', fontFamily: 'monospace' }}>
          <div>Логин: <strong>{login}</strong></div>
          <div>Пароль: <strong>{password}</strong></div>
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.12)', color: '#86efac', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Скопировано' : 'Скопировать'}
        </button>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 12, color: '#64748b' }}>
        Вход — на странице /login, таб «Я партнёр». Сотрудник увидит только раздел «Брони».
      </p>
    </div>
  )
}

function StaffCard({
  member,
  onToggle,
  onDelete,
  busy,
}: {
  member: PartnerStaff
  onToggle: () => void
  onDelete: () => void
  busy: boolean
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="card crm-staff-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0, flex: 1 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 13, flexShrink: 0,
          background: member.isActive ? 'linear-gradient(135deg, #3b82f6, #22c55e)' : 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: member.isActive ? '#fff' : '#64748b',
        }}>
          {member.name.trim().slice(0, 2).toUpperCase()}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{member.name}</span>
            <span style={{
              padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              background: member.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.12)',
              color: member.isActive ? '#22c55e' : '#94a3b8',
              border: `1px solid ${member.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.2)'}`,
            }}>
              {member.isActive ? 'АКТИВЕН' : 'ОТКЛЮЧЁН'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            Логин: {member.login}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
            {member.lastLoginAt ? `Последний вход: ${formatRelative(member.lastLoginAt)}` : 'Ещё не входил'}
            {' · '}
            добавлен {formatDateTime(member.createdAt)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          title={member.isActive ? 'Отключить доступ' : 'Включить доступ'}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 11,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
            color: '#cbd5e1', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, whiteSpace: 'nowrap',
          }}
        >
          <Power size={14} />
          {member.isActive ? 'Отключить' : 'Включить'}
        </button>

        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 11, border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              aria-label="Отменить удаление"
              style={{ display: 'flex', padding: 9, borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Удалить сотрудника"
            style={{ display: 'flex', padding: 10, borderRadius: 11, border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export function PartnerStaffPage() {
  const [staff, setStaff]     = useState<PartnerStaff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]     = useState('')
  const [busyId, setBusyId]   = useState<string | null>(null)

  const [formOpen, setFormOpen]   = useState(false)
  const [name, setName]           = useState('')
  const [login, setLogin]         = useState('')
  const [password, setPassword]   = useState(() => generatePassword())
  const [creating, setCreating]   = useState(false)
  const [created, setCreated]     = useState<{ login: string; password: string } | null>(null)
  const { errors, handleInvalid, clearError } = useFieldErrors()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const list = await fetchPartnerStaff()
        if (!cancelled) setStaff(list)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Не удалось загрузить сотрудников')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const member = await createPartnerStaff({ name, login, password })
      setStaff(prev => [...prev, member])
      setCreated({ login: member.login, password })
      setFormOpen(false)
      setName('')
      setLogin('')
      setPassword(generatePassword())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать сотрудника')
    } finally {
      setCreating(false)
    }
  }

  async function handleToggle(member: PartnerStaff) {
    setError('')
    setBusyId(member.id)
    try {
      const updated = await setPartnerStaffActive(member.id, !member.isActive)
      setStaff(prev => prev.map(s => (s.id === member.id ? updated : s)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось изменить доступ')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(member: PartnerStaff) {
    setError('')
    setBusyId(member.id)
    try {
      await deletePartnerStaff(member.id)
      setStaff(prev => prev.filter(s => s.id !== member.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось удалить сотрудника')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="dashboard-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
            Сотрудники
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Доступ к CRM для администраторов и управляющих
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setFormOpen(o => !o); setCreated(null) }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px',
            borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
            cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,197,94,0.25)',
          }}
        >
          <UserPlus size={16} />
          Добавить сотрудника
        </button>
      </motion.div>

      <div className="card" style={{ padding: '16px 18px', marginBottom: 20, display: 'flex', gap: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={17} color="#3b82f6" />
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6 }}>
          Сотрудники входят там же, где и вы — <strong style={{ color: '#cbd5e1' }}>/login → «Я партнёр»</strong>, отдельная
          страница входа не нужна. В кабинете им доступен только раздел «Брони»: подтверждение заявок и отметки об оплате.
          Комиссия, выручка и реквизиты компании остаются видны только вам.
        </p>
      </div>

      {formOpen && (
        <motion.form
          className="card"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          style={{ padding: '20px 22px', marginBottom: 20 }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Новый сотрудник</div>

          <div className="partner-info-grid">
            <div>
              <label style={labelStyle}>ИМЯ</label>
              <input
                type="text" value={name}
                onChange={e => { setName(e.target.value); clearError('name') }}
                onInvalid={handleInvalid('name')}
                placeholder="Например, Анна Резникова" required
                style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.name)) }}
              />
              <FieldError message={errors.name} />
            </div>

            <div>
              <label style={labelStyle}>ЛОГИН</label>
              <input
                type="text" value={login}
                onChange={e => { setLogin(e.target.value); clearError('login') }}
                onInvalid={handleInvalid('login')}
                placeholder="anna.admin" required minLength={3} autoComplete="off"
                style={{ ...inputStyle, ...errorInputStyle(Boolean(errors.login)) }}
              />
              <FieldError message={errors.login} />
            </div>

            <div className="full-width">
              <label style={labelStyle}>ПАРОЛЬ</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text" value={password}
                  onChange={e => { setPassword(e.target.value); clearError('password') }}
                  onInvalid={handleInvalid('password')}
                  placeholder="Минимум 6 символов" required minLength={6} autoComplete="off"
                  style={{ ...inputStyle, flex: 1, minWidth: 200, ...errorInputStyle(Boolean(errors.password)) }}
                />
                <button
                  type="button"
                  onClick={() => setPassword(generatePassword())}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '13px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#cbd5e1', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  <KeyRound size={14} />
                  Сгенерировать
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="full-width"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: 14, borderRadius: 12, marginTop: 4, border: 'none',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                cursor: creating ? 'default' : 'pointer', opacity: creating ? 0.7 : 1,
              }}
            >
              <UserPlus size={16} />
              {creating ? 'Создаём...' : 'Создать доступ'}
            </button>
          </div>
        </motion.form>
      )}

      {created && <CredentialsPanel login={created.login} password={created.password} />}

      {error && (
        <p style={{ padding: '11px 14px', borderRadius: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: 13, margin: '16px 0 0' }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          [0, 1, 2].map(i => <div key={i} className="card crm-skeleton" style={{ height: 88 }} />)
        ) : staff.length === 0 ? (
          <div className="card" style={{ padding: '42px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Users size={22} color="#64748b" />
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Сотрудников пока нет</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
              Создайте доступ, чтобы администратор мог подтверждать брони
            </p>
          </div>
        ) : (
          staff.map(member => (
            <StaffCard
              key={member.id}
              member={member}
              busy={busyId === member.id}
              onToggle={() => void handleToggle(member)}
              onDelete={() => void handleDelete(member)}
            />
          ))
        )}
      </div>
    </div>
  )
}
