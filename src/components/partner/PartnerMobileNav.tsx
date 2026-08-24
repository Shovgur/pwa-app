import { NavLink, useNavigate } from 'react-router-dom'
import { Building2, ClipboardList, Home, LogOut, Settings, Users } from 'lucide-react'
import { usePartnerAuth } from '../../contexts/PartnerAuthContext'
import { usePartnerCrm } from '../../contexts/PartnerCrmContext'
import { can, PARTNER_BOOKINGS_PATH, PARTNER_VENUES_PATH, type Capability } from '../../utils/partnerAccess'

interface NavItem {
  to: string
  icon: typeof Home
  label: string
  end: boolean
  /** null — пункт доступен любой роли */
  cap: Capability | null
}

const NAV: NavItem[] = [
  { to: '/partner/dashboard',  icon: Home,          label: 'Главная',    end: true,  cap: null },
  { to: PARTNER_BOOKINGS_PATH, icon: ClipboardList, label: 'Брони',      end: false, cap: 'crm' },
  { to: PARTNER_VENUES_PATH,   icon: Building2,     label: 'Площадки',   end: false, cap: 'venues' },
  { to: '/partner/staff',      icon: Users,         label: 'Сотрудники', end: false, cap: 'staff' },
  { to: '/partner/settings',   icon: Settings,      label: 'Настройки',  end: false, cap: null },
]

export function PartnerMobileNav() {
  const { partner, logoutPartner } = usePartnerAuth()
  const { pendingCount } = usePartnerCrm()
  const navigate = useNavigate()

  const role = partner?.role ?? 'owner'
  const items = NAV.filter(item => item.cap === null || can(role, item.cap))

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
        {items.map(item => {
          const Icon = item.icon
          const badge = item.to === PARTNER_BOOKINGS_PATH ? pendingCount : 0
          return (
            <NavLink key={item.to} to={item.to} end={item.end} style={{ flex: 1, textDecoration: 'none', minWidth: 0 }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 2px', borderRadius: 14,
                  background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: isActive ? 24 : 0, height: 2.5, borderRadius: 2,
                    background: '#22c55e', transition: 'width 0.25s ease',
                  }} />
                  <div style={{ position: 'relative' }}>
                    <Icon size={22} color={isActive ? '#22c55e' : '#64748b'} />
                    {badge > 0 && (
                      <span style={{
                        position: 'absolute', top: -5, right: -8,
                        minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999,
                        background: '#f59e0b', color: '#0f172a',
                        fontSize: 9.5, fontWeight: 800,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#22c55e' : '#64748b',
                    maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
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
          style={{ flex: 1, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 2px', borderRadius: 14 }}>
            <LogOut size={22} color="#64748b" />
            <span style={{ fontSize: 10, fontWeight: 400, color: '#64748b' }}>Выйти</span>
          </div>
        </button>
      </div>
    </div>
  )
}
