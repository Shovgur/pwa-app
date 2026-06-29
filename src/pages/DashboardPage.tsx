import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { AmbientBg } from '../components/AmbientBg'
import { Sidebar } from '../components/Sidebar'
import { MobileNav } from '../components/MobileNav'
import { HomeTab } from '../components/tabs/HomeTab'
import { CourtsTab } from '../components/tabs/CourtsTab'
import { BookingsTab } from '../components/tabs/BookingsTab'
import { MapTab } from '../components/tabs/MapTab'
import { ProfileTab } from '../components/tabs/ProfileTab'
import { NotificationsTab } from '../components/tabs/NotificationsTab'
import { SettingsTab } from '../components/tabs/SettingsTab'

/* Простой fade — не конфликтует с внутренними анимациями табов */
function TabPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}

export function DashboardPage() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1623', position: 'relative' }}>
      <AmbientBg />

      <div className="hidden md:block" style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 10 }}>
        <div className="dashboard-topbar md:hidden">
          <Link to="/" className="back-to-site back-to-site--subtle">
            <Globe size={16} />
            <span>На сайт</span>
          </Link>
        </div>

        <Routes location={location} key={location.pathname}>
          <Route index element={<TabPage><HomeTab /></TabPage>} />
          <Route path="courts" element={<TabPage><CourtsTab /></TabPage>} />
          <Route path="bookings" element={<TabPage><BookingsTab /></TabPage>} />
          <Route path="map" element={<TabPage><MapTab /></TabPage>} />
          <Route path="profile" element={<TabPage><ProfileTab /></TabPage>} />
          <Route path="notifications" element={<TabPage><NotificationsTab /></TabPage>} />
          <Route path="settings" element={<TabPage><SettingsTab /></TabPage>} />
        </Routes>
      </main>

      <MobileNav />
    </div>
  )
}
