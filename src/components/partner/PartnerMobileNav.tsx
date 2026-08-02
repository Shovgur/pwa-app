import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Settings, LogOut } from 'lucide-react'
import { usePartnerAuth } from '../../contexts/PartnerAuthContext'

const NAV = [
  { to: '/partner/dashboard', icon: Home,     label: 'Главная',   end: true },
  { to: '/partner/settings',  icon: Settings, label: 'Настройки', end: false },
]

export function PartnerMobileNav() {
  const { logoutPartner } = usePartnerAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutPartner()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(15, 22, 35, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '6px 4px' }}>
        {NAV.map(item => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.end} style={{ flex: 1, textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 4px', borderRadius: 14,
                  background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: isActive ? 24 : 0, height: 2.5, borderRadius: 2,
                    background: '#22c55e', transition: 'width 0.25s ease',
                  }} />
                  <Icon size={22} color={isActive ? '#22c55e' : '#64748b'} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? '#22c55e' : '#64748b' }}>
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          )
        })}

        <button
          type="button"
          onClick={handleLogout}
          style={{ flex: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 14 }}>
            <LogOut size={22} color="#64748b" />
            <span style={{ fontSize: 10, fontWeight: 400, color: '#64748b' }}>Выйти</span>
          </div>
        </button>
      </div>
    </div>
  )
}
