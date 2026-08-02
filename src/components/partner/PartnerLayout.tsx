import { Outlet } from 'react-router-dom'
import { PartnerSidebarContent } from './PartnerSidebar'
import { PartnerMobileNav } from './PartnerMobileNav'
import { usePartnerAuth } from '../../contexts/PartnerAuthContext'

const SIDEBAR_BG = '#1e293b'
const SIDEBAR_WIDTH = 264

export function PartnerLayout() {
  const { partner } = usePartnerAuth()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f172a' }}>
      {/* Десктопный сайдбар */}
      <div className="hidden md:block" style={{ width: SIDEBAR_WIDTH, flexShrink: 0, background: SIDEBAR_BG, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        <PartnerSidebarContent />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Топбар — на мобильных; на десктопе приветствие в контенте страницы */}
        <div
          className="md:hidden"
          style={{
            padding: '16px 16px 14px',
            paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))',
            background: SIDEBAR_BG,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.3, fontFamily: 'var(--font-display)' }}>
            Добро пожаловать, {partner?.companyName || 'партнёр'}!
          </span>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <PartnerMobileNav />
    </div>
  )
}
