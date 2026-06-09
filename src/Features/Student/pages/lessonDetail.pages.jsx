import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Anchor, Breadcrumbs, Tabs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ChevronRight, CheckCircle2, Layers, Target } from 'lucide-react';
import NotesPanel from '../components/NotesPanel';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { StudentLessonDetailSkeleton } from '../components/StudentPageSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import MarkdownContent from '../../../shared/components/MarkdownContent';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { completeLesson, getLessonDetail, getPractice } from '../services/student.services';

const StudentLessonDetailPage = () => {
  const { lessonId } = useParams();
  const { organizationId } = useAuth();
  const [detail, setDetail] = useState(null);
  const [practiceSummary, setPracticeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!organizationId || !lessonId) { setLoading(false); return; }
    Promise.all([
      getLessonDetail(organizationId, lessonId),
      getPractice(organizationId),
    ])
      .then(([lessonData, practice]) => {
        setDetail(lessonData);
        const quizzes = (practice?.quizzes ?? []).filter((q) => q.lessonId === lessonId);
        const flashcards = (practice?.flashcards ?? []).filter((f) => f.lessonId === lessonId);
        setPracticeSummary({
          quizzes,
          flashcards,
          pendingQuizzes: quizzes.filter((q) => q.status !== 'completed').length,
          pendingFlashcards: flashcards.filter((f) => f.status === 'pending').length,
        });
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId, lessonId]);

  const practiceLink = useMemo(
    () => `/student/practice?lessonId=${lessonId}`,
    [lessonId],
  );

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const res = await completeLesson(lessonId);
      if (res?.xp?.awarded) {
        notifications.show({
          title: `+${res.xp.xpAmount} XP`,
          message: 'Lesson completed for the first time',
          color: 'green',
        });
      } else {
        notifications.show({ title: 'Complete', message: 'Lesson marked complete', color: 'green' });
      }
      const refreshed = await getLessonDetail(organizationId, lessonId);
      setDetail(refreshed);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <StudentLessonDetailSkeleton />;

  const lesson = detail?.lesson;
  const progress = detail?.progress;
  const isComplete = progress?.status === 'COMPLETED' || progress?.progressPercent >= 100;

  if (!lesson) {
    return (
      <div>
        <p className="text-muted-foreground">Lesson not found.</p>
        <Link to="/student/lessons" className="mt-4 inline-block text-sm text-primary hover:underline">
          Back to lessons
        </Link>
      </div>
    );
  }

  const hasPractice = (practiceSummary?.quizzes?.length ?? 0) > 0
    || (practiceSummary?.flashcards?.length ?? 0) > 0;

  return (
    <>
      <Breadcrumbs separator={<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />} mb="md">
        <Anchor component={Link} to="/student/dashboard" size="sm" c="dimmed">
          Dashboard
        </Anchor>
        <Anchor component={Link} to="/student/lessons" size="sm" c="dimmed">
          Lessons
        </Anchor>
        <Anchor size="sm">{lesson.title}</Anchor>
      </Breadcrumbs>

      <PageHeader
        title={lesson.title}
        description={lesson.summary || 'Read the lesson, then practice quizzes and flashcards.'}
        action={!isComplete && (
          <GradientButton type="button" onClick={handleComplete} disabled={completing} className="!px-3 !py-2">
            <CheckCircle2 className="h-4 w-4" />
            {completing ? 'Saving…' : 'Mark complete'}
          </GradientButton>
        )}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <AdesiaBadge status={isComplete ? 'active' : 'draft'}>
          {isComplete ? 'Completed' : `${Math.round(progress?.progressPercent ?? 0)}% progress`}
        </AdesiaBadge>
        {practiceSummary?.pendingFlashcards > 0 && (
          <AdesiaBadge status="ready">
            {practiceSummary.pendingFlashcards} flashcard{practiceSummary.pendingFlashcards === 1 ? '' : 's'} to review
          </AdesiaBadge>
        )}
        {practiceSummary?.pendingQuizzes > 0 && (
          <AdesiaBadge status="ready">
            {practiceSummary.pendingQuizzes} quiz{practiceSummary.pendingQuizzes === 1 ? '' : 'zes'} available
          </AdesiaBadge>
        )}
      </div>

      <Tabs defaultValue="content">
        <Tabs.List className="mb-4 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="content">Content</Tabs.Tab>
          <Tabs.Tab value="notes">Notes</Tabs.Tab>
          <Tabs.Tab value="practice" disabled={!hasPractice}>Practice</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="content">
          <GlassCard className="p-6">
            {lesson.content ? (
              <MarkdownContent content={lesson.content} />
            ) : (
              <p className="text-sm text-muted-foreground">No lesson body yet.</p>
            )}
          </GlassCard>
        </Tabs.Panel>

        <Tabs.Panel value="notes">
          <NotesPanel lessonId={lessonId} />
        </Tabs.Panel>

        <Tabs.Panel value="practice">
          <GlassCard className="space-y-6 p-6">
            <p className="text-sm text-muted-foreground">
              Quizzes and flashcards use interactive practice mode — flip cards, answer questions, and track progress.
            </p>

            {practiceSummary?.quizzes?.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  Quizzes
                </h3>
                <ul className="space-y-2">
                  {practiceSummary.quizzes.map((q) => (
                    <li
                      key={q.quizId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{q.title || 'Lesson quiz'}</p>
                        <p className="text-xs text-muted-foreground">
                          {q.status === 'completed'
                            ? `Completed · ${Math.round(q.score ?? 0)}%`
                            : q.status === 'in_progress'
                              ? 'In progress — continue in Practice'
                              : 'Not started'}
                        </p>
                      </div>
                      <AdesiaBadge status={q.status === 'completed' ? 'active' : 'ready'}>
                        {q.status === 'completed' ? 'Done' : q.status === 'in_progress' ? 'Continue' : 'Start'}
                      </AdesiaBadge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {practiceSummary?.flashcards?.length > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
                  <Layers className="h-4 w-4 text-primary" />
                  Flashcards ({practiceSummary.flashcards.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  {practiceSummary.pendingFlashcards} pending ·{' '}
                  {practiceSummary.flashcards.length - practiceSummary.pendingFlashcards} reviewed
                </p>
              </div>
            )}

            <Link to={practiceLink} className="no-underline">
              <GradientButton type="button" className="!px-4 !py-2">
                Open in Practice
              </GradientButton>
            </Link>
          </GlassCard>
        </Tabs.Panel>
      </Tabs>

    </>
  );
};

export default StudentLessonDetailPage;
