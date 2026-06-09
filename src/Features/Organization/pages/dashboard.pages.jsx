import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import {
  BookOpen, Cpu, FileText, HardDrive, Layers, Upload, Users,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { MetricSplitCard, StatCard } from '../../../shared/components/AdesiaBadge';
import { PageLoader, EmptyOrgHint } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import TeachingDashboardSections from '../../../shared/components/TeachingDashboardSections';
import { formatBytes, formatNumber, getErrorMessage, parseAiUsage } from '../../../shared/utils/formatters';
import { getDashboard, getTeacherAnalytics } from '../services/organization.services';

const DashboardPage = () => {
  const { organizationId, user } = useAuth();
  const [data, setData] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!organizationId) return;
    Promise.all([
      getDashboard(organizationId),
      getTeacherAnalytics(organizationId),
    ])
      .then(([dash, teach]) => {
        setData(dash);
        setTeacherStats(teach);
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) { setLoading(false); return undefined; }
    setLoading(true);
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

  if (loading) return <PageLoader />;
  if (!organizationId) return <EmptyOrgHint />;

  const ai = parseAiUsage(data?.aiUsage);
  const quizPerf = teacherStats?.quizPerformance ?? {};
  const firstName = user?.firstName?.trim() || 'there';

  const contentBySubject = data?.contentBySubject ?? [];
  const lessonTotals = contentBySubject.reduce(
    (acc, sub) => {
      sub.lessons?.forEach((l) => {
        acc.quizzes += l.quizCount ?? 0;
        acc.flashcards += l.flashcardCount ?? 0;
        acc.progress += l.avgProgress ?? 0;
        acc.count += 1;
      });
      return acc;
    },
    { quizzes: 0, flashcards: 0, progress: 0, count: 0 },
  );

  const orgStats = {
    totalStudents: data?.students ?? 0,
    totalSubjects: data?.subjects ?? 0,
    totalLessons: data?.lessons ?? 0,
    totalMaterials: data?.materials ?? 0,
    totalQuizzes: lessonTotals.quizzes,
    totalFlashcards: lessonTotals.flashcards,
    completionRate: lessonTotals.count
      ? Math.round(lessonTotals.progress / lessonTotals.count)
      : 0,
    averageScore: quizPerf.avgScore ?? 0,
    contentBySubject,
    recentActivity: data?.recentActivity ?? [],
    atRiskStudents: data?.atRiskStudents ?? [],
    focusLessons: data?.focusLessons ?? [],
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        gradientWord={firstName}
        description="Organization overview — users, content, AI usage, and student learning."
        action={(
          <Link to="/admin/students" className="no-underline">
            <GradientButton type="button" className="!px-3 !py-2">
              <Users className="h-4 w-4" />
              All students
            </GradientButton>
          </Link>
        )}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MetricSplitCard
            icon={Cpu}
            label="AI usage this month"
            footer="Aggregated across all AI features"
            metrics={[
              { label: 'Requests', value: formatNumber(ai.requests), hint: 'API calls' },
              { label: 'Tokens', value: formatNumber(ai.tokens), hint: 'Model tokens' },
            ]}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
          <StatCard icon={Users} label="Total users" value={formatNumber(data?.users)} highlight />
          <StatCard icon={Users} label="Teachers" value={formatNumber(data?.teachers)} />
          <StatCard icon={Users} label="Students" value={formatNumber(data?.students)} />
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BookOpen} label="Subjects" value={formatNumber(data?.subjects)} />
        <StatCard icon={FileText} label="Lessons" value={formatNumber(data?.lessons)} />
        <StatCard icon={Upload} label="Materials" value={formatNumber(data?.materials)} />
        <StatCard icon={HardDrive} label="Storage" value={formatBytes(data?.storageUsage?.totalBytes ?? data?.storageUsage)} />
      </div>

      <TeachingDashboardSections
        role="admin"
        stats={orgStats}
        quizPerformance={quizPerf}
        firstName={firstName}
      />

      <GlassCard className="mt-6 flex items-center justify-between p-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Subscription plan
          </p>
          <p className="mt-1 font-display text-xl font-bold text-foreground">
            {data?.subscriptionPlan || '—'}
          </p>
        </div>
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary sm:flex">
          <Layers className="h-6 w-6" />
        </div>
      </GlassCard>
    </>
  );
};

export default DashboardPage;
