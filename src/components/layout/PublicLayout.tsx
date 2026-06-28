import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { SiteAmbientBg } from './SiteAmbientBg'
import { colors } from '../../theme/tokens'

const NAV = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Площадки' },
  { to: '/how-it-works', label: 'Как это работает' },
]

export function PublicLayout() {
  const { pathname } = useLocation()

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
            paddingTop: 18,
            paddingBottom: 18,
            gap: 32,
          }}
        >
          {/* Logo */}
          <Logo />

          {/* Nav — абсолютно по центру */}
          <nav className="site-header-nav" style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 32,
            }}
          >
            {NAV.map(({ to, label }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
              return (
                <Link
                  key={to}
                  to={to}
                  style={{ position: 'relative', textDecoration: 'none' }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? colors.text : colors.text2,
                      transition: 'color 0.18s',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      style={{
                        position: 'absolute',
                        bottom: -22,
                        left: 0,
                        right: 0,
                        height: 2,
                        borderRadius: 2,
                        background: colors.green,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right — CTA */}
          <Link to="/catalog" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <Button size="sm">Забронировать</Button>
          </Link>
        </div>
      </motion.header>

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
