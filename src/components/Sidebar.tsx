import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Search, CalendarCheck, MapPin, User,
  Settings, Bell, LogOut, ChevronLeft, Globe, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useBookings } from '../contexts/BookingContext'

type NavEntry = {
  to: string
  icon: React.FC<{ size?: number; color?: string }>
  label: string
  color: string
  badge?: number
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const navigate = useNavigate()

  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length
  const notifCount = 3

  const NAV: NavEntry[] = [
    { to: '/dashboard',          icon: Home,          label: 'Главная',      color: '#22c55e' },
    { to: '/dashboard/courts',   icon: Search,        label: 'Площадки',     color: '#3b82f6' },
    { to: '/dashboard/bookings', icon: CalendarCheck, label: 'Бронирования', color: '#f97316', badge: upcomingCount },
    { to: '/dashboard/map',      icon: MapPin,        label: 'Карта',        color: '#a855f7' },
    { to: '/dashboard/profile',  icon: User,          label: 'Профиль',      color: '#06b6d4' },
  ]

  const BOTTOM: NavEntry[] = [
    { to: '/dashboard/notifications', icon: Bell,     label: 'Уведомления',  color: '#94a3b8', badge: notifCount },
    { to: '/dashboard/settings',      icon: Settings, label: 'Настройки',    color: '#94a3b8' },
  ]

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 224 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full relative"
      style={{
        background: 'linear-gradient(180deg, #111827 0%, #0f1623 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}
    >
      {/* Logo row */}
      <div style={{
        padding: '16px 16px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
        }}>
          ⚡
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              style={{ minWidth: 0 }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>BookinGo</div>
              <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, letterSpacing: '0.06em' }}>КАБИНЕТ</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ height: 1, margin: '0 12px 12px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Основная навигация */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </nav>

      <div style={{ height: 1, margin: '8px 12px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Нижние пункты */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BOTTOM.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </div>

      <div style={{ height: 1, margin: '0 12px 8px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Collapse / expand button */}
      <div style={{ padding: '0 8px 4px' }}>
        <motion.button
          onClick={() => setCollapsed(v => !v)}
          whileHover={{ background: 'rgba(255,255,255,0.07)' }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, padding: '9px 12px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'transparent',
            cursor: 'pointer',
          }}
          aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={16} color="#64748b" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.13 }}
                style={{ fontSize: 13, fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap' }}
              >
                Свернуть
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div style={{ height: 1, margin: '4px 12px 8px', background: 'rgba(255,255,255,0.06)' }} />

      {/* На сайт */}
      <div style={{ padding: '0 8px 8px' }}>
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          {() => (
            <motion.div
              style={{
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 10, padding: '9px 12px', borderRadius: 12,
                background: 'rgba(34,197,94,0.07)',
                border: '1px solid rgba(34,197,94,0.18)',
                cursor: 'pointer',
              }}
              whileHover={{ background: 'rgba(34,197,94,0.13)' }}
            >
              <Globe size={17} color="#22c55e" style={{ flexShrink: 0 }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    style={{ fontSize: 13, fontWeight: 600, color: '#22c55e', whiteSpace: 'nowrap', flex: 1 }}
                  >
                    На сайт
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && <ChevronRight size={13} color="rgba(34,197,94,0.5)" />}
            </motion.div>
          )}
        </NavLink>
      </div>

      {/* Пользователь + выход */}
      <div style={{ padding: '0 8px 16px' }}>
        <motion.div
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10, padding: '10px 12px',
            borderRadius: 14,
            cursor: 'pointer', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
          whileHover={{ background: 'rgba(255,255,255,0.04)' }}
          onClick={() => { logout(); navigate('/') }}
          title="Выйти"
        >
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>
            {user?.avatar ?? 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && <LogOut size={14} color="#64748b" style={{ flexShrink: 0 }} />}
        </motion.div>
      </div>
    </motion.aside>
  )
}

function NavItem({ item, collapsed }: { item: NavEntry; collapsed: boolean }) {
  const Icon = item.icon
  return (
    <NavLink to={item.to} end={item.to === '/dashboard'} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          padding: '9px 12px',
          borderRadius: 12,
          background: isActive ? `${item.color}1a` : 'transparent',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.15s',
        }}>
          {/* Active indicator bar */}
          <div style={{
            position: 'absolute', left: 0,
            top: '50%', transform: 'translateY(-50%)',
            width: 3, height: 18,
            borderRadius: '0 3px 3px 0',
            background: item.color,
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.15s',
          }} />

          {/* Icon + badge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Icon size={17} color={isActive ? item.color : '#64748b'} />
            {item.badge != null && item.badge > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -6,
                minWidth: 14, height: 14, borderRadius: 7,
                background: item.color, color: '#fff',
                fontSize: 8, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px', lineHeight: 1,
              }}>
                {item.badge}
              </span>
            )}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? item.color : '#94a3b8',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}
    </NavLink>
  )
}
