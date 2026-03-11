import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, X } from 'lucide-react'

const INITIAL = [
  { id: 1, icon: '✅', title: 'Бронирование подтверждено', msg: 'Корт "Спарта" — 11 марта, 18:00', time: '2 мин', read: false, color: '#22c55e' },
  { id: 2, icon: '⏰', title: 'Напоминание', msg: 'Через 1 час: Поле "Олимп" 5×5', time: '59 мин', read: false, color: '#3b82f6' },
  { id: 3, icon: '🎾', title: 'Новая площадка', msg: 'Открылся корт "Динамо" в вашем районе', time: '2 ч', read: false, color: '#f97316' },
  { id: 4, icon: '💰', title: 'Кэшбэк начислен', msg: '+180 ₽ за бронирование в Лужниках', time: '5 ч', read: true, color: '#22c55e' },
  { id: 5, icon: '⭐', title: 'Оцените визит', msg: 'Как вам Arena ЦСКА? Оставьте отзыв', time: '1 д', read: true, color: '#f59e0b' },
]

export function NotificationsTab() {
  const [items, setItems] = useState(INITIAL)
  const unread = items.filter(n => !n.read).length

  function markAllRead() { setItems(prev => prev.map(n => ({ ...n, read: true }))) }
  function remove(id: number) { setItems(prev => prev.filter(n => n.id !== id)) }
  function read(id: number) { setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)) }

  return (
    <div style={{ padding: '24px 20px', paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Уведомления</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>{unread > 0 ? `${unread} непрочитанных` : 'Всё прочитано'}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 100, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            <Check size={13} /> Прочитать все
          </button>
        )}
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence>
          {items.map((n, i) => (
            <motion.div key={n.id} className="card"
              style={{ padding: '14px 16px', borderLeft: `3px solid ${n.read ? 'transparent' : n.color}`, opacity: n.read ? 0.7 : 1 }}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: n.read ? 0.7 : 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, overflow: 'hidden', padding: 0, marginBottom: 0 }}
              transition={{ delay: i * 0.05 }} layout>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: `${n.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{n.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3, gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</span>
                    <span style={{ fontSize: 11, color: '#475569', flexShrink: 0 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{n.msg}</p>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {!n.read && (
                    <button onClick={() => read(n.id)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#22c55e' }}>
                      <Check size={13} />
                    </button>
                  )}
                  <button onClick={() => remove(n.id)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Bell size={48} color="#243354" style={{ marginBottom: 12 }} />
            <p style={{ color: '#64748b', fontSize: 15 }}>Нет уведомлений</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
