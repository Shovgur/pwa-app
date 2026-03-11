import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, CalendarCheck, MapPin, User, Settings, Bell, LogOut, ChevronLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV = [
  { to: '/dashboard', icon: Home, label: 'Главная', color: '#22c55e' },
  { to: '/dashboard/courts', icon: Search, label: 'Площадки', color: '#3b82f6' },
  { to: '/dashboard/bookings', icon: CalendarCheck, label: 'Бронирования', color: '#f97316', badge: 2 },
  { to: '/dashboard/map', icon: MapPin, label: 'Карта', color: '#a855f7' },
  { to: '/dashboard/profile', icon: User, label: 'Профиль', color: '#06b6d4' },
]

const BOTTOM = [
  { to: '/dashboard/notifications', icon: Bell, label: 'Уведомления', color: '#94a3b8', badge: 3 },
  { to: '/dashboard/settings', icon: Settings, label: 'Настройки', color: '#94a3b8' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 224 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full relative"
      style={{ background: '#141f2e', borderRight: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}
    >
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-7 z-50 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: '#1a2840', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
          <ChevronLeft size={13} color="#94a3b8" />
        </motion.div>
      </motion.button>

      {/* Лого */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>⚡</div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>SportBook</div>
              <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, letterSpacing: 0.5 }}>БРОНИРОВАНИЕ</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ height: 1, margin: '0 16px 12px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Основная навигация */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </nav>

      <div style={{ height: 1, margin: '8px 16px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Нижние пункты */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BOTTOM.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </div>

      <div style={{ height: 1, margin: '0 16px 12px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Юзер */}
      <div style={{ padding: '0 8px 16px' }}>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, cursor: 'pointer', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}
          whileHover={{ background: 'rgba(255,255,255,0.05)' }}
          onClick={() => { logout(); navigate('/login') }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #22c55e, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.avatar ?? 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                <p style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && <LogOut size={14} color="#64748b" style={{ flexShrink: 0 }} />}
        </motion.div>
      </div>
    </motion.aside>
  )
}

function NavItem({ item, collapsed }: {
  item: { to: string; icon: React.FC<{ size?: number; color?: string }>; label: string; color: string; badge?: number }
  collapsed: boolean
}) {
  const Icon = item.icon
  return (
    <NavLink to={item.to} end={item.to === '/dashboard'} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <motion.div
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
            background: isActive ? `${item.color}18` : 'transparent',
            border: isActive ? `1px solid ${item.color}30` : '1px solid transparent',
            cursor: 'pointer', position: 'relative',
          }}
          whileHover={{ background: `${item.color}10`, x: 2 }}
          transition={{ duration: 0.15 }}
        >
          {isActive && (
            <motion.div layoutId="sidebarActive"
              style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: '0 3px 3px 0', background: item.color }} />
          )}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Icon size={18} color={isActive ? item.color : '#64748b'} />
            {item.badge && (
              <span style={{ position: 'absolute', top: -5, right: -5, width: 14, height: 14, borderRadius: '50%', background: item.color, color: '#fff', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {item.badge}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: isActive ? item.color : '#94a3b8', whiteSpace: 'nowrap' }}>
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </NavLink>
  )
}
