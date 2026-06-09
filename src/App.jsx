import './App.css';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import MarketingPage from './Features/Marketing/pages/marketing.pages';
import AdminLoginPage from './Features/Auth/pages/admin.login.pages';
import RegisterPage from './Features/Auth/pages/register.pages';
import OnboardingPage from './Features/Onboarding/pages/onboarding.pages';
import AcceptInvitePage from './Features/Organization/pages/acceptInvite.pages';
import { organizationRoutes } from './Features/Organization/routes/organization.routes';
import { teacherRoutes } from './Features/Teacher/routes/teacher.routes';
import { studentRoutes } from './Features/Student/routes/student.routes';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminLayout from './shared/layouts/AdminLayout';
import TeacherLayout from './shared/layouts/TeacherLayout';
import StudentLayout from './shared/layouts/StudentLayout';
import { ForbiddenPage, NotFoundPage } from './shared/components/PageShell';
import { useAuth } from './shared/context/AuthContext';

const RootRedirect = () => {
  const { user, loading, getPortalPath } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={getPortalPath(user.role)} replace />;
  return <MarketingPage />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/marketing" element={<MarketingPage />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />
        <Route path="/organizations/invites/accept" element={<AcceptInvitePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route element={<ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {organizationRoutes}
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            {teacherRoutes}
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            {studentRoutes}
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
