import { Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '../components/Sidebar'
import { DashboardTopbar } from '../components/DashboardTopbar'
import { MobileNav } from '../components/MobileNav'
import { HomeTab } from '../components/tabs/HomeTab'
import { CourtsTab } from '../components/tabs/CourtsTab'
import { BookingsTab } from '../components/tabs/BookingsTab'
import { MapTab } from '../components/tabs/MapTab'
import { ProfileTab } from '../components/tabs/ProfileTab'
import { NotificationsTab } from '../components/tabs/NotificationsTab'
import { SettingsTab } from '../components/tabs/SettingsTab'

function TabPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="dashboard-tab-content"
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
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#121820', position: 'relative' }}
    >
      {/* z-index выше main, чтобы кнопка сворачивания не обрезалась правой панелью */}
      <div
        className="hidden md:block"
        style={{ position: 'relative', zIndex: 30, flexShrink: 0, overflow: 'visible' }}
      >
        <Sidebar />
      </div>

      <main
        className="flex-1 overflow-y-auto overflow-x-hidden dashboard-main"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <DashboardTopbar />

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
