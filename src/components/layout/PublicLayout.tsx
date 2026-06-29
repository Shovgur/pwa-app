import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Menu, X, ArrowRight, LogOut, Settings,
  CalendarCheck, LayoutDashboard, HelpCircle,
} from 'lucide-react'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { SiteAmbientBg } from './SiteAmbientBg'
import { colors } from '../../theme/tokens'
import { useAuth } from '../../contexts/AuthContext'
import { useBookings } from '../../contexts/BookingContext'

const NAV = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Площадки' },
  { to: '/how-it-works', label: 'Как это работает' },
]

/* ── Аватар-кнопка + выпадающее меню пользователя ─────────────────── */
function UserMenu() {
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeCount = bookings.filter(b => b.status === 'upcoming').length

  // Закрываем при клике вне
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleLogout() {
    setOpen(false)
    logout()
    navigate('/')
  }

  const initials = user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Аватар-кнопка */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'relative',
          width: 38,
          height: 38,
          borderRadius: 12,
          border: open
            ? '1.5px solid rgba(34,197,94,0.6)'
            : '1.5px solid rgba(255,255,255,0.12)',
          background: open
            ? 'rgba(34,197,94,0.12)'
            : 'rgba(255,255,255,0.06)',
          cursor: 'pointer',
          color: colors.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.04em',
          flexShrink: 0,
          transition: 'border-color 0.18s, background 0.18s',
        }}
        aria-label="Меню пользователя"
        aria-expanded={open}
      >
        {initials}
        {/* Бейдж активных броней */}
        {activeCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4, right: -4,
            minWidth: 16, height: 16,
            borderRadius: 8,
            background: '#22C55E',
            color: '#0A0E17',
            fontSize: 9,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            border: '1.5px solid #0A0E17',
            lineHeight: 1,
          }}>
            {activeCount}
          </span>
        )}
      </motion.button>

      {/* Дропдаун */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              minWidth: 220,
              borderRadius: 16,
              background: 'rgba(14, 20, 32, 0.98)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
              overflow: 'hidden',
              zIndex: 10000,
            }}
          >
            {/* Шапка с именем */}
            <div style={{
              padding: '14px 16px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0 }}>
                {user?.name}
              </p>
              <p style={{ fontSize: 12, color: colors.muted, margin: '2px 0 0' }}>
                {user?.email}
              </p>
            </div>

            {/* Пункты меню */}
            <div style={{ padding: '6px 0' }}>
              <DropItem
                icon={<CalendarCheck size={15} />}
                label="Мои брони"
                badge={activeCount}
                onClick={() => { setOpen(false); navigate('/dashboard/bookings') }}
              />
              <DropItem
                icon={<LayoutDashboard size={15} />}
                label="Личный кабинет"
                onClick={() => { setOpen(false); navigate('/dashboard') }}
              />
              <DropItem
                icon={<HelpCircle size={15} />}
                label="Как это работает"
                onClick={() => { setOpen(false); navigate('/how-it-works') }}
              />
              <DropItem
                icon={<Settings size={15} />}
                label="Настройки"
                onClick={() => { setOpen(false); navigate('/dashboard/settings') }}
              />
            </div>

            {/* Выход */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '6px 0' }}>
              <DropItem
                icon={<LogOut size={15} />}
                label="Выйти"
                danger
                onClick={handleLogout}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface DropItemProps {
  icon: React.ReactNode
  label: string
  badge?: number
  danger?: boolean
  onClick: () => void
}
function DropItem({ icon, label, badge, danger, onClick }: DropItemProps) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 16px',
        background: hover
          ? (danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)')
          : 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: danger ? '#F87171' : colors.text2,
        fontSize: 13,
        fontWeight: 500,
        textAlign: 'left',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <span style={{ flexShrink: 0, opacity: 0.75 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{
          minWidth: 18, height: 18,
          borderRadius: 9,
          background: '#22C55E',
          color: '#0A0E17',
          fontSize: 10,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

/* ── Основной лейаут ────────────────────────────────────────────────── */
export function PublicLayout() {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  function closeMobile() { setMobileOpen(false) }
  useEffect(() => { closeMobile() }, [pathname])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="site-shell" style={{ color: colors.text }}>
      <SiteAmbientBg />
      <div className="site-content">
        <motion.header
          className="site-header"
          style={{
            width: '100%',
            background: 'rgba(10, 14, 23, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="site-container site-header-inner"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 16,
              paddingBottom: 16,
              gap: 16,
            }}
          >
            <Logo />

            {/* Desktop nav */}
            <nav className="site-header-nav">
              {NAV.map(({ to, label }) => {
                const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
                return (
                  <Link key={to} to={to} style={{ position: 'relative', textDecoration: 'none' }}>
                    <span style={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? colors.text : colors.text2,
                      transition: 'color 0.18s',
                      letterSpacing: '-0.01em',
                    }}>
                      {label}
                    </span>
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        style={{
                          position: 'absolute', bottom: -19,
                          left: 0, right: 0, height: 2,
                          borderRadius: 2, background: colors.green,
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              {isAuthenticated ? (
                <>
                  {/* Авторизован: кнопка забронировать → каталог + аватар с дропдауном */}
                  <Link to="/catalog" className="site-header-cta" style={{ textDecoration: 'none' }}>
                    <Button size="sm">Забронировать</Button>
                  </Link>
                  <div className="site-header-user-menu">
                    <UserMenu />
                  </div>
                </>
              ) : (
                <>
                  {/* Не авторизован: Забронировать → логин */}
                  <Link to="/login" className="site-header-cta" style={{ textDecoration: 'none' }}>
                    <Button size="sm">Войти</Button>
                  </Link>
                  <Link to="/catalog" className="site-header-cta" style={{ textDecoration: 'none' }}>
                    <Button size="sm" variant="outline">Забронировать</Button>
                  </Link>
                </>
              )}

              {/* Burger — mobile only */}
              <button
                className="site-header-burger"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Меню"
              >
                <motion.div animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.div>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Mobile overlay */}
        {createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={closeMobile}
                  style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(5, 8, 14, 0.7)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, y: -16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'fixed',
                    top: 'calc(16px + env(safe-area-inset-top, 0px))',
                    left: 16, right: 16,
                    zIndex: 9999,
                    borderRadius: 24,
                    background: 'rgba(14, 20, 32, 0.97)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
                    overflow: 'hidden',
                    padding: '20px 20px 24px',
                  }}
                >
                  {/* Panel header */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: 28,
                  }}>
                    <Logo />
                    <button
                      onClick={closeMobile}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.06)',
                        cursor: 'pointer', color: colors.text2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Nav links */}
                  <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                    {NAV.map(({ to, label }, i) => {
                      const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
                      return (
                        <motion.div
                          key={to}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 + 0.05 }}
                        >
                          <Link
                            to={to}
                            onClick={closeMobile}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '14px 18px', borderRadius: 16, textDecoration: 'none',
                              fontSize: 17, fontWeight: active ? 700 : 500,
                              color: active ? '#fff' : colors.text2,
                              background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                              border: `1px solid ${active ? 'rgba(34,197,94,0.2)' : 'transparent'}`,
                            }}
                          >
                            {label}
                            {active && <ArrowRight size={16} color={colors.green} />}
                          </Link>
                        </motion.div>
                      )
                    })}
                  </nav>

                  {/* CTA кнопки */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    {isAuthenticated ? (
                      <>
                        <MobileUserSection closeMobile={closeMobile} />
                        <Link to="/catalog" onClick={closeMobile} style={{ textDecoration: 'none', display: 'block' }}>
                          <Button style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16 }}>
                            Забронировать →
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={closeMobile} style={{ textDecoration: 'none', display: 'block' }}>
                          <Button variant="ghost" style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16 }}>
                            Войти
                          </Button>
                        </Link>
                        <Link to="/catalog" onClick={closeMobile} style={{ textDecoration: 'none', display: 'block' }}>
                          <Button style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16 }}>
                            Забронировать →
                          </Button>
                        </Link>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}

        <main className="site-main">
          <Outlet />
        </main>

        <footer
          className={pathname.match(/^\/(sport|loft)\//) ? 'site-footer site-footer--compact' : 'site-footer'}
          style={{
            width: '100%',
            borderTop: `1px solid ${colors.border}`,
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div
            className="site-container"
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              paddingTop: 32,
              paddingBottom: 32,
            }}
          >
            <Logo to="/" />
            <p style={{ fontSize: 13, color: colors.muted }}>© 2026 BookinGo · Бронирование площадок</p>
            <div style={{ display: 'flex', gap: 24 }}>
              {['Политика', 'Поддержка', 'API'].map((l) => (
                <span key={l} style={{ fontSize: 13, color: colors.text2, cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* Блок авторизованного пользователя в мобильном меню */
function MobileUserSection({ closeMobile }: { closeMobile: () => void }) {
  const { user, logout } = useAuth()
  const { bookings } = useBookings()
  const navigate = useNavigate()
  const activeCount = bookings.filter(b => b.status === 'upcoming').length
  const initials = user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'U'

  function go(path: string) { closeMobile(); navigate(path) }

  return (
    <div style={{
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      marginBottom: 4,
    }}>
      {/* Пользователь */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#22C55E',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.text }}>{user?.name}</p>
          <p style={{ margin: 0, fontSize: 11, color: colors.muted }}>{user?.email}</p>
        </div>
      </div>

      {/* Пункты */}
      {[
        {
          icon: <CalendarCheck size={15} />, label: 'Мои брони',
          badge: activeCount, path: '/dashboard/bookings',
        },
        { icon: <LayoutDashboard size={15} />, label: 'Личный кабинет', path: '/dashboard' },
        { icon: <Settings size={15} />, label: 'Настройки', path: '/dashboard/settings' },
      ].map(({ icon, label, badge, path }) => (
        <button
          key={path}
          onClick={() => go(path)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '12px 16px',
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: colors.text2,
            fontSize: 14, fontWeight: 500, textAlign: 'left',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <span style={{ opacity: 0.7 }}>{icon}</span>
          <span style={{ flex: 1 }}>{label}</span>
          {badge != null && badge > 0 && (
            <span style={{
              minWidth: 18, height: 18, borderRadius: 9,
              background: '#22C55E', color: '#0A0E17',
              fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            }}>
              {badge}
            </span>
          )}
        </button>
      ))}

      {/* Выход */}
      <button
        onClick={() => { closeMobile(); logout(); navigate('/') }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '12px 16px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', color: '#F87171',
          fontSize: 14, fontWeight: 500, textAlign: 'left',
        }}
      >
        <LogOut size={15} style={{ opacity: 0.7 }} />
        Выйти
      </button>
    </div>
  )
}
