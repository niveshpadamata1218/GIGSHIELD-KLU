import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AnimatedBackground from './components/ui/AnimatedBackground'
import LoadingSpinner from './components/ui/LoadingSpinner'
const Landing = lazy(() => import('./pages/Landing'))
const WorkerLogin = lazy(() => import('./pages/auth/WorkerLogin'))
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'))
const Register = lazy(() => import('./pages/auth/Register'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const Overview = lazy(() => import('./pages/worker/Overview'))
const Policy = lazy(() => import('./pages/worker/Policy'))
const WorkTracker = lazy(() => import('./pages/worker/WorkTracker'))
const GigScorePage = lazy(() => import('./pages/worker/GigScorePage'))
const Claims = lazy(() => import('./pages/worker/Claims'))
const Alerts = lazy(() => import('./pages/worker/Alerts'))
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'))
const Disruptions = lazy(() => import('./pages/admin/Disruptions'))
const AdminClaims = lazy(() => import('./pages/admin/AdminClaims'))
const FraudDetection = lazy(() => import('./pages/admin/FraudDetection'))
const WorkerRegistry = lazy(() => import('./pages/admin/WorkerRegistry'))
const NotFound = lazy(() => import('./pages/NotFound'))
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ role, children }) {
  const { isAuthenticated, role: userRole } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />
  }

  if (role && userRole !== role) {
    return <Navigate to={userRole === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}

function App() {
  const location = useLocation()

  const routeFallback = (
    <div className="flex min-h-[40vh] items-center justify-center px-6">
      <LoadingSpinner label="Loading page" />
    </div>
  )

  return (
    <div className="relative min-h-screen bg-gs-bg text-gs-text">
      <AnimatedBackground />
      <Suspense fallback={routeFallback}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<WorkerLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="worker">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="policy" element={<Policy />} />
              <Route path="work" element={<WorkTracker />} />
              <Route path="gigscore" element={<GigScorePage />} />
              <Route path="claims" element={<Claims />} />
              <Route path="alerts" element={<Alerts />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="disruptions" element={<Disruptions />} />
              <Route path="claims" element={<AdminClaims />} />
              <Route path="fraud" element={<FraudDetection />} />
              <Route path="workers" element={<WorkerRegistry />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}

export default App
