import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapse, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  BookOpen,
  Brain,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  Flame,
  Layers,
  MessageSquare,
  Play,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap,
} from 'lucide-react';
import { Progress } from '@mantine/core';
import { useAuth } from '../../../shared/context/AuthContext';
import { EmptyState, PageHeader } from '../../../shared/components/PageShell';
import { StatCard } from '../../../shared/components/AdesiaBadge';
import { StudentDashboardSkeleton } from '../components/StudentPageSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { formatNumber, formatBytes, getErrorMessage } from '../../../shared/utils/formatters';
import FlashcardStudy from '../components/FlashcardStudy';
import QuizStudy from '../components/QuizStudy';
import QuizCloseModal from '../components/QuizCloseModal';
import LeaderboardPanel from '../components/LeaderboardPanel';
import SetupWorkspaceBanner from '../components/SetupWorkspaceBanner';
import StudentSourceLabel from '../components/StudentSourceLabel';
import StudentLearningReportCard from '../components/StudentLearningReportCard';
import { groupPracticeBySubject } from '../utils/groupPractice';
import StatusBadge from '../../../shared/components/StatusBadge';
import {
  getContinueLearning,
  getDashboard,
  getPractice,
  getSubscription,
  listSelfStudyMaterials,
} from '../services/student.services';

const usagePct = (used, limit) => {
  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
};

const dashActionBtn = 'btn-outline flex min-h-9 flex-1 items-center justify-center gap-1.5 !px-3 !py-2 text-xs sm:min-h-0 sm:flex-initial sm:!px-2.5 sm:!py-1.5';
const dashPrimaryBtn = 'btn-gradient flex min-h-10 w-full items-center justify-center gap-1.5 !px-4 !py-2.5 text-xs sm:min-h-0 sm:w-auto sm:!px-3 sm:!py-1.5';

const quizStatusLabel = (q) => {
  if (q.status === 'completed') return 'Done';
  if (q.status === 'in_progress') return 'In progress';
  return 'Pending';
};

const quizStatusBadge = (q) => {
  if (q.status === 'completed') return 'active';
  if (q.status === 'in_progress') return 'draft';
  return 'ready';
};

const subjectKey = (subject) => subject.subjectId || subject.subjectName;

const StudentDashboardPage = () => {
  const { organizationId, user, isPersonalWorkspace, organizationName, isSchoolStudent } = useAuth();
  const [data, setData] = useState(null);
  const [practice, setPractice] = useState({ quizzes: [], flashcards: [] });
  const [continueItems, setContinueItems] = useState([]);
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizRetake, setQuizRetake] = useState(false);
  const [activeFlashcards, setActiveFlashcards] = useState(null);
  const [quizExitOpen, setQuizExitOpen] = useState(false);
  const [quizExitSaving, setQuizExitSaving] = useState(false);
  const quizSaveRef = useRef(null);

  const reload = useCallback(() => {
    if (!organizationId) return;
    Promise.all([
      getDashboard(organizationId),
      getContinueLearning(organizationId),
      getPractice(organizationId),
      listSelfStudyMaterials(organizationId, {
        processingStatus: 'COMPLETED',
        limit: 5,
        page: 1,
      }),
      getSubscription(organizationId).catch(() => null),
    ])
      .then(([stats, cont, pr, materialsRes, sub]) => {
        setData(stats);
        setContinueItems(Array.isArray(cont) ? cont : []);
        setPractice({
          quizzes: pr?.quizzes ?? [],
          flashcards: pr?.flashcards ?? [],
        });
        setRecentMaterials(materialsRes?.items ?? []);
        setSubscription(sub);
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

  const grouped = useMemo(
    () => groupPracticeBySubject(practice.quizzes, practice.flashcards),
    [practice.quizzes, practice.flashcards],
  );

  const [expandedSubjects, setExpandedSubjects] = useState({});

  const groupedKeyList = useMemo(
    () => grouped.map(subjectKey).join('|'),
    [grouped],
  );

  useEffect(() => {
    if (!grouped.length) {
      setExpandedSubjects({});
      return;
    }
    setExpandedSubjects((prev) => {
      const keys = grouped.map(subjectKey);
      if (keys.some((k) => k in prev)) return prev;
      return Object.fromEntries(keys.map((k, i) => [k, i === 0]));
    });
  }, [groupedKeyList, grouped]);

  const toggleSubject = (key) => {
    setExpandedSubjects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!organizationId) {
    const firstName = user?.firstName?.trim() || 'there';
    return (
      <>
        <PageHeader
          title={`Welcome, ${firstName}`}
          description="Set up your workspace to start learning with Self-learn, Practice, and AI Chat."
        />
        <SetupWorkspaceBanner />
        <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
          <GlassCard className="p-4 opacity-60 sm:p-5">
            <Sparkles className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display font-semibold text-foreground">Self-learn</p>
            <p className="mt-1 text-sm text-muted-foreground">Available after workspace setup.</p>
          </GlassCard>
          <GlassCard className="p-4 opacity-60 sm:p-5">
            <Target className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display font-semibold text-foreground">Practice</p>
            <p className="mt-1 text-sm text-muted-foreground">Quizzes and flashcards live here.</p>
          </GlassCard>
          <Link to="/student/subscription" className="glass-card-hover block p-4 no-underline sm:p-5">
            <CreditCard className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display font-semibold text-foreground">Free plan</p>
            <p className="mt-1 text-sm text-muted-foreground">10 MB storage · 10 lessons/day.</p>
          </Link>
        </div>
      </>
    );
  }
  if (fetchFailed) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Could not load dashboard"
        description="Check your connection and refresh the page."
      />
    );
  }
  if (loading || data == null) return <StudentDashboardSkeleton />;

  const hasContent = (data.totalLessons ?? 0) > 0
    || (data.currentLessons?.length ?? 0) > 0
    || (data.recommendedLessons?.length ?? 0) > 0
    || continueItems.length > 0
    || grouped.length > 0;

  const firstName = user?.firstName?.trim() || 'there';

  if (!hasContent) {
    return (
      <>
        <PageHeader
          title={`Welcome, ${firstName}`}
          description="Start in Self-learn — upload materials or describe a topic to create your first lesson."
        />
        <div className="mb-8 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
          <Link to="/student/self-learn" className="glass-card-hover block p-4 no-underline sm:p-5">
            <Sparkles className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display font-semibold text-foreground">Self-learn</p>
            <p className="mt-1 text-sm text-muted-foreground">Upload PDFs or create lessons from a prompt.</p>
          </Link>
          <Link to="/student/practice" className="glass-card-hover block p-4 no-underline sm:p-5">
            <Target className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display font-semibold text-foreground">Practice</p>
            <p className="mt-1 text-sm text-muted-foreground">Quizzes and flashcards appear here after you generate them.</p>
          </Link>
          <Link to="/student/subscription" className="glass-card-hover block p-4 no-underline sm:p-5">
            <CreditCard className="mb-3 h-6 w-6 text-primary" />
            <p className="font-display font-semibold text-foreground">Free plan</p>
            <p className="mt-1 text-sm text-muted-foreground">10 MB storage · 10 lessons/day. Upgrades coming soon.</p>
          </Link>
        </div>
        <EmptyState
          icon={BookOpen}
          title="No lessons yet"
          description="Create your first lesson in Self-learn, or browse school lessons if your teacher enrolled you."
          actionLabel="Start Self-learn"
          actionTo="/student/self-learn"
        />
      </>
    );
  }

  const continueList = continueItems.length
    ? continueItems
    : (data.currentLessons ?? []).map((l) => ({
      lessonId: l.id,
      title: l.title,
      progressPercent: l.progressPercent ?? 0,
      status: l.status ?? 'IN_PROGRESS',
    }));

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        gradientWord={firstName}
        description="Pick up where you left off — Self-learn, Practice, and AI Chat are one click away."
        action={(
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link to="/student/self-learn" className="no-underline">
              <GradientButton type="button" className="w-full !px-3 !py-2 sm:w-auto">
                <Sparkles className="h-4 w-4" />
                Self-learn
              </GradientButton>
            </Link>
            <Link to="/student/practice" className="btn-outline inline-flex w-full items-center justify-center gap-2 !px-3 !py-2 text-sm no-underline sm:w-auto">
              <Target className="h-4 w-4" />
              Practice
            </Link>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-4">
        <Link to="/student/self-learn" className="glass-card flex min-w-0 items-start gap-3 p-4 no-underline transition hover:border-primary/40 sm:gap-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-10 sm:w-10">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-foreground">Create & upload</p>
            <p className="mt-1 text-xs text-muted-foreground">Build lessons from materials or prompts.</p>
          </div>
        </Link>
        <Link to="/student/practice" className="glass-card flex min-w-0 items-start gap-3 p-4 no-underline transition hover:border-primary/40 sm:gap-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-10 sm:w-10">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-foreground">Practice</p>
            <p className="mt-1 text-xs text-muted-foreground">Quizzes, flashcards, and saved progress.</p>
          </div>
        </Link>
        <Link to="/student/chat" className="glass-card flex min-w-0 items-start gap-3 p-4 no-underline transition hover:border-primary/40 sm:gap-4 sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-10 sm:w-10">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-foreground">AI Chat</p>
            <p className="mt-1 text-xs text-muted-foreground">Ask questions about your lessons.</p>
          </div>
        </Link>
      </div>

      {subscription?.applyFreeLimits && subscription.limits && (
        <GlassCard className="mb-8 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Free plan usage</h3>
            </div>
            <Link to="/student/subscription" className="text-xs text-primary hover:underline">
              View plans
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Storage</span>
                <span>{formatBytes(subscription.usage.storageBytes)} / {formatBytes(subscription.limits.storageBytes)}</span>
              </div>
              <Progress value={usagePct(subscription.usage.storageBytes, subscription.limits.storageBytes)} size="sm" radius="xl" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Lessons today</span>
                <span>{subscription.usage.lessonsToday} / {subscription.limits.lessonsPerDay}</span>
              </div>
              <Progress value={usagePct(subscription.usage.lessonsToday, subscription.limits.lessonsPerDay)} size="sm" radius="xl" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Uploads today</span>
                <span>{subscription.usage.materialsToday} / {subscription.limits.materialsPerDay}</span>
              </div>
              <Progress value={usagePct(subscription.usage.materialsToday, subscription.limits.materialsPerDay)} size="sm" radius="xl" />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Chat today</span>
                <span>{subscription.usage.chatMessagesToday} / {subscription.limits.chatMessagesPerDay}</span>
              </div>
              <Progress value={usagePct(subscription.usage.chatMessagesToday, subscription.limits.chatMessagesPerDay)} size="sm" radius="xl" />
            </div>
          </div>
        </GlassCard>
      )}

      <div className="mb-8 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Zap} label="Total XP" value={formatNumber(data.totalXp)} highlight />
        {isSchoolStudent && (
          <StatCard
            icon={Trophy}
            label={organizationName ? `${organizationName} rank` : 'School rank'}
            value={`#${data.orgRank || '—'}`}
          />
        )}
        <StatCard icon={Flame} label="Streak" value={formatNumber(data.currentStreak)} />
        <StatCard icon={Target} label="Completion" value={`${Math.round(data.lessonCompletionRate)}%`} />
        <StatCard icon={Brain} label="Quiz avg" value={`${Math.round(data.averageQuizScore)}%`} />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4">
        <StatCard icon={Layers} label="Lessons done" value={formatNumber(data.lessonsCompleted)} />
        <StatCard icon={Timer} label="Study time" value={`${formatNumber(data.totalStudyTimeMinutes)}m`} />
        <StatCard icon={Sparkles} label="Due cards" value={formatNumber(data.dueFlashcards)} />
        <StatCard icon={Target} label="Quizzes left" value={formatNumber(data.pendingQuizzes)} />
      </div>

      <div className="mb-8 grid min-w-0 gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {user?.id && (
            <StudentLearningReportCard
              organizationId={organizationId}
              studentId={user.id}
              weakTopics={data.weakTopics ?? []}
            />
          )}

          <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-2">
            <GlassCard className="min-w-0 overflow-hidden p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-foreground">Continue learning</h3>
                <Link to="/student/lessons" className="shrink-0 text-xs text-primary hover:underline">View all</Link>
              </div>
              {continueList.length ? (
                <ul className="space-y-2 sm:space-y-3">
                  {continueList.slice(0, 4).map((item) => (
                    <li key={item.lessonId} className="min-w-0">
                      <Link
                        to={`/student/lessons/${item.lessonId}`}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-3.5 no-underline transition hover:border-primary/30 sm:px-4 sm:py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-medium leading-snug text-foreground">{item.title}</p>
                          <StudentSourceLabel
                            isPersonal={item.isPersonal}
                            organizationName={organizationName}
                            isSchoolStudent={isSchoolStudent}
                            className="mt-0.5 block truncate"
                          />
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.progressPercent > 0
                              ? `${Math.round(item.progressPercent)}% complete`
                              : 'Opened — continue reading'}
                          </p>
                        </div>
                        <Play className="h-4 w-4 shrink-0 text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Open a lesson from Self-learn or Lessons to see it here.</p>
              )}
            </GlassCard>

            <GlassCard className="min-w-0 overflow-hidden p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="font-display text-sm font-semibold text-foreground">Recommended</h3>
              </div>
              {(data.recommendedLessons?.length ?? 0) ? (
                <ul className="space-y-2 sm:space-y-3">
                  {data.recommendedLessons.slice(0, 4).map((lesson) => (
                    <li key={lesson.id} className="min-w-0">
                      <Link
                        to={`/student/lessons/${lesson.id}`}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-3.5 no-underline transition hover:border-primary/30 sm:px-4 sm:py-3"
                      >
                        <p className="line-clamp-2 min-w-0 flex-1 font-medium leading-snug text-foreground">{lesson.title}</p>
                        <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">You are caught up.</p>
              )}
            </GlassCard>
          </div>

          {(data.weakTopics?.length ?? 0) > 0 && (
            <GlassCard className="mt-6 min-w-0 overflow-hidden p-4 sm:p-6">
              <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Focus areas</h3>
              <div className="flex flex-wrap gap-2">
                {data.weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="max-w-full truncate rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        <div className="min-w-0">
          <LeaderboardPanel compact />
        </div>
      </div>

      {recentMaterials.length > 0 && (
        <GlassCard className="mb-8 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Your materials
            </h3>
            <Link to="/student/self-learn" className="text-xs text-primary hover:underline">
              Manage uploads
            </Link>
          </div>
          <ul className="space-y-2 sm:space-y-3">
            {recentMaterials.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-2.5 rounded-xl border border-border/50 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4 sm:py-3"
              >
                <div className="min-w-0">
                  <p className="line-clamp-2 font-medium leading-snug text-foreground">{m.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{m.type ?? 'Material'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {m.processingStatus && <StatusBadge status={m.processingStatus} />}
                  <Link
                    to={`/student/materials/${m.id}/preview`}
                    state={{ returnTo: '/student/dashboard' }}
                    className={`${dashActionBtn} no-underline`}
                  >
                    Preview
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      <div className="my-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Practice by subject
          </h2>
          <Link to="/student/practice" className="text-xs text-primary hover:underline">
            View all practice
          </Link>
        </div>

        {grouped.length ? (
          <div className="space-y-3 sm:space-y-4">
            {grouped.map((subject) => {
              const key = subjectKey(subject);
              const isOpen = expandedSubjects[key] === true;
              return (
              <GlassCard key={key} className="min-w-0 overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => toggleSubject(key)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-muted/20 sm:p-5"
                  aria-expanded={isOpen}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                    <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground sm:text-base">
                      {subject.subjectName}
                    </h3>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {subject.lessons.length}
                    {' lesson'}
                    {subject.lessons.length !== 1 ? 's' : ''}
                  </span>
                </button>
                <Collapse in={isOpen}>
                <ul className="space-y-3 border-t border-border/40 px-4 pb-4 pt-3 sm:space-y-4 sm:px-5 sm:pb-5 sm:pt-4">
                  {subject.lessons.map((lesson) => {
                    const pendingFc = lesson.flashcards.filter((f) => f.status === 'pending').length;
                    const pendingQuiz = lesson.quizzes.find(
                      (q) => q.status === 'pending' || q.status === 'in_progress',
                    );
                    return (
                      <li
                        key={lesson.lessonId}
                        className="rounded-xl border border-border/50 bg-muted/20 p-3 sm:p-4"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="min-w-0">
                            <Link
                              to={`/student/lessons/${lesson.lessonId}`}
                              className="line-clamp-2 font-medium leading-snug text-foreground hover:text-primary"
                            >
                              {lesson.lessonTitle}
                            </Link>
                            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                              {lesson.quizzes.map((q) => (
                                <AdesiaBadge key={q.quizId} status={quizStatusBadge(q)}>
                                  Quiz: {quizStatusLabel(q)}
                                  {q.status === 'completed' && q.score != null ? ` (${Math.round(q.score)}%)` : ''}
                                </AdesiaBadge>
                              ))}
                              {lesson.flashcards.length > 0 && (
                                <AdesiaBadge status={pendingFc > 0 ? 'ready' : 'active'}>
                                  {lesson.flashcards.length} flashcard{lesson.flashcards.length === 1 ? '' : 's'}
                                  {pendingFc > 0 ? ` · ${pendingFc} pending` : ''}
                                </AdesiaBadge>
                              )}
                            </div>
                          </div>
                          {(pendingFc > 0 || pendingQuiz) && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                              {pendingQuiz && (
                                <button
                                  type="button"
                                  className={dashPrimaryBtn}
                                  onClick={() => {
                                    setActiveQuiz({ ...pendingQuiz, retake: false });
                                  }}
                                >
                                  <Play className="h-3.5 w-3.5" />
                                  {pendingQuiz.status === 'in_progress' ? 'Continue quiz' : 'Take quiz'}
                                </button>
                              )}
                              {pendingFc > 0 && (
                                <button
                                  type="button"
                                  className={dashActionBtn}
                                  onClick={() => setActiveFlashcards(
                                    lesson.flashcards.filter((f) => f.status === 'pending'),
                                  )}
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  Review cards
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                </Collapse>
              </GlassCard>
            );
            })}
          </div>
        ) : (
          <GlassCard className="p-6 text-center sm:p-8">
            <p className="text-sm text-muted-foreground">No quizzes or flashcards yet.</p>
            <Link to="/student/lessons" className="mt-3 inline-block text-sm text-primary hover:underline">
              Browse lessons
            </Link>
          </GlassCard>
        )}
      </div>

      <Modal
        opened={Boolean(activeQuiz)}
        onClose={() => (quizRetake ? (() => { setActiveQuiz(null); setQuizRetake(false); })() : setQuizExitOpen(true))}
        title={activeQuiz?.title || 'Quiz'}
        size="lg"
        centered
        closeOnClickOutside={false}
      >
        {activeQuiz && (
          <QuizStudy
            quiz={{
              quizId: activeQuiz.quizId,
              lessonId: activeQuiz.lessonId,
              lessonTitle: activeQuiz.lessonTitle,
              title: activeQuiz.title,
              questions: activeQuiz.questions ?? [],
            }}
            draft={quizRetake ? null : activeQuiz.draft}
            retakeMode={quizRetake}
            onRegisterSave={(fn) => { quizSaveRef.current = fn; }}
            onCloseWithUnsaved={() => setQuizExitOpen(true)}
            onCloseRequest={() => {
              setActiveQuiz(null);
              setQuizRetake(false);
              setQuizExitOpen(false);
            }}
            onComplete={(result) => {
              const wasRetake = result?.practice || quizRetake;
              setActiveQuiz(null);
              setQuizRetake(false);
              setQuizExitOpen(false);
              if (!wasRetake) reload();
            }}
            onSaved={reload}
          />
        )}
      </Modal>

      <QuizCloseModal
        opened={quizExitOpen}
        onClose={() => setQuizExitOpen(false)}
        saving={quizExitSaving}
        onSaveAndExit={async () => {
          if (quizSaveRef.current) {
            setQuizExitSaving(true);
            try {
              await quizSaveRef.current();
              setActiveQuiz(null);
              setQuizExitOpen(false);
              reload();
            } finally {
              setQuizExitSaving(false);
            }
          } else {
            setActiveQuiz(null);
            setQuizExitOpen(false);
          }
        }}
        onLeaveWithoutSaving={() => {
          setActiveQuiz(null);
          setQuizExitOpen(false);
        }}
      />

      <Modal
        opened={Boolean(activeFlashcards?.length)}
        onClose={() => setActiveFlashcards(null)}
        title="Flashcard practice"
        size="lg"
        centered
      >
        {activeFlashcards?.length > 0 && (
          <FlashcardStudy
            cards={activeFlashcards.map((f) => ({
              flashcardId: f.flashcardId,
              question: f.question,
              answer: f.answer,
              lessonId: f.lessonId,
            }))}
            onComplete={() => {
              setActiveFlashcards(null);
              reload();
            }}
          />
        )}
      </Modal>
    </>
  );
};

export default StudentDashboardPage;
