import { Navigate, Route } from 'react-router-dom';
import TeacherDashboardPage from '../pages/dashboard.pages';
import SubjectsPage from '../pages/subjects.pages';
import TopicsPage from '../pages/topics.pages';
import TeacherMaterialsPage from '../pages/materials.pages';
import MaterialPreviewPage from '../../../shared/pages/MaterialPreviewPage';
import TeacherLessonsPage from '../pages/lessons.pages';
import LessonPreviewPage from '../../../shared/pages/LessonPreviewPage';
import StudentsPage from '../pages/students.pages';
import StudentDetailPage from '../pages/studentDetail.pages';
import TeacherSettingsPage from '../pages/settings.pages';
import TeacherNotificationsPage from '../pages/notifications.pages';

/** Route elements nested under /teacher — do not wrap in another <Routes>. */
export const teacherRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<TeacherDashboardPage />} />
    <Route path="subjects" element={<SubjectsPage />} />
    <Route path="subjects/:subjectId/topics" element={<TopicsPage />} />
    <Route path="materials" element={<TeacherMaterialsPage />} />
    <Route path="materials/:materialId/preview" element={<MaterialPreviewPage />} />
    <Route path="lessons" element={<TeacherLessonsPage />} />
    <Route path="lessons/:lessonId/preview" element={<LessonPreviewPage />} />
    <Route path="students" element={<StudentsPage />} />
    <Route path="students/:id" element={<StudentDetailPage />} />
    <Route path="notifications" element={<TeacherNotificationsPage />} />
    <Route path="settings" element={<TeacherSettingsPage />} />
  </>
);
