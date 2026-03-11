import { NavLink } from 'react-router-dom'
import { Home, Search, CalendarCheck, MapPin, User } from 'lucide-react'

const ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Главная', color: '#22c55e' },
  { to: '/dashboard/courts', icon: Search, label: 'Площадки', color: '#3b82f6' },
  { to: '/dashboard/bookings', icon: CalendarCheck, label: 'Брони', color: '#f97316', badge: 2 },
  { to: '/dashboard/map', icon: MapPin, label: 'Карта', color: '#a855f7' },
  { to: '/dashboard/profile', icon: User, label: 'Профиль', color: '#06b6d4' },
]

export function MobileNav() {
  return (
    <div
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: 'rgba(15, 22, 35, 0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', padding: '6px 4px' }}>
        {ITEMS.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              style={{ flex: 1, textDecoration: 'none', display: 'block' }}
            >
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '8px 4px',
                    borderRadius: 14,
                    background: isActive ? `${item.color}14` : 'transparent',
                    position: 'relative',
                  }}
                >
                  {/* Индикатор — просто div без layoutId, без анимации съезжания */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: isActive ? 24 : 0,
                      height: 2.5,
                      borderRadius: 2,
                      background: item.color,
                      transition: 'width 0.25s ease',
                    }}
                  />
                  <div style={{ position: 'relative' }}>
                    <Icon size={22} color={isActive ? item.color : '#64748b'} />
                    {item.badge && !isActive && (
                      <span style={{
                        position: 'absolute', top: -4, right: -5,
                        width: 15, height: 15, borderRadius: '50%',
                        background: item.color, color: '#fff',
                        fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? item.color : '#64748b',
                    transition: 'color 0.2s',
                  }}>
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
