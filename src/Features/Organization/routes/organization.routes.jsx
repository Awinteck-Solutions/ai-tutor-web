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
import AnalyseStudentPage from '../../../shared/pages/AnalyseStudentPage';
import AuditPage from '../pages/audit.pages';
import JobsPage from '../pages/jobs.pages';
import NotificationsPage from '../pages/notifications.pages';
import MarketplacePage from '../../Marketplace/pages/marketplace.pages';
import MarketplaceDetailPage from '../../Marketplace/pages/marketplaceDetail.pages';

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
    <Route path="students/:id/analyse" element={<AnalyseStudentPage basePath="/admin" backLabel="Back to student" />} />
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
    <Route path="marketplace" element={<MarketplacePage portalBase="/admin" getLessonPath={(id) => `/admin/lessons/${id}/preview`} />} />
    <Route
      path="marketplace/:id"
      element={
        <MarketplaceDetailPage
          portalBase="/admin"
          getLessonPath={(lessonId) => `/admin/lessons/${lessonId}/preview`}
        />
      }
    />
  </>
);
