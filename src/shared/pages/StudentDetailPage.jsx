import { useEffect, useState } from 'react';
import { Breadcrumbs, Anchor, SimpleGrid, Skeleton, Tabs } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageShell';
import { PageHeaderSkeleton } from '../components/TableSkeleton';
import { GlassCard } from '../components/GlassCard';
import AdesiaDataTable from '../components/AdesiaDataTable';
import { formatDateTime, getErrorMessage } from '../utils/formatters';
import { getStudent } from '../../Features/Teacher/services/teacher.services';

const flattenRecentActivity = (recentActivity) => {
  if (!recentActivity) return [];
  if (Array.isArray(recentActivity)) return recentActivity;

  const rows = [];
  (recentActivity.quizAttempts ?? []).forEach((a) => {
    const lessonLabel = a.lessonTitle || a.lessonId || 'Lesson';
    rows.push({
      id: `quiz-${a.quizId}-${a.completedAt}`,
      action: `Quiz completed — ${lessonLabel} (${a.score ?? '—'}%)`,
      type: 'quiz',
      createdAt: a.completedAt,
    });
  });
  (recentActivity.flashcardReviews ?? []).forEach((r, i) => {
    const correct = r.result === 'CORRECT' || r.correct === true;
    rows.push({
      id: `fc-${i}-${r.reviewedAt ?? i}`,
      action: correct ? 'Flashcard — correct' : 'Flashcard — needs review',
      type: 'flashcard',
      createdAt: r.reviewedAt,
    });
  });

  return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const StudentDetailPage = ({ basePath = '/teacher' }) => {
  const { id } = useParams();
  const { organizationId } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId || !id) { setLoading(false); return; }
    getStudent(id, organizationId)
      .then(setStudent)
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId, id]);

  if (loading) {
    return (
      <>
        <PageHeaderSkeleton />
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          <GlassCard className="p-6"><Skeleton height={60} /></GlassCard>
          <GlassCard className="p-6"><Skeleton height={60} /></GlassCard>
        </SimpleGrid>
      </>
    );
  }

  if (!student) {
    return (
      <GlassCard className="p-12 text-center">
        <p className="text-muted-foreground">Student not found.</p>
        <Link to={`${basePath}/students`} className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to students
        </Link>
      </GlassCard>
    );
  }

  const progress = student.progress ?? {};
  const lessonProgress = Array.isArray(student.lessonProgress) ? student.lessonProgress : [];
  const overallProgress = lessonProgress.length
    ? Math.round(
      lessonProgress.reduce((sum, lp) => sum + (lp.progressPercent ?? 0), 0) / lessonProgress.length,
    )
    : null;
  const enrolledSubjects = Array.isArray(student.enrolledSubjects) ? student.enrolledSubjects : [];
  const weakTopics = progress.weakTopics ?? student.weakTopics ?? [];
  const quizRows = Array.isArray(student.quizPerformance)
    ? student.quizPerformance
    : (progress.quizPerformance ?? []);
  const activityRows = flattenRecentActivity(student.recentActivity);

  return (
    <>
      <Breadcrumbs separator={<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />} mb="md">
        <Anchor component={Link} to={`${basePath}/students`} size="sm" c="dimmed">
          Students
        </Anchor>
        <Anchor size="sm">{student.firstName} {student.lastName}</Anchor>
      </Breadcrumbs>

      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        description={student.email}
      />

      {enrolledSubjects.length > 0 && (
        <GlassCard className="mb-6 p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Enrolled subjects ({student.enrolledSubjectCount ?? enrolledSubjects.length})
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {enrolledSubjects.map((s) => (
              <li
                key={s.subjectId || s.name}
                className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-sm text-foreground"
              >
                {s.name}{s.code ? ` (${s.code})` : ''}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="md">
        <GlassCard className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Overall progress</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {overallProgress != null ? `${overallProgress}%` : '—'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {progress.lessonsCompleted ?? 0} lessons completed
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Quiz average</p>
          <p className="mt-2 font-display text-3xl font-bold">
            {progress.averageQuizScore != null ? `${Math.round(progress.averageQuizScore)}%` : '—'}
          </p>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Study streak</p>
          <p className="mt-2 font-display text-3xl font-bold">{progress.currentStreak ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">days</p>
        </GlassCard>
      </SimpleGrid>

      <Tabs defaultValue="activity">
        <Tabs.List className="mb-6 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="activity">Recent activity</Tabs.Tab>
          <Tabs.Tab value="weak">Weak topics</Tabs.Tab>
          <Tabs.Tab value="quiz">Quiz performance</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="activity">
          <AdesiaDataTable
            title="Recent activity"
            data={activityRows}
            columns={[
              { key: 'action', header: 'Activity', className: 'font-medium', render: (a) => a.action || '—' },
              { key: 'createdAt', header: 'When', render: (a) => formatDateTime(a.createdAt) },
            ]}
            pageSize={8}
            emptyMessage="No recent activity recorded."
          />
        </Tabs.Panel>

        <Tabs.Panel value="weak">
          <GlassCard className="p-6">
            {weakTopics.length ? (
              <ul className="space-y-2 text-sm">
                {weakTopics.map((t) => (
                  <li key={typeof t === 'string' ? t : (t.id || t.name)} className="rounded-lg border border-border/40 bg-muted/20 px-4 py-2">
                    {typeof t === 'string' ? t : (t.name || t.topicName)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No weak topics identified yet.</p>
            )}
          </GlassCard>
        </Tabs.Panel>

        <Tabs.Panel value="quiz">
          <AdesiaDataTable
            title="Quiz attempts"
            data={quizRows}
            columns={[
              { key: 'score', header: 'Score', className: 'font-medium', render: (row) => (row.score != null ? `${Math.round(row.score)}%` : '—') },
              { key: 'lessonTitle', header: 'Lesson', className: 'font-medium', render: (row) => row.lessonTitle || row.lessonId || '—' },
              { key: 'completedAt', header: 'Completed', render: (row) => formatDateTime(row.completedAt) },
            ]}
            pageSize={8}
            emptyMessage="No quiz performance data yet."
          />
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

export default StudentDetailPage;
