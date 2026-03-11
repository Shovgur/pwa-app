import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Zap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wallet,
  Rocket,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд', color: '#a855f7' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Аналитика', color: '#22d3ee' },
  { to: '/dashboard/users', icon: Users, label: 'Пользователи', color: '#f472b6' },
  { to: '/dashboard/messages', icon: MessageSquare, label: 'Сообщения', color: '#34d399', badge: 3 },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Кошелёк', color: '#fbbf24' },
  { to: '/dashboard/ai', icon: Sparkles, label: 'AI Assistant', color: '#818cf8' },
  { to: '/dashboard/projects', icon: Rocket, label: 'Проекты', color: '#fb923c' },
]

const BOTTOM_ITEMS = [
  { to: '/dashboard/notifications', icon: Bell, label: 'Уведомления', color: '#94a3b8', badge: 5 },
  { to: '/dashboard/settings', icon: Settings, label: 'Настройки', color: '#94a3b8' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-full flex flex-col glass"
      style={{
        borderRight: '1px solid rgba(255,255,255,0.06)',
        flexShrink: 0,
      }}
    >
      {/* Toggle button */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-8 z-50 w-7 h-7 rounded-full flex items-center justify-center glass neon-border"
        style={{ background: '#0f0f2e' }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(124,58,237,0.6)' }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
          <ChevronLeft size={14} className="text-purple-400" />
        </motion.div>
      </motion.button>

      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 overflow-hidden">
        <motion.div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          animate={{ boxShadow: ['0 0 10px rgba(124,58,237,0.4)', '0 0 20px rgba(124,58,237,0.7)', '0 0 10px rgba(124,58,237,0.4)'] }}
          transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
        >
          <Zap size={18} className="text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-black text-lg gradient-text whitespace-nowrap"
            >
              NEXUS
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3 mb-4">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="px-3 my-3">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* Bottom items */}
      <div className="px-2 space-y-1 pb-2">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </div>

      <div className="px-3 mb-3">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
      </div>

      {/* User */}
      <div className="px-3 pb-4">
        <motion.div
          className="flex items-center gap-3 p-2.5 rounded-xl glass-hover glass cursor-pointer overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          whileHover={{ x: 2 }}
          onClick={handleLogout}
          title="Выйти"
        >
          <motion.div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            animate={{ boxShadow: ['0 0 8px rgba(124,58,237,0.3)', '0 0 16px rgba(124,58,237,0.5)', '0 0 8px rgba(124,58,237,0.3)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            {user?.avatar ?? 'U'}
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LogOut size={15} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.aside>
  )
}

interface NavItemProps {
  item: {
    to: string
    icon: React.FC<{ size?: number; className?: string; color?: string }>
    label: string
    color: string
    badge?: number
  }
  collapsed: boolean
}

function NavItem({ item, collapsed }: NavItemProps) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      className="block"
    >
      {({ isActive }) => (
        <motion.div
          className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer overflow-hidden"
          style={{
            background: isActive ? `${item.color}18` : 'transparent',
            border: isActive ? `1px solid ${item.color}35` : '1px solid transparent',
          }}
          whileHover={{
            background: `${item.color}12`,
            x: 2,
          }}
          transition={{ duration: 0.15 }}
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
              style={{ background: item.color }}
            />
          )}

          <motion.div
            className="flex-shrink-0 relative"
            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon
              size={18}
              className="transition-all"
              color={isActive ? item.color : '#64748b'}
            />
            {item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                style={{ fontSize: 9, background: item.color }}
              >
                {item.badge}
              </motion.span>
            )}
          </motion.div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium whitespace-nowrap"
                style={{ color: isActive ? item.color : '#94a3b8' }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </NavLink>
  )
}

export { ChevronRight }
