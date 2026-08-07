import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Sparkles, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBookings } from '../../contexts/BookingContext'
import {
  computeAchievements,
  getAchievementStats,
  CATEGORY_META,
  TIER_META,
  type Achievement,
  type AchievementCategory,
} from '../../utils/achievements'

const FILTERS: Array<{ id: 'all' | AchievementCategory; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'bookings', label: 'Бронирования' },
  { id: 'sport', label: 'Спорт' },
  { id: 'explore', label: 'Исследование' },
  { id: 'special', label: 'Особые' },
]

export function AchievementsTab() {
  const { bookings } = useBookings()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | AchievementCategory>('all')

  const achievements = useMemo(() => computeAchievements(bookings), [bookings])
  const stats = useMemo(() => getAchievementStats(achievements), [achievements])

  const filtered = useMemo(
    () => filter === 'all' ? achievements : achievements.filter(a => a.category === filter),
    [achievements, filter],
  )

  const recentlyUnlocked = achievements.filter(a => a.unlocked).slice(0, 3)
  const nextUp = achievements
    .filter(a => !a.unlocked && a.progress > 0)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 2)

  return (
    <div className="dashboard-page">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 22 }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
          Достижения
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
          Зарабатывайте награды за активность и бронирования
        </p>
      </motion.div>

      {/* Hero — уровень и прогресс */}
      <motion.div
        className="achievements-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="achievements-hero-glow" />
        <div className="achievements-hero-inner">
          <div className="achievements-hero-left">
            <div className="achievements-level-badge">
              <Trophy size={28} color="#fff" />
            </div>
            <div>
              <p className="achievements-hero-eyebrow">Ваш уровень</p>
              <h2 className="achievements-hero-level">Уровень {stats.level}</h2>
              <p className="achievements-hero-xp">
                {stats.totalXp} XP · до след. уровня {stats.xpToNextLevel} XP
              </p>
            </div>
          </div>

          <div className="achievements-hero-stats">
            <div className="achievements-stat-pill">
              <span className="achievements-stat-value">{stats.unlockedCount}</span>
              <span className="achievements-stat-label">получено</span>
            </div>
            <div className="achievements-stat-pill">
              <span className="achievements-stat-value">{stats.total - stats.unlockedCount}</span>
              <span className="achievements-stat-label">осталось</span>
            </div>
            <div className="achievements-stat-pill achievements-stat-pill--accent">
              <span className="achievements-stat-value">{Math.round((stats.unlockedCount / stats.total) * 100)}%</span>
              <span className="achievements-stat-label">прогресс</span>
            </div>
          </div>
        </div>

        <div className="achievements-level-bar">
          <motion.div
            className="achievements-level-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${stats.levelProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Недавние / следующие */}
      {(recentlyUnlocked.length > 0 || nextUp.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 22 }}
        >
          {recentlyUnlocked.length > 0 && (
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles size={16} color="#eab308" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Полученные</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentlyUnlocked.map(a => (
                  <MiniAchievement key={a.id} achievement={a} />
                ))}
              </div>
            </div>
          )}

          {nextUp.length > 0 && (
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ChevronRight size={16} color="#22c55e" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Почти готово</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {nextUp.map(a => (
                  <MiniAchievement key={a.id} achievement={a} showProgress />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Фильтры */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}
      >
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 0.2s',
              background: filter === f.id ? '#22c55e' : '#222D3F',
              color: filter === f.id ? '#fff' : '#94a3b8',
            }}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Сетка достижений — без AnimatePresence/layout: фильтр меняется мгновенно */}
      <div className="achievements-grid">
        {filtered.map(a => (
          <AchievementCard key={a.id} achievement={a} />
        ))}
      </div>

      {stats.unlockedCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ marginTop: 20, padding: '28px 24px', textAlign: 'center' }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>
            Начните зарабатывать достижения
          </h3>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
            Забронируйте первую площадку — и откроется ваше первое достижение
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/courts')}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Выбрать площадку
          </button>
        </motion.div>
      )}
    </div>
  )
}

function MiniAchievement({ achievement: a, showProgress }: { achievement: Achievement; showProgress?: boolean }) {
  const tier = TIER_META[a.tier]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: a.unlocked ? `${a.color}25` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${a.unlocked ? `${a.color}40` : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {a.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {a.title}
        </div>
        {showProgress ? (
          <div style={{ marginTop: 6 }}>
            <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${a.progress}%`, background: a.color, borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>{a.current}/{a.target}</div>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: tier.color, marginTop: 2 }}>+{a.xp} XP · {tier.label}</div>
        )}
      </div>
    </div>
  )
}

function AchievementCard({ achievement: a }: { achievement: Achievement }) {
  const tier = TIER_META[a.tier]
  const cat = CATEGORY_META[a.category]
  const Icon = a.icon

  return (
    <div
      className={`achievement-card${a.unlocked ? ' achievement-card--unlocked' : ''}`}
      style={{
        '--achievement-color': a.color,
        '--achievement-glow': tier.glow,
      } as React.CSSProperties}
    >
      <div className="achievement-card-top">
        <div
          className="achievement-card-icon"
          style={{
            background: a.unlocked
              ? `linear-gradient(135deg, ${a.color}33, ${a.color}15)`
              : 'rgba(255,255,255,0.04)',
            borderColor: a.unlocked ? `${a.color}45` : 'rgba(255,255,255,0.08)',
            boxShadow: a.unlocked ? `0 8px 24px ${tier.glow}` : 'none',
          }}
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>{a.emoji}</span>
          <Icon
            size={12}
            color={a.unlocked ? a.color : '#475569'}
            style={{ position: 'absolute', bottom: 6, right: 6, opacity: 0.8 }}
          />
        </div>

        <div className="achievement-card-badges">
          <span
            className="achievement-tier-badge"
            style={{ color: tier.color, background: `${tier.color}18`, borderColor: `${tier.color}35` }}
          >
            {tier.label}
          </span>
          <span
            className="achievement-cat-badge"
            style={{ color: cat.color, background: `${cat.color}12` }}
          >
            {cat.label}
          </span>
        </div>
      </div>

      <h3 className="achievement-card-title">{a.title}</h3>
      <p className="achievement-card-desc">{a.description}</p>

      <div className="achievement-card-footer">
        <div className="achievement-progress-wrap">
          <div className="achievement-progress-bar">
            <div
              className="achievement-progress-fill"
              style={{
                width: `${a.progress}%`,
                background: a.unlocked ? a.color : `${a.color}88`,
              }}
            />
          </div>
          <span className="achievement-progress-text">
            {a.unlocked ? '✓ Получено' : `${a.current} / ${a.target}`}
          </span>
        </div>
        <span className="achievement-xp">+{a.xp} XP</span>
      </div>
    </div>
  )
}
