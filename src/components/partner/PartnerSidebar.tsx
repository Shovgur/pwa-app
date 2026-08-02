import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Settings, LogOut } from 'lucide-react'
import { usePartnerAuth } from '../../contexts/PartnerAuthContext'
import { APP_ICON_SRC } from '../../config/branding'

const NAV = [
  { to: '/partner/dashboard', icon: Home,     label: 'Главная',   end: true },
  { to: '/partner/settings',  icon: Settings, label: 'Настройки', end: false },
]

/** Содержимое навигации кабинета партнёра — используется и в десктопном
 * сайдбаре, и в мобильной выдвижной панели. */
export function PartnerSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { partner, logoutPartner } = usePartnerAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutPartner()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Логотип */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <img src={APP_ICON_SRC} alt="BookinGo" width={36} height={36} style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>BookinGo</div>
            <div style={{ fontSize: 10, color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em' }}>ПАРТНЁР</div>
          </div>
        </div>

        {/* Имя компании партнёра */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: 'linear-gradient(135deg, #22c55e, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
            {(partner?.companyName || '?').trim().slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {partner?.companyName || 'Загрузка...'}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {partner?.email || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(item => {
          const Icon = item.icon
          return (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 12,
                  background: isActive ? 'rgba(34,197,94,0.15)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <Icon size={18} color={isActive ? '#22c55e' : '#64748b'} />
                  <span style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? '#22c55e' : '#94a3b8' }}>
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Выйти */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '11px 14px',
            borderRadius: 12,
            border: 'none',
            background: 'transparent',
            color: '#f87171',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </div>
  )
}
