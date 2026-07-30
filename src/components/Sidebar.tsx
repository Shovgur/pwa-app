import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Search, CalendarCheck, MapPin, User,
  Settings, Bell, LogOut, ChevronLeft,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useBookings } from '../contexts/BookingContext'
import { APP_ICON_SRC } from '../config/branding'

type NavEntry = {
  to: string
  icon: React.FC<{ size?: number; color?: string }>
  label: string
  color: string
  badge?: number
}

const SIDEBAR_BG = '#1E293B'
const HEADER_H = 94

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
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full relative"
      style={{
        background: SIDEBAR_BG,
        borderRight: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        overflow: 'visible',
      }}
    >
      {/* Logo — высота совпадает с топбаром (94px) */}
      <div style={{
        height: HEADER_H,
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        overflow: 'hidden',
        flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <img
          src={APP_ICON_SRC}
          alt="BookinGo"
          width={36}
          height={36}
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            flexShrink: 0,
            display: 'block',
          }}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              style={{ minWidth: 0 }}
            >
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', fontFamily: 'var(--font-display)' }}>
                BookinGo
              </div>
              <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em' }}>
                КАБИНЕТ
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Основная навигация */}
      <nav style={{
        flex: 1,
        padding: '28px 8px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
      }}>
        {NAV.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </nav>

      <div style={{ height: 1, margin: '8px 12px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Нижние пункты */}
      <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {BOTTOM.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </div>

      <div style={{ height: 1, margin: '4px 12px 8px', background: 'rgba(255,255,255,0.06)' }} />

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

      {/* Кнопка сворачивания на границе сайдбара (поверх правой панели) */}
      <motion.button
        onClick={() => setCollapsed(v => !v)}
        whileHover={{ scale: 1.08, background: '#2A3548' }}
        whileTap={{ scale: 0.95 }}
        aria-label={collapsed ? 'Развернуть' : 'Свернуть'}
        style={{
          position: 'absolute',
          right: -14,
          top: (HEADER_H - 28) / 2,
          zIndex: 40,
          width: 28,
          height: 28,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.12)',
          background: SIDEBAR_BG,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <ChevronLeft size={14} color="#64748b" />
        </motion.div>
      </motion.button>
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
          borderRadius: 10,
          background: isActive ? `${item.color}26` : 'transparent',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.15s',
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Icon size={17} color={isActive ? item.color : '#64748b'} />
            {item.badge != null && item.badge > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -6,
                minWidth: 14, height: 14, borderRadius: 7,
                background: item.color, color: '#0A0E17',
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
                  fontWeight: isActive ? 600 : 500,
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
