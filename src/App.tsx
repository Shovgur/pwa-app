import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PartnerAuthProvider, usePartnerAuth } from './contexts/PartnerAuthContext'
import { BookingProvider } from './contexts/BookingContext'
import { ScrollToTop } from './components/ScrollToTop'
import { FullPageLoader } from './components/ui/Loaders'
import { PublicLayout } from './components/layout/PublicLayout'
import { PartnerLayout } from './components/partner/PartnerLayout'
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
import { PartnerDashboardPage } from './pages/PartnerDashboardPage'
import { PartnerSettingsPage } from './pages/PartnerSettingsPage'
import { PartnerCrmPage } from './pages/PartnerCrmPage'
import { PartnerStaffPage } from './pages/PartnerStaffPage'
import { can, partnerHomeRoute, isOwner, PARTNER_BOOKINGS_PATH, type Capability } from './utils/partnerAccess'

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

// Защищённый маршрут для кабинета партнёра (роль подтверждается на бэкенде:
// токен принимается только эндпоинтами /api/partner/*)
function PartnerProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isPartnerAuthenticated, isLoading } = usePartnerAuth()
  if (isLoading) return <FullPageLoader message="Проверяем сессию..." />
  return isPartnerAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

/**
 * Разделы кабинета, закрытые для управляющего (финансы, реквизиты, сотрудники).
 * На фронте это UX-слой — сами данные обязан не отдавать бэкенд.
 */
function PartnerCapabilityRoute({ cap, children }: { cap: Capability; children: React.ReactNode }) {
  const { partner } = usePartnerAuth()
  const role = partner?.role ?? 'owner'
  return can(role, cap) ? <>{children}</> : <Navigate to={partnerHomeRoute(role)} replace />
}

/** Только владелец; менеджера отправляем на главную с плашкой «Доступ запрещён». */
function PartnerOwnerRoute({ children }: { children: React.ReactNode }) {
  const { partner } = usePartnerAuth()
  if (isOwner(partner?.role)) return <>{children}</>
  return <Navigate to="/partner/dashboard" replace state={{ accessDenied: true }} />
}

/** /partner → своя стартовая страница: владельцу сводка, управляющему CRM */
function PartnerHomeRedirect() {
  const { partner } = usePartnerAuth()
  return <Navigate to={partnerHomeRoute(partner?.role)} replace />
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

      {/* Кабинет партнёра — защищённые маршруты (вход через /login, таб "Я партнёр") */}
      <Route path="/partner" element={<PartnerProtectedRoute><PartnerHomeRedirect /></PartnerProtectedRoute>} />

      <Route element={
        <PartnerProtectedRoute>
          <PartnerLayout />
        </PartnerProtectedRoute>
      }>
        <Route path="/partner/dashboard" element={<PartnerDashboardPage />} />
        <Route path={PARTNER_BOOKINGS_PATH} element={
          <PartnerCapabilityRoute cap="crm"><PartnerCrmPage /></PartnerCapabilityRoute>
        } />
        {/* старый путь — редирект на /partner/bookings */}
        <Route path="/partner/crm" element={<Navigate to={PARTNER_BOOKINGS_PATH} replace />} />
        <Route path="/partner/staff" element={
          <PartnerOwnerRoute><PartnerStaffPage /></PartnerOwnerRoute>
        } />
        <Route path="/partner/settings" element={<PartnerSettingsPage />} />
      </Route>

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
