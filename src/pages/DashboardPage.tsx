import { Routes, Route } from 'react-router-dom'
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

export function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f1623', position: 'relative' }}>
      <AmbientBg />

      <div className="hidden md:block" style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route index element={<HomeTab />} />
          <Route path="courts" element={<CourtsTab />} />
          <Route path="bookings" element={<BookingsTab />} />
          <Route path="map" element={<MapTab />} />
          <Route path="profile" element={<ProfileTab />} />
          <Route path="notifications" element={<NotificationsTab />} />
          <Route path="settings" element={<SettingsTab />} />
        </Routes>
      </main>

      <MobileNav />
    </div>
  )
}
