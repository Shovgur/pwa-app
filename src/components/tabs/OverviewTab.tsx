import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  ArrowRight,
  Star,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { fadeUpContainer, fadeUpItem } from '../../utils/variants'

const STATS = [
  { label: 'Выручка', value: '$48,295', change: '+12.5%', up: true, icon: DollarSign, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  { label: 'Пользователи', value: '12,847', change: '+8.2%', up: true, icon: Users, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { label: 'Активность', value: '94.3%', change: '-1.2%', up: false, icon: Activity, color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  { label: 'Рост', value: '×3.4', change: '+24%', up: true, icon: TrendingUp, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
]

const ACTIVITY = [
  { user: 'AR', name: 'Алексей Романов', action: 'Создал новый проект', time: '2 мин назад', color: '#a855f7' },
  { user: 'МС', name: 'Мария Смирнова', action: 'Завершила задачу #142', time: '15 мин назад', color: '#22d3ee' },
  { user: 'ДК', name: 'Дмитрий Козлов', action: 'Загрузил документы', time: '1 час назад', color: '#f472b6' },
  { user: 'ЕВ', name: 'Елена Волкова', action: 'Оставила комментарий', time: '2 часа назад', color: '#34d399' },
  { user: 'ИН', name: 'Иван Новиков', action: 'Зарегистрировался', time: '3 часа назад', color: '#fbbf24' },
]

const BARS = [65, 80, 45, 92, 70, 85, 60, 75, 88, 55, 95, 72]
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export function OverviewTab() {
  const { user } = useAuth()

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={fadeUpContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeUpItem} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Привет, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Вот что происходит сегодня в вашем пространстве
          </p>
        </div>
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass"
          style={{ border: '1px solid rgba(168,85,247,0.3)' }}
          animate={{ boxShadow: ['0 0 10px rgba(168,85,247,0.1)', '0 0 20px rgba(168,85,247,0.3)', '0 0 10px rgba(168,85,247,0.1)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Zap size={14} className="text-purple-400" />
          <span className="text-purple-400 text-sm font-medium">Nexus Pro</span>
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={fadeUpItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl p-4 relative overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              whileHover={{ scale: 1.02, borderColor: `${stat.color}40` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8"
                style={{ background: `radial-gradient(circle, ${stat.color}15, transparent)` }} />

              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ background: stat.bg }}>
                  <Icon size={16} color={stat.color} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.change}
                </div>
              </div>

              <motion.p
                className="text-2xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                {stat.value}
              </motion.p>
              <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          variants={fadeUpItem}
          className="lg:col-span-2 glass rounded-2xl p-5"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Доходы за год</h3>
              <p className="text-slate-500 text-xs mt-0.5">Ежемесячная выручка</p>
            </div>
            <div className="flex gap-2">
              {['3м', '6м', '1г'].map((p, i) => (
                <motion.button
                  key={p}
                  className="px-3 py-1 rounded-lg text-xs"
                  style={{
                    background: i === 2 ? 'rgba(168,85,247,0.2)' : 'transparent',
                    color: i === 2 ? '#a855f7' : '#64748b',
                    border: i === 2 ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-32">
            {BARS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-md relative overflow-hidden"
                  style={{
                    height: `${h}%`,
                    background: i === 11
                      ? 'linear-gradient(180deg, #a855f7, #7c3aed)'
                      : 'rgba(168,85,247,0.2)',
                    minHeight: 4,
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  whileHover={{ background: 'linear-gradient(180deg, #22d3ee, #06b6d4)' }}
                >
                  {i === 11 && (
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)' }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className="text-slate-600 text-xs">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div
          variants={fadeUpItem}
          className="glass rounded-2xl p-5"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Активность</h3>
            <motion.button
              className="text-purple-400 text-xs flex items-center gap-1"
              whileHover={{ x: 2 }}
            >
              Всё <ArrowRight size={12} />
            </motion.button>
          </div>

          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `${a.color}30`, border: `1px solid ${a.color}50`, color: a.color }}
                >
                  {a.user}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{a.name}</p>
                  <p className="text-slate-500 text-xs truncate">{a.action}</p>
                </div>
                <span className="text-slate-600 text-xs flex-shrink-0">{a.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        variants={fadeUpItem}
        className="glass rounded-2xl p-5"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h3 className="text-white font-semibold mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Новый проект', color: '#a855f7', icon: '🚀' },
            { label: 'Пригласить', color: '#22d3ee', icon: '👥' },
            { label: 'Аналитика', color: '#f472b6', icon: '📊' },
            { label: 'Интеграции', color: '#34d399', icon: '⚡' },
          ].map((action) => (
            <motion.button
              key={action.label}
              className="flex items-center gap-2.5 p-3 rounded-xl glass-hover glass text-left"
              style={{ border: `1px solid ${action.color}25` }}
              whileHover={{ scale: 1.03, borderColor: `${action.color}50` }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium" style={{ color: action.color }}>{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Bottom rating */}
      <motion.div
        variants={fadeUpItem}
        className="glass rounded-2xl p-5 flex items-center justify-between"
        style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.15)' }}>
            <Star size={20} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Ваш рейтинг — Excellent</p>
            <p className="text-slate-400 text-sm">98-й процентиль среди всех пользователей</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8 + s * 0.1 }}
            >
              <Star size={18} className="text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
