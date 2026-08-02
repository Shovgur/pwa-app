import { motion } from 'framer-motion'
import { Users, CalendarCheck, Percent, Building2, Info } from 'lucide-react'
import { usePartnerAuth } from '../contexts/PartnerAuthContext'

const STATS = [
  { icon: Users,          label: 'Всего клиентов',            value: '0', color: '#22c55e' },
  { icon: CalendarCheck,  label: 'Бронирований в этом месяце', value: '0', color: '#3b82f6' },
  { icon: Percent,        label: 'Сумма комиссии',             value: '0 ₽', color: '#f97316' },
  { icon: Building2,      label: 'Активных площадок',          value: '0', color: '#a855f7' },
]

export function PartnerDashboardPage() {
  const { partner } = usePartnerAuth()

  return (
    <div className="dashboard-page">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 className="partner-dashboard-welcome">
          Добро пожаловать, {partner?.companyName || 'партнёр'}!
        </h1>
        <p className="partner-dashboard-subtitle">Обзор вашего партнёрского аккаунта</p>
      </motion.div>

      <div className="partner-stats-grid">
        {STATS.map((s, i) => {
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
        transition={{ delay: 0.3 }}
        className="card"
        style={{ marginTop: 20, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={18} color="#3b82f6" />
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
          Площадки и статистика появятся после подключения объектов
        </p>
      </motion.div>
    </div>
  )
}
