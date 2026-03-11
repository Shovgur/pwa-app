import { motion } from 'framer-motion'
import { fadeUpContainer, fadeUpItem } from '../../utils/variants'

const DONUT = [
  { label: 'Органика', value: 45, color: '#a855f7' },
  { label: 'Реклама', value: 30, color: '#22d3ee' },
  { label: 'Реферал', value: 15, color: '#f472b6' },
  { label: 'Прямой', value: 10, color: '#34d399' },
]

const LINE_DATA = [30, 50, 40, 80, 60, 90, 75, 100, 85, 110, 95, 130]

export function AnalyticsTab() {
  const total = LINE_DATA.reduce((a, b) => a + b, 0)
  const max = Math.max(...LINE_DATA)

  const points = LINE_DATA.map((v, i) => ({
    x: (i / (LINE_DATA.length - 1)) * 100,
    y: 100 - (v / max) * 85,
  }))

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = `${pathD} L 100 100 L 0 100 Z`

  return (
    <motion.div
      className="p-6 space-y-6"
      variants={fadeUpContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeUpItem}>
        <h1 className="text-2xl font-bold text-white">Аналитика</h1>
        <p className="text-slate-400 text-sm mt-1">Подробная статистика и метрики</p>
      </motion.div>

      {/* Line chart */}
      <motion.div
        variants={fadeUpItem}
        className="glass rounded-2xl p-6"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Тренд роста</h3>
          <span className="text-green-400 text-sm font-medium">+{Math.round((LINE_DATA[11] - LINE_DATA[0]) / LINE_DATA[0] * 100)}% за год</span>
        </div>
        <div className="relative h-48">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={areaD}
              fill="url(#lineGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />
            <motion.path
              d={pathD}
              fill="none"
              stroke="#a855f7"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            {points.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="1.2"
                fill="#a855f7"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              />
            ))}
          </svg>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut chart */}
        <motion.div
          variants={fadeUpItem}
          className="glass rounded-2xl p-6"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-white font-semibold mb-4">Источники трафика</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {DONUT.map((d, i) => {
                  const circumference = 2 * Math.PI * 15.9
                  const offset = DONUT.slice(0, i).reduce((a, b) => a + b.value, 0)
                  return (
                    <motion.circle
                      key={d.label}
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={d.color}
                      strokeWidth="3.8"
                      strokeDasharray={`${(d.value / 100) * circumference} ${circumference}`}
                      strokeDashoffset={-((offset / 100) * circumference)}
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray: `${(d.value / 100) * circumference} ${circumference}` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  )
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-bold text-lg">{total}</span>
                <span className="text-slate-500 text-xs">визитов</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {DONUT.map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-400 text-sm">{d.label}</span>
                  </div>
                  <span className="text-white text-sm font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top pages */}
        <motion.div
          variants={fadeUpItem}
          className="glass rounded-2xl p-6"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-white font-semibold mb-4">Топ страниц</h3>
          <div className="space-y-3">
            {[
              { page: '/dashboard', visits: 4821, pct: 100 },
              { page: '/analytics', visits: 3204, pct: 66 },
              { page: '/users', visits: 2100, pct: 43 },
              { page: '/projects', visits: 1850, pct: 38 },
              { page: '/settings', visits: 940, pct: 19 },
            ].map((p, i) => (
              <motion.div
                key={p.page}
                className="space-y-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-mono">{p.page}</span>
                  <span className="text-slate-500">{p.visits.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #7c3aed, #22d3ee)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${p.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
