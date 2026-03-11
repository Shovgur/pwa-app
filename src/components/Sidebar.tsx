import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BarChart3, Users, MessageSquare,
  Settings, Bell, Zap, LogOut, ChevronLeft,
  Sparkles, Wallet, Rocket,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд', color: '#a855f7' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Аналитика', color: '#22d3ee' },
  { to: '/dashboard/users', icon: Users, label: 'Пользователи', color: '#f472b6' },
  { to: '/dashboard/messages', icon: MessageSquare, label: 'Сообщения', color: '#34d399', badge: 3 },
  { to: '/dashboard/wallet', icon: Wallet, label: 'Кошелёк', color: '#fbbf24' },
  { to: '/dashboard/ai', icon: Sparkles, label: 'AI', color: '#818cf8' },
  { to: '/dashboard/projects', icon: Rocket, label: 'Проекты', color: '#fb923c' },
  { to: '/dashboard/notifications', icon: Bell, label: 'Уведомления', color: '#94a3b8', badge: 5 },
  { to: '/dashboard/settings', icon: Settings, label: 'Настройки', color: '#94a3b8' },
]

// Мобильная нижняя навигация (первые 5 пунктов)
const MOBILE_NAV = NAV_ITEMS.slice(0, 5)

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* ===== Десктопный сайдбар ===== */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 220 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col h-full glass"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}
      >
        {/* Кнопка свернуть */}
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-7 z-50 w-7 h-7 rounded-full flex items-center justify-center glass neon-border"
          style={{ background: '#0f0f2e' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
            <ChevronLeft size={13} className="text-purple-400" />
          </motion.div>
        </motion.button>

        {/* Логотип */}
        <div className="px-3 py-4 flex items-center gap-3 overflow-hidden">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            animate={{ boxShadow: ['0 0 10px rgba(124,58,237,0.4)', '0 0 20px rgba(124,58,237,0.7)', '0 0 10px rgba(124,58,237,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={18} className="text-white" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="font-black text-base gradient-text whitespace-nowrap"
              >
                NEXUS
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-3 h-px mb-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />

        {/* Навигация */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(item => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
        </nav>

        <div className="mx-3 my-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

        {/* Юзер */}
        <div className="px-2 pb-4">
          <motion.div
            className="flex items-center gap-2.5 p-2.5 rounded-xl glass-hover glass cursor-pointer overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            whileHover={{ x: 2 }}
            onClick={handleLogout}
            title="Выйти"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}
            >
              {user?.avatar ?? 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && <LogOut size={14} className="text-slate-500 flex-shrink-0" />}
          </motion.div>
        </div>
      </motion.aside>

      {/* ===== Мобильная нижняя панель ===== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 glass"
        style={{
          zIndex: 100,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {MOBILE_NAV.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl relative"
              >
                {({ isActive }) => (
                  <>
                    <motion.div
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      className="relative"
                    >
                      <Icon size={22} color={isActive ? item.color : '#475569'} />
                      {item.badge && !isActive && (
                        <span
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                          style={{ background: item.color, fontSize: 8 }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                    <span
                      className="text-xs leading-none"
                      style={{ color: isActive ? item.color : '#475569', fontSize: 10 }}
                    >
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="mobileActive"
                        className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                        style={{ background: item.color }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
          {/* Кнопка выйти */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl"
          >
            <LogOut size={22} color="#475569" />
            <span style={{ color: '#475569', fontSize: 10 }} className="text-xs leading-none">Выйти</span>
          </button>
        </div>
      </nav>
    </>
  )
}

// Компонент одного пункта меню (десктоп)
function NavItem({ item, collapsed }: {
  item: { to: string; icon: React.FC<{ size?: number; color?: string; className?: string }>; label: string; color: string; badge?: number }
  collapsed: boolean
}) {
  const Icon = item.icon
  return (
    <NavLink to={item.to} end={item.to === '/dashboard'} className="block">
      {({ isActive }) => (
        <motion.div
          className="relative flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer overflow-hidden"
          style={{
            background: isActive ? `${item.color}18` : 'transparent',
            border: isActive ? `1px solid ${item.color}35` : '1px solid transparent',
          }}
          whileHover={{ background: `${item.color}12`, x: 2 }}
          transition={{ duration: 0.15 }}
        >
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
              style={{ background: item.color }}
            />
          )}
          <div className="flex-shrink-0 relative">
            <Icon size={17} color={isActive ? item.color : '#64748b'} />
            {item.badge && (
              <span
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                style={{ fontSize: 8, background: item.color }}
              >
                {item.badge}
              </span>
            )}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
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
