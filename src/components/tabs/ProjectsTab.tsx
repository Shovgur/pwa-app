import { fadeUpContainer } from '../../utils/variants'
import { motion } from 'framer-motion'
import { Plus, Clock, CheckCircle2, AlertCircle, Rocket } from 'lucide-react'

const PROJECTS = [
  { id: 1, name: 'Nexus Dashboard', desc: 'Главная панель управления платформой', progress: 85, status: 'active', color: '#a855f7', members: ['АР', 'МС', 'ДК'], deadline: '25 мар 2026', tasks: { done: 17, total: 20 } },
  { id: 2, name: 'Mobile App', desc: 'iOS и Android приложение Nexus', progress: 42, status: 'active', color: '#22d3ee', members: ['ЕВ', 'ИН'], deadline: '15 апр 2026', tasks: { done: 8, total: 19 } },
  { id: 3, name: 'API v3', desc: 'Обновление REST API до версии 3.0', progress: 100, status: 'done', color: '#34d399', members: ['АР', 'ДК'], deadline: '28 фев 2026', tasks: { done: 12, total: 12 } },
  { id: 4, name: 'AI Integration', desc: 'Интеграция языковых моделей в платформу', progress: 15, status: 'pending', color: '#818cf8', members: ['МС', 'АП'], deadline: '1 мая 2026', tasks: { done: 2, total: 15 } },
  { id: 5, name: 'Analytics Engine', desc: 'Движок для обработки аналитических данных', progress: 67, status: 'active', color: '#f472b6', members: ['ИН', 'ЕВ', 'АР'], deadline: '10 апр 2026', tasks: { done: 10, total: 15 } },
]

const STATUS_CONFIG = {
  active: { icon: Rocket, label: 'Активный', color: '#a855f7' },
  done: { icon: CheckCircle2, label: 'Завершён', color: '#34d399' },
  pending: { icon: Clock, label: 'Ожидает', color: '#fbbf24' },
  blocked: { icon: AlertCircle, label: 'Заблокирован', color: '#f87171' },
}

export function ProjectsTab() {
  return (
    <motion.div
      className="p-4 pb-24 md:p-6 md:pb-6 space-y-4"
      variants={fadeUpContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Проекты</h1>
          <p className="text-slate-400 text-sm mt-1">{PROJECTS.length} проектов · {PROJECTS.filter(p => p.status === 'active').length} активных</p>
        </div>
        <motion.button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} />
          Создать
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROJECTS.map((project, i) => {
          const statusConf = STATUS_CONFIG[project.status as keyof typeof STATUS_CONFIG]
          const StatusIcon = statusConf.icon

          return (
            <motion.div
              key={project.id}
              className="glass rounded-2xl p-5 cursor-pointer"
              style={{ border: `1px solid ${project.color}20` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, borderColor: `${project.color}45` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${project.color}20` }}
                  >
                    🚀
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{project.name}</h3>
                    <p className="text-slate-500 text-xs">{project.desc}</p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: `${statusConf.color}20`, color: statusConf.color }}
                >
                  <StatusIcon size={11} />
                  {statusConf.label}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Прогресс</span>
                  <span style={{ color: project.color }}>{project.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${project.color}80, ${project.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Members */}
                <div className="flex -space-x-2">
                  {project.members.map((m, mi) => (
                    <motion.div
                      key={mi}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white border-2"
                      style={{
                        background: `hsl(${(mi * 60 + 240) % 360}, 70%, 55%)`,
                        borderColor: '#0a0a1a',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + mi * 0.05 }}
                    >
                      {m}
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    <span style={{ color: project.color }}>{project.tasks.done}</span>
                    /{project.tasks.total} задач
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {project.deadline}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
