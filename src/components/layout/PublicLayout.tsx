import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { SiteAmbientBg } from './SiteAmbientBg'
import { colors } from '../../theme/tokens'

const NAV = [
  { to: '/', label: 'Главная' },
  { to: '/catalog', label: 'Площадки' },
  { to: '/#features', label: 'Как это работает' },
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
          background: 'rgba(10, 14, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.border}`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div
          className="site-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 18,
            paddingBottom: 18,
            gap: 24,
          }}
        >
          <Logo />
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {NAV.map(({ to, label }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to.replace('/#', ''))
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? colors.green : colors.text2,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">Войти</Button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button size="sm">Начать</Button>
            </Link>
          </div>
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
