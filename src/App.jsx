import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/RouteGuards'

// ── Public pages ──────────────────────────────────────────────────────────────
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import PendingPage    from './pages/PendingPage'
import ForgotPasswordPage    from './pages/ForgotPasswordPage'
import ResetPasswordPage     from './pages/ResetPasswordPage'
import AdminLoginPage        from './pages/AdminLoginPage'
import PaymentSuccessPage    from './pages/PaymentSuccessPage'
import PortfolioPage          from './pages/PortfolioPage'
import NotFoundPage           from './pages/NotFoundPage'

// ── Student pages ─────────────────────────────────────────────────────────────
import DashboardPage  from './pages/student/DashboardPage'
import CoursePage     from './pages/student/CoursePage'
import LessonPage     from './pages/student/LessonPage'
import AssignmentsPage from './pages/student/AssignmentsPage'
import CommunityPage  from './pages/student/CommunityPage'
import CertificatePage from './pages/student/CertificatePage'
import AccountPage    from './pages/student/AccountPage'

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminPortfolio     from './pages/admin/AdminPortfolio'
import AdminOverview      from './pages/admin/AdminOverview'
import AdminStudents      from './pages/admin/AdminStudents'
import AdminCourses       from './pages/admin/AdminCourses'
import AdminAssignments   from './pages/admin/AdminAssignments'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import AdminRevenue       from './pages/admin/AdminRevenue'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public ─────────────────────────────────────────────────── */}
            <Route path="/"          element={<LandingPage />} />
            <Route path="/login"     element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register"  element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="/reset-password"  element={<ResetPasswordPage />} />
            <Route path="/pending"          element={<PendingPage />} />
            <Route path="/payment-success"  element={<PaymentSuccessPage />} />
            <Route path="/portfolio"        element={<PortfolioPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />

            {/* ── Student (approved members only) ────────────────────────── */}
            <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/courses"     element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
            <Route path="/courses/m/:mIdx/l/:lIdx"
                                       element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute><AssignmentsPage /></ProtectedRoute>} />
            <Route path="/community"   element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/certificate/:courseId"
                                       element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
            <Route path="/account"     element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />

            {/* ── Admin (Petra only) ──────────────────────────────────────── */}
            <Route path="/admin"               element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/admin/students"      element={<AdminRoute><AdminStudents /></AdminRoute>} />
            <Route path="/admin/courses"       element={<AdminRoute><AdminCourses /></AdminRoute>} />
            <Route path="/admin/assignments"   element={<AdminRoute><AdminAssignments /></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
            <Route path="/admin/revenue"       element={<AdminRoute><AdminRevenue /></AdminRoute>} />
            <Route path="/admin/portfolio"     element={<AdminRoute><AdminPortfolio /></AdminRoute>} />

            {/* ── Fallback ────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
