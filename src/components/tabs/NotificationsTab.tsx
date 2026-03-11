import { fadeUpContainer } from '../../utils/variants'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Trash2, X } from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'success', icon: '✅', title: 'Проект завершён', message: 'API v3 успешно завершён и запущен в production', time: '2 мин назад', read: false, color: '#34d399' },
  { id: 2, type: 'info', icon: '💬', title: 'Новое сообщение', message: 'Мария Смирнова написала вам сообщение', time: '15 мин назад', read: false, color: '#22d3ee' },
  { id: 3, type: 'warning', icon: '⚠️', title: 'Близко к лимиту', message: 'Использовано 85% дискового пространства', time: '1 час назад', read: false, color: '#fbbf24' },
  { id: 4, type: 'info', icon: '👥', title: 'Новый пользователь', message: 'Иван Новиков присоединился к платформе', time: '2 часа назад', read: true, color: '#a855f7' },
  { id: 5, type: 'success', icon: '💰', title: 'Платёж получен', message: 'Зачислено +15,000 ₽ на ваш счёт', time: '3 часа назад', read: true, color: '#34d399' },
  { id: 6, type: 'error', icon: '🔴', title: 'Ошибка сервиса', message: 'Временный сбой в работе API. Устраняем', time: '5 часов назад', read: true, color: '#f87171' },
]

export function NotificationsTab() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifications.filter((n) => !n.read).length
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function remove(id: number) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function markRead(id: number) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <motion.div
      className="p-6 space-y-5"
      variants={fadeUpContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={22} className="text-white" />
            {unreadCount > 0 && (
              <motion.div
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ background: '#a855f7', fontSize: 10 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {unreadCount}
              </motion.div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Уведомления</h1>
            <p className="text-slate-400 text-sm">{unreadCount > 0 ? `${unreadCount} непрочитанных` : 'Всё прочитано'}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <motion.button
            onClick={markAllRead}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-green-400 glass"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Check size={14} />
            Прочитать все
          </motion.button>
        )}
      </motion.div>

      {/* Filter */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {(['all', 'unread'] as const).map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm"
            style={{
              background: filter === f ? 'rgba(168,85,247,0.2)' : 'transparent',
              color: filter === f ? '#a855f7' : '#64748b',
              border: filter === f ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {f === 'all' ? 'Все' : 'Непрочитанные'}
          </motion.button>
        ))}
      </motion.div>

      {/* Notifications list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((n, i) => (
            <motion.div
              key={n.id}
              className="glass rounded-2xl p-4 relative"
              style={{
                border: n.read ? '1px solid rgba(255,255,255,0.04)' : `1px solid ${n.color}30`,
                background: n.read ? undefined : `${n.color}08`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.05 }}
              layout
            >
              {!n.read && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-full"
                  style={{ background: n.color, left: 0, borderRadius: '0 4px 4px 0' }}
                />
              )}
              <div className="flex items-start gap-4 pl-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${n.color}15` }}
                >
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? 'text-slate-300' : 'text-white'}`}>
                      {n.title}
                    </p>
                    <span className="text-slate-600 text-xs flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-0.5">{n.message}</p>
                </div>
                <div className="flex gap-1.5">
                  {!n.read && (
                    <motion.button
                      onClick={() => markRead(n.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-green-400 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Check size={14} />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={() => remove(n.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-slate-500">Нет уведомлений</p>
          </motion.div>
        )}
      </div>

      {notifications.length > 0 && (
        <motion.button
          onClick={() => setNotifications([])}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-400 transition-colors"
          whileHover={{ x: 2 }}
        >
          <Trash2 size={14} />
          Очистить все
        </motion.button>
      )}
    </motion.div>
  )
}
