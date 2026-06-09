import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import {
  BookOpen, Layers, Target, Upload, Users,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { EmptyState, PageHeader } from '../../../shared/components/PageShell';
import { PageLoader, EmptyOrgHint } from '../../../shared/components/PageLoader';
import { GradientButton } from '../../../shared/components/GradientButton';
import TeachingDashboardSections from '../../../shared/components/TeachingDashboardSections';
import { formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { getDashboard } from '../services/teacher.services';

const TeacherDashboardPage = () => {
  const { organizationId, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);

  const reload = useCallback(() => {
    if (!organizationId) return;
    getDashboard(organizationId)
      .then((stats) => {
        setData(stats ?? {
          totalStudents: 0,
          totalSubjects: 0,
          totalTopics: 0,
          totalLessons: 0,
          totalMaterials: 0,
          totalQuizzes: 0,
          totalFlashcards: 0,
          completionRate: 0,
          averageScore: 0,
          contentBySubject: [],
          recentActivity: [],
          atRiskStudents: [],
          focusLessons: [],
        });
      })
      .catch((err) => {
        setFetchFailed(true);
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      })
      .finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setData(null);
      return undefined;
    }
    setLoading(true);
    setFetchFailed(false);
    reload();
    return undefined;
  }, [organizationId, reload]);

  useEffect(() => {
    if (!organizationId) return undefined;
    const onVisible = () => {
      if (document.visibilityState === 'visible') reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [organizationId, reload]);

  if (!organizationId) return <EmptyOrgHint />;
  if (fetchFailed) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Could not load dashboard"
        description="Check your connection and refresh the page."
      />
    );
  }
  if (loading || data == null) return <PageLoader />;

  const firstName = user?.firstName?.trim() || 'there';

  if (data.totalSubjects === 0) {
    return (
      <>
        <PageHeader title={`Welcome, ${firstName}`} description="Teaching overview and learner progress." />
        <EmptyState
          icon={BookOpen}
          title="No subjects assigned yet"
          description="Your admin must assign you to a subject under Admin → Assignments → Teachers. After that, refresh this page."
          actionLabel="Open subjects"
          actionTo="/teacher/subjects"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        gradientWord={firstName}
        description="Content by subject, student activity, and lessons that need attention."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link to="/teacher/lessons" className="no-underline">
              <GradientButton type="button" className="!px-3 !py-2">
                <Layers className="h-4 w-4" />
                Lessons
              </GradientButton>
            </Link>
            <Link to="/teacher/students" className="btn-outline inline-flex items-center gap-2 !px-3 !py-2 text-sm no-underline">
              <Users className="h-4 w-4" />
              Students
            </Link>
          </div>
        )}
      />

      <TeachingDashboardSections
        role="teacher"
        stats={data}
        quizPerformance={{ avgScore: data.averageScore }}
        firstName={firstName}
      />
    </>
  );
};

export default TeacherDashboardPage;
