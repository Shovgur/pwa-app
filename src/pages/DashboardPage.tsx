import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AmbientBg } from '../components/AmbientBg'
import { Sidebar } from '../components/Sidebar'
import { OverviewTab } from '../components/tabs/OverviewTab'
import { AnalyticsTab } from '../components/tabs/AnalyticsTab'
import { UsersTab } from '../components/tabs/UsersTab'
import { MessagesTab } from '../components/tabs/MessagesTab'
import { WalletTab } from '../components/tabs/WalletTab'
import { AITab } from '../components/tabs/AITab'
import { ProjectsTab } from '../components/tabs/ProjectsTab'
import { SettingsTab } from '../components/tabs/SettingsTab'
import { NotificationsTab } from '../components/tabs/NotificationsTab'

export function DashboardPage() {
  return (
    <motion.div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0a0a1a', position: 'relative' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Фоновая анимация */}
      <AmbientBg />

      {/* Боковое меню */}
      <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Контент */}
      <main
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <Routes>
          <Route index element={<OverviewTab />} />
          <Route path="analytics" element={<AnalyticsTab />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="messages" element={<MessagesTab />} />
          <Route path="wallet" element={<WalletTab />} />
          <Route path="ai" element={<AITab />} />
          <Route path="projects" element={<ProjectsTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route path="notifications" element={<NotificationsTab />} />
        </Routes>
      </main>
    </motion.div>
  )
}
