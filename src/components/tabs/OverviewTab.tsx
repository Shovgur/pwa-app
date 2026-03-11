import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Star, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const STATS = [
  { label: 'Выручка', value: '$48,295', change: '+12.5%', up: true, icon: DollarSign, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  { label: 'Пользователи', value: '12,847', change: '+8.2%', up: true, icon: Users, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  { label: 'Активность', value: '94.3%', change: '-1.2%', up: false, icon: Activity, color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  { label: 'Рост', value: '×3.4', change: '+24%', up: true, icon: TrendingUp, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
]

const ACTIVITY = [
  { user: 'АР', name: 'Алексей Романов', action: 'Создал новый проект', time: '2 мин', color: '#a855f7' },
  { user: 'МС', name: 'Мария Смирнова', action: 'Завершила задачу #142', time: '15 мин', color: '#22d3ee' },
  { user: 'ДК', name: 'Дмитрий Козлов', action: 'Загрузил документы', time: '1 час', color: '#f472b6' },
  { user: 'ЕВ', name: 'Елена Волкова', action: 'Оставила комментарий', time: '2 ч', color: '#34d399' },
]

const BARS = [65, 80, 45, 92, 70, 85, 60, 75, 88, 55, 95, 72]
const MONTHS = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д']

export function OverviewTab() {
  const { user } = useAuth()

  return (
    <motion.div
      className="p-4 pb-24 md:pb-6 space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Хедер */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Привет, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-xs mt-0.5">Вот что происходит сегодня</p>
        </div>
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass"
          style={{ border: '1px solid rgba(168,85,247,0.3)' }}
          animate={{ boxShadow: ['0 0 8px rgba(168,85,247,0.1)', '0 0 16px rgba(168,85,247,0.3)', '0 0 8px rgba(168,85,247,0.1)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Zap size={12} className="text-purple-400" />
          <span className="text-purple-400 text-xs font-medium">Pro</span>
        </motion.div>
      </div>

      {/* Статистика — 2 колонки на мобилке, 4 на десктопе */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl p-3.5 relative overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8"
                style={{ background: `radial-gradient(circle, ${stat.color}20, transparent)` }} />
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: stat.bg }}>
                  <Icon size={14} color={stat.color} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Чарт */}
      <motion.div
        className="glass rounded-2xl p-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-sm">Доходы за год</h3>
            <p className="text-slate-500 text-xs">Ежемесячная выручка</p>
          </div>
          <span className="text-green-400 text-xs font-medium">+18% ↑</span>
        </div>
        <div className="flex items-end gap-1 h-24">
          {BARS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <motion.div
                className="w-full rounded-t"
                style={{
                  height: `${h}%`,
                  background: i === 11 ? 'linear-gradient(180deg, #a855f7, #7c3aed)' : 'rgba(168,85,247,0.2)',
                  minHeight: 3,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.04 }}
              />
              <span className="text-slate-600" style={{ fontSize: 8 }}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Активность */}
      <motion.div
        className="glass rounded-2xl p-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
      >
        <h3 className="text-white font-semibold text-sm mb-3">Последняя активность</h3>
        <div className="space-y-3">
          {ACTIVITY.map((a, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: `${a.color}25`, border: `1px solid ${a.color}40`, color: a.color }}>
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

      {/* Быстрые действия */}
      <motion.div
        className="glass rounded-2xl p-4"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
      >
        <h3 className="text-white font-semibold text-sm mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Новый проект', color: '#a855f7', icon: '🚀' },
            { label: 'Пригласить', color: '#22d3ee', icon: '👥' },
            { label: 'Аналитика', color: '#f472b6', icon: '📊' },
            { label: 'Интеграции', color: '#34d399', icon: '⚡' },
          ].map(action => (
            <motion.button
              key={action.label}
              className="flex items-center gap-2 p-3 rounded-xl glass-hover text-left"
              style={{ background: `${action.color}10`, border: `1px solid ${action.color}25` }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-xs font-medium" style={{ color: action.color }}>{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Рейтинг */}
      <motion.div
        className="glass rounded-2xl p-4 flex items-center justify-between"
        style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.04)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(251,191,36,0.15)' }}>
            <Star size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Рейтинг — Excellent</p>
            <p className="text-slate-400 text-xs">98-й процентиль</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(s => (
            <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + s * 0.08 }}>
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
