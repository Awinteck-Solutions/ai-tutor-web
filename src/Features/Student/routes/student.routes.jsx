import { Navigate, Route } from 'react-router-dom';
import StudentDashboardPage from '../pages/dashboard.pages';
import StudentLessonsPage from '../pages/lessons.pages';
import LessonPreviewPage from '../../../shared/pages/LessonPreviewPage';
import MaterialPreviewPage from '../../../shared/pages/MaterialPreviewPage';
import StudentAchievementsPage from '../pages/achievements.pages';
import StudentLeaderboardPage from '../pages/leaderboard.pages';
import StudentNotificationsPage from '../pages/notifications.pages';
import StudentPracticePage from '../pages/practice.pages';
import StudentSettingsPage from '../pages/settings.pages';
import StudentSubscriptionPage from '../pages/subscription.pages';
import StudentSelfLearnPage from '../pages/selfLearn.pages';
import StudentMilestonesPage from '../pages/milestones.pages';
import StudentChatPage from '../pages/chat.pages';

export const studentRoutes = (
  <>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<StudentDashboardPage />} />
    <Route path="lessons" element={<StudentLessonsPage />} />
    <Route path="self-learn" element={<StudentSelfLearnPage />} />
    <Route path="milestones" element={<StudentMilestonesPage />} />
    <Route path="practice" element={<StudentPracticePage />} />
    <Route path="chat" element={<StudentChatPage />} />
    <Route path="lessons/:lessonId" element={<LessonPreviewPage />} />
    <Route path="materials/:materialId/preview" element={<MaterialPreviewPage />} />
    <Route path="leaderboard" element={<StudentLeaderboardPage />} />
    <Route path="achievements" element={<StudentAchievementsPage />} />
    <Route path="notifications" element={<StudentNotificationsPage />} />
    <Route path="subscription" element={<StudentSubscriptionPage />} />
    <Route path="settings" element={<StudentSettingsPage />} />
  </>
);
