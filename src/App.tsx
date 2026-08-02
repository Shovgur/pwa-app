import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Handshake, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PartnerAuthProvider, usePartnerAuth } from './contexts/PartnerAuthContext'
import { BookingProvider } from './contexts/BookingContext'
import { ScrollToTop } from './components/ScrollToTop'
import { FullPageLoader } from './components/ui/Loaders'
import { PublicLayout } from './components/layout/PublicLayout'
import { LandingPage } from './pages/LandingPage'
import { CatalogPage } from './pages/CatalogPage'
import { SportBookingPage } from './pages/SportBookingPage'
import { LoftBookingPage } from './pages/LoftBookingPage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { PoolsPage } from './pages/PoolsPage'
import { PoolDetailPage } from './pages/PoolDetailPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ProfilePage } from './pages/ProfilePage'
import { PartnersPage } from './pages/PartnersPage'

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullPageLoader message="Проверяем сессию..." />
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Гостевой маршрут: если уже залогинен → /dashboard
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

// Защищённый маршрут для кабинета партнёра
function PartnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isPartnerAuthenticated } = usePartnerAuth()
  return isPartnerAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Временная заглушка кабинета партнёра
function PartnerDashboardPlaceholder() {
  const { partner, logoutPartner } = usePartnerAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logoutPartner()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', maxWidth: 420, background: '#1a2332', borderRadius: 24, padding: '40px 32px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}
      >
        <div style={{ width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}>
          <Handshake size={30} color="#fff" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          Добро пожаловать в кабинет партнёра
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
          {partner?.name ? `Вы вошли как «${partner.name}»` : 'Раздел находится в разработке'}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <LogOut size={16} />
          Выйти
        </button>
      </motion.div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Публичный сайт */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/sport/:id" element={<SportBookingPage />} />
        <Route path="/loft/:id" element={<LoftBookingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pools" element={<PoolsPage />} />
        <Route path="/pools/:id" element={<PoolDetailPage />} />
      </Route>

      {/* Аутентификация — гостевые маршруты */}
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

      {/* Стать партнёром — доступно всем, отдельная страница-лендинг */}
      <Route path="/partners" element={<PartnersPage />} />

      {/* Кабинет партнёра — защищённый маршрут (вход через /login, таб "Я партнёр") */}
      <Route path="/partner/dashboard" element={
        <PartnerProtectedRoute>
          <PartnerDashboardPlaceholder />
        </PartnerProtectedRoute>
      } />

      {/* Профиль — защищённый маршрут */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Дашборд — защищённый маршрут */}
      <Route path="/dashboard/*" element={
        <ProtectedRoute>
          <Suspense fallback={<FullPageLoader message="Открываем личный кабинет..." />}>
            <DashboardPage />
          </Suspense>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <PartnerAuthProvider>
          <BookingProvider>
            <AppRoutes />
          </BookingProvider>
        </PartnerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
