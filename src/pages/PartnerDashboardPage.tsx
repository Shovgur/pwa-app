import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Eye,
  Percent,
  Receipt,
  ShieldAlert,
  UserPlus,
  Wallet,
  XCircle,
} from 'lucide-react'
import { usePartnerAuth } from '../contexts/PartnerAuthContext'
import { usePartnerCrm } from '../contexts/PartnerCrmContext'
import {
  isOwner,
  PARTNER_BOOKINGS_PATH,
  PARTNER_VENUES_PATH,
  PARTNER_PROMOTIONS_PATH,
} from '../utils/partnerAccess'
import { formatMoney } from '../utils/partnerCrmFormat'
import { fetchPartnerBookings } from '../lib/partnerCrm'
import { fetchPartnerVenues } from '../lib/partnerVenues'
import { fetchPartnerVenueViews } from '../lib/venueViews'
import {
  computePartnerEarnings,
  type PartnerEarningsStats,
  type StatsPeriod,
} from '../utils/partnerStats'
import { PeriodSwitcher } from '../components/partner/PeriodSwitcher'
import { VenueEarningsTable } from '../components/partner/VenueEarningsTable'

function formatAvgCheck(avg: number | null | undefined): string {
  if (avg == null || !Number.isFinite(avg)) return '—'
  return formatMoney(Math.round(avg))
}

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

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay = 0,
  to,
}: {
  icon: typeof Wallet
  label: string
  value: string
  color: string
  delay?: number
  to?: string
}) {
  const body = (
    <>
      <div style={{
        width: 42, height: 42, borderRadius: 13, background: `${color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{
          fontSize: 26, fontWeight: 700, color: '#F1F5F9',
          fontFamily: 'var(--font-display)', lineHeight: 1,
        }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{label}</div>
      </div>
    </>
  )

  if (to) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <Link
          to={to}
          className="card partner-stat-card--link"
          style={{
            padding: '20px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            height: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${color}40`,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = `${color}90`
            e.currentTarget.style.boxShadow = `0 0 0 3px ${color}22`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${color}40`
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {body}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {body}
    </motion.div>
  )
}

function OwnerDashboard() {
  const { partner } = usePartnerAuth()
  const [period, setPeriod] = useState<StatsPeriod>('this_month')
  const [stats, setStats] = useState<PartnerEarningsStats | null>(null)
  const [statsError, setStatsError] = useState('')
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setStatsLoading(true)
    void Promise.all([
      fetchPartnerBookings(),
      fetchPartnerVenues(),
      fetchPartnerVenueViews(period),
    ])
      .then(([bookings, venues, views]) => {
        if (cancelled) return
        setStatsError('')
        setStats(computePartnerEarnings(bookings, venues, period, {
          commissionPercent: partner?.commissionPercent ?? 0,
          includeCommission: true,
          viewsByVenueId: views.byVenueId,
        }))
      })
      .catch((e) => {
        if (cancelled) return
        setStatsError(e instanceof Error ? e.message : 'Не удалось загрузить сводку')
        setStats(null)
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false)
      })
    return () => { cancelled = true }
  }, [partner?.commissionPercent, period])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="partner-dashboard-welcome">
            Добро пожаловать, {partner?.companyName || 'партнёр'}!
          </h1>
          <p className="partner-dashboard-subtitle">Выручка и комиссия по компании</p>
        </div>
        <PeriodSwitcher value={period} onChange={setPeriod} />
      </motion.div>

      {statsError && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            color: '#fca5a5',
            fontSize: 13,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
          }}
        >
          {statsError}
        </div>
      )}

      <div className="partner-stats-grid" style={{ opacity: statsLoading ? 0.7 : 1 }}>
        <StatCard
          icon={Wallet}
          label="Заработано вами"
          value={formatMoney(stats?.netEarnings ?? 0)}
          color="#22c55e"
          delay={0.05}
        />
        <StatCard
          icon={Percent}
          label="Комиссия платформы"
          value={formatMoney(stats?.commissionAmount ?? 0)}
          color="#f97316"
          delay={0.1}
        />
        <StatCard
          icon={Receipt}
          label="Средний чек"
          value={formatAvgCheck(stats?.avgCheck)}
          color="#38bdf8"
          delay={0.12}
        />
        <StatCard
          icon={Eye}
          label="Просмотры"
          value={String(stats?.totalViews ?? 0)}
          color="#a78bfa"
          delay={0.14}
        />
        <StatCard
          icon={CheckCircle2}
          label="Оплаченных броней"
          value={String(stats?.paidCount ?? 0)}
          color="#3b82f6"
          delay={0.15}
          to={`${PARTNER_BOOKINGS_PATH}?status=paid`}
        />
        <StatCard
          icon={Building2}
          label="Активных площадок"
          value={String(stats?.activeVenues ?? 0)}
          color="#a855f7"
          delay={0.2}
          to={PARTNER_VENUES_PATH}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="card"
        style={{ marginTop: 20, padding: '20px 22px' }}
      >
        <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
          По площадкам
        </h2>
        <VenueEarningsTable rows={stats?.venues ?? []} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="card"
        style={{ marginTop: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <UserPlus size={18} color="#22c55e" />
        </div>
        <p style={{ margin: 0, flex: 1, minWidth: 200, fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>
          Назначьте управляющих на площадки — они ведут брони и акции только по своим точкам
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
    </>
  )
}

function ManagerDashboard() {
  const { partner } = usePartnerAuth()
  const { bookings } = usePartnerCrm()
  const [period, setPeriod] = useState<StatsPeriod>('this_month')
  const [venues, setVenues] = useState<Awaited<ReturnType<typeof fetchPartnerVenues>>>([])
  const [viewsByVenueId, setViewsByVenueId] = useState<Record<string, number>>({})
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    void Promise.all([fetchPartnerVenues(), fetchPartnerVenueViews(period)])
      .then(([list, views]) => {
        if (cancelled) return
        setVenues(list)
        setViewsByVenueId(views.byVenueId)
      })
      .catch(e => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Ошибка загрузки')
      })
    return () => { cancelled = true }
  }, [period])

  const stats = useMemo(
    () => computePartnerEarnings(bookings, venues, period, {
      includeCommission: false,
      viewsByVenueId,
    }),
    [bookings, venues, period, viewsByVenueId],
  )

  const displayName = partner?.name || partner?.login || 'сотрудник'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="partner-dashboard-welcome">
            Добро пожаловать, {displayName}!
          </h1>
          <p className="partner-dashboard-subtitle">Выручка по вашим площадкам</p>
        </div>
        <PeriodSwitcher value={period} onChange={setPeriod} />
      </motion.div>

      {loadError && (
        <div className="card" style={{ marginBottom: 16, padding: '12px 14px', color: '#fca5a5', fontSize: 13 }}>
          {loadError}
        </div>
      )}

      <div className="manager-stats-grid">
        <StatCard
          icon={Wallet}
          label="Выручка"
          value={formatMoney(stats.revenue)}
          color="#22c55e"
          delay={0.05}
        />
        <StatCard
          icon={Receipt}
          label="Средний чек"
          value={formatAvgCheck(stats.avgCheck)}
          color="#38bdf8"
          delay={0.08}
        />
        <StatCard
          icon={Eye}
          label="Просмотры"
          value={String(stats.totalViews)}
          color="#a78bfa"
          delay={0.1}
        />
        <StatCard
          icon={CheckCircle2}
          label="Оплаченных"
          value={String(stats.paidCount)}
          color="#3b82f6"
          delay={0.12}
          to={`${PARTNER_BOOKINGS_PATH}?status=paid`}
        />
        <StatCard
          icon={XCircle}
          label="Отменённых"
          value={String(stats.cancelledCount)}
          color="#f87171"
          delay={0.15}
          to={`${PARTNER_BOOKINGS_PATH}?status=cancelled`}
        />
        <StatCard
          icon={Building2}
          label="Ваших площадок"
          value={String(venues.length)}
          color="#a855f7"
          delay={0.2}
          to={PARTNER_VENUES_PATH}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="card"
        style={{ marginTop: 20, padding: '20px 22px' }}
      >
        <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
          Ваши площадки
        </h2>
        <VenueEarningsTable rows={stats.venues} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="card"
        style={{ marginTop: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(34,197,94,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
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
        transition={{ delay: 0.32 }}
        className="card"
        style={{ marginTop: 20, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(168,85,247,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Building2 size={18} color="#a855f7" />
        </div>
        <p style={{ margin: 0, flex: 1, minWidth: 200, fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>
          Ведите свои площадки и акции — чужие точки вам не видны
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link
            to={PARTNER_VENUES_PATH}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px',
              borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}
          >
            Площадки
          </Link>
          <Link
            to={PARTNER_PROMOTIONS_PATH}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px',
              borderRadius: 12, background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}
          >
            Акции
          </Link>
        </div>
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
