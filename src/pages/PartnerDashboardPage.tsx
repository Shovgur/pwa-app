import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, CalendarCheck, CheckCircle2, Info, Percent, ShieldAlert, UserPlus, Users } from 'lucide-react'
import { usePartnerAuth } from '../contexts/PartnerAuthContext'
import { usePartnerCrm } from '../contexts/PartnerCrmContext'
import { isOwner, PARTNER_BOOKINGS_PATH } from '../utils/partnerAccess'
import { formatMoney } from '../utils/partnerCrmFormat'

type LocationState = { accessDenied?: boolean }

function AccessDeniedBanner({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        marginBottom: 18,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
      }}
    >
      <ShieldAlert size={18} color="#f87171" style={{ flexShrink: 0 }} />
      <p style={{ margin: 0, flex: 1, fontSize: 14, color: '#fca5a5', fontWeight: 600 }}>
        Доступ запрещён
      </p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрыть"
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          fontSize: 18,
          lineHeight: 1,
          cursor: 'pointer',
          padding: 4,
          fontFamily: 'inherit',
        }}
      >
        ×
      </button>
    </motion.div>
  )
}

function OwnerDashboard() {
  const { partner } = usePartnerAuth()

  const stats = [
    { icon: Users,         label: 'Всего клиентов',             value: '0', color: '#22c55e' },
    { icon: CalendarCheck, label: 'Бронирований в этом месяце', value: '0', color: '#3b82f6' },
    { icon: Percent,       label: 'Сумма комиссии',             value: formatMoney(0), color: '#f97316' },
    { icon: Building2,     label: 'Активных площадок',          value: '0', color: '#a855f7' },
  ]

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 className="partner-dashboard-welcome">
          Добро пожаловать, {partner?.companyName || 'партнёр'}!
        </h1>
        <p className="partner-dashboard-subtitle">Обзор вашего партнёрского аккаунта</p>
      </motion.div>

      <div className="partner-stats-grid">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{s.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="card"
        style={{ marginTop: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <UserPlus size={18} color="#22c55e" />
        </div>
        <p style={{ margin: 0, flex: 1, minWidth: 200, fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>
          Добавьте сотрудников — они будут подтверждать брони и оплаты в своём кабинете
        </p>
        <Link
          to="/partner/staff"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px',
            borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          Сотрудники
          <ArrowRight size={15} />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="card"
        style={{ marginTop: 20, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={18} color="#3b82f6" />
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
          Площадки и статистика появятся после подключения объектов. Раздел «Брони» доступен только вашим сотрудникам.
        </p>
      </motion.div>
    </>
  )
}

function ManagerDashboard() {
  const { partner } = usePartnerAuth()
  const { bookings } = usePartnerCrm()

  const monthPrefix = new Date().toISOString().slice(0, 7)

  const stats = useMemo(() => {
    const thisMonth = bookings.filter(b => b.date.startsWith(monthPrefix))

    const monthBookings = thisMonth.filter(b => b.status !== 'cancelled').length
    const uniqueClients = new Set(
      thisMonth.map(b => b.customerName.trim()).filter(Boolean),
    ).size
    const completed = thisMonth.filter(b => b.status === 'completed').length

    return [
      {
        icon: CalendarCheck,
        label: 'Бронирований в этом месяце',
        value: monthBookings,
        color: '#3b82f6',
      },
      {
        icon: Users,
        label: 'Клиентов за месяц',
        value: uniqueClients,
        color: '#6366f1',
      },
      {
        icon: CheckCircle2,
        label: 'Завершено',
        value: completed,
        color: '#22c55e',
      },
    ]
  }, [bookings, monthPrefix])

  const displayName = partner?.name || partner?.login || 'сотрудник'

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 className="partner-dashboard-welcome">
          Добро пожаловать, {displayName}!
        </h1>
        <p className="partner-dashboard-subtitle">Ваш рабочий кабинет</p>
      </motion.div>

      <div className="manager-stats-grid">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 13, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{s.label}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card"
        style={{ marginTop: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CalendarCheck size={18} color="#22c55e" />
        </div>
        <p style={{ margin: 0, flex: 1, minWidth: 200, fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>
          Подтверждайте заявки и отмечайте оплаты в разделе броней
        </p>
        <Link
          to={PARTNER_BOOKINGS_PATH}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px',
            borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}
        >
          Открыть брони
          <ArrowRight size={15} />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="card"
        style={{ marginTop: 20, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={18} color="#3b82f6" />
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
          Полная информация доступна только владельцу
        </p>
      </motion.div>
    </>
  )
}

export function PartnerDashboardPage() {
  const { partner } = usePartnerAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const state = location.state as LocationState | null
    if (state?.accessDenied) {
      setAccessDenied(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const owner = isOwner(partner?.role)

  return (
    <div className="dashboard-page">
      {accessDenied && <AccessDeniedBanner onClose={() => setAccessDenied(false)} />}
      {owner ? <OwnerDashboard /> : <ManagerDashboard />}
    </div>
  )
}
