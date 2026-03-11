import { fadeUpContainer } from '../../utils/variants'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, UserPlus, MoreVertical, Shield, User, Crown } from 'lucide-react'

const USERS = [
  { id: 1, avatar: 'АР', name: 'Алексей Романов', email: 'a.romanov@nexus.app', role: 'Admin', status: 'online', joined: '12 янв 2026', color: '#a855f7' },
  { id: 2, avatar: 'МС', name: 'Мария Смирнова', email: 'm.smirnova@nexus.app', role: 'Pro', status: 'online', joined: '15 янв 2026', color: '#22d3ee' },
  { id: 3, avatar: 'ДК', name: 'Дмитрий Козлов', email: 'd.kozlov@nexus.app', role: 'User', status: 'offline', joined: '20 янв 2026', color: '#f472b6' },
  { id: 4, avatar: 'ЕВ', name: 'Елена Волкова', email: 'e.volkova@nexus.app', role: 'Pro', status: 'online', joined: '25 янв 2026', color: '#34d399' },
  { id: 5, avatar: 'ИН', name: 'Иван Новиков', email: 'i.novikov@nexus.app', role: 'User', status: 'away', joined: '1 фев 2026', color: '#fbbf24' },
  { id: 6, avatar: 'АП', name: 'Анна Петрова', email: 'a.petrova@nexus.app', role: 'User', status: 'offline', joined: '3 фев 2026', color: '#818cf8' },
]

const ROLE_ICONS: Record<string, typeof Shield> = {
  Admin: Crown,
  Pro: Shield,
  User: User,
}

const ROLE_COLORS: Record<string, string> = {
  Admin: '#fbbf24',
  Pro: '#a855f7',
  User: '#64748b',
}

const STATUS_COLORS: Record<string, string> = {
  online: '#34d399',
  away: '#fbbf24',
  offline: '#475569',
}

export function UsersTab() {
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('Все')

  const filtered = USERS.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = selectedRole === 'Все' || u.role === selectedRole
    return matchSearch && matchRole
  })

  return (
    <motion.div
      className="p-6 space-y-6"
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
          <h1 className="text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-slate-400 text-sm mt-1">Управление командой · {USERS.length} участников</p>
        </div>
        <motion.button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
          whileTap={{ scale: 0.95 }}
        >
          <UserPlus size={16} />
          Добавить
        </motion.button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск пользователей..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-white placeholder-slate-500 outline-none text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-slate-500 flex-shrink-0" />
          {['Все', 'Admin', 'Pro', 'User'].map((role) => (
            <motion.button
              key={role}
              onClick={() => setSelectedRole(role)}
              className="px-3 py-2 rounded-xl text-sm"
              style={{
                background: selectedRole === role ? 'rgba(168,85,247,0.2)' : 'transparent',
                color: selectedRole === role ? '#a855f7' : '#64748b',
                border: selectedRole === role ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {role}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Users list */}
      <motion.div
        className="glass rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <AnimatePresence>
          {filtered.map((user, i) => {
            const RoleIcon = ROLE_ICONS[user.role]
            return (
              <motion.div
                key={user.id}
                className="flex items-center gap-4 p-4 glass-hover cursor-pointer"
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `${user.color}30`, border: `1px solid ${user.color}50`, color: user.color }}
                  >
                    {user.avatar}
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                    style={{ background: STATUS_COLORS[user.status], borderColor: '#0a0a1a' }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-slate-500 text-xs truncate">{user.email}</p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{ background: `${ROLE_COLORS[user.role]}20` }}>
                  <RoleIcon size={12} style={{ color: ROLE_COLORS[user.role] }} />
                  <span className="text-xs font-medium" style={{ color: ROLE_COLORS[user.role] }}>
                    {user.role}
                  </span>
                </div>

                <span className="hidden md:block text-slate-600 text-xs">{user.joined}</span>

                <motion.button
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                  whileHover={{ rotate: 90 }}
                >
                  <MoreVertical size={16} />
                </motion.button>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            className="p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-slate-500">Пользователи не найдены</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
