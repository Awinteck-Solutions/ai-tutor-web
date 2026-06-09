import { Navigate, Route } from 'react-router-dom';
import DashboardPage from '../pages/dashboard.pages';
import UsagePage from '../pages/usage.pages';
import SubscriptionPage from '../pages/subscription.pages';
import SettingsPage from '../pages/settings.pages';
import MembersPage from '../pages/members.pages';
import AcademicYearsPage from '../pages/academicYears.pages';
import AcademicSubjectsPage from '../pages/academicSubjects.pages';
import AssignmentsPage from '../pages/assignments.pages';
import MaterialsPage from '../pages/materials.pages';
import MaterialPreviewPage from '../../../shared/pages/MaterialPreviewPage';
import LessonsPage from '../pages/lessons.pages';
import LessonPreviewPage from '../../../shared/pages/LessonPreviewPage';
import AnalyticsPage from '../pages/analytics.pages';
import AdminStudentsPage from '../pages/students.pages';
import AdminStudentDetailPage from '../pages/studentDetail.pages';
import AuditPage from '../pages/audit.pages';
import JobsPage from '../pages/jobs.pages';
import NotificationsPage from '../pages/notifications.pages';

/** Route elements nested under /admin — do not wrap in another <Routes>. */
export const organizationRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="usage" element={<UsagePage />} />
    <Route path="subscription" element={<SubscriptionPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route path="members" element={<MembersPage />} />
    <Route path="students" element={<AdminStudentsPage />} />
    <Route path="students/:id" element={<AdminStudentDetailPage />} />
    <Route path="academic/years" element={<AcademicYearsPage />} />
    <Route path="academic/subjects" element={<AcademicSubjectsPage />} />
    <Route path="academic/topics" element={<Navigate to="/admin/academic/subjects" replace />} />
    <Route path="assignments" element={<AssignmentsPage />} />
    <Route path="materials" element={<MaterialsPage />} />
    <Route path="materials/:materialId/preview" element={<MaterialPreviewPage />} />
    <Route path="lessons" element={<LessonsPage />} />
    <Route path="lessons/:lessonId/preview" element={<LessonPreviewPage />} />
    <Route path="analytics" element={<AnalyticsPage />} />
    <Route path="audit" element={<AuditPage />} />
    <Route path="jobs" element={<JobsPage />} />
    <Route path="notifications" element={<NotificationsPage />} />
  </>
);
