import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
        <BookingProvider>
          <AppRoutes />
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
