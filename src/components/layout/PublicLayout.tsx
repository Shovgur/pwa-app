import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { SiteAmbientBg } from './SiteAmbientBg'
import { PwaSafeArea } from '../PwaSafeArea'
import { colors } from '../../theme/tokens'

const NAV = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Площадки' },
  { to: '/how-it-works', label: 'Как это работает' },
]

export function PublicLayout() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  function closeMobile() { setMobileOpen(false) }

  // Закрываем при смене роута
  useEffect(() => { closeMobile() }, [pathname])

  // Блокируем скролл под оверлеем
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="site-shell" style={{ color: colors.text }}>
      <PwaSafeArea />
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

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/catalog" className="site-header-cta" style={{ textDecoration: 'none' }}>
              <Button size="sm">Забронировать</Button>
            </Link>
            <button className="site-header-burger" onClick={() => setMobileOpen(v => !v)} aria-label="Меню">
              <motion.div animate={{ rotate: mobileOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen mobile overlay — через портал поверх всего */}
      {createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
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

              {/* Menu panel */}
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'fixed',
                  top: 16, left: 16, right: 16,
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
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24 }}>
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
                            padding: '16px 18px', borderRadius: 16, textDecoration: 'none',
                            fontSize: 18, fontWeight: active ? 700 : 500,
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

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link to="/catalog" onClick={closeMobile} style={{ textDecoration: 'none', display: 'block' }}>
                    <Button style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16 }}>
                      Найти площадку →
                    </Button>
                  </Link>
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
