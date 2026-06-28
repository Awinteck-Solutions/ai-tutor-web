import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Collapse, Modal, Progress, SegmentedControl, Select, Tabs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Clock,
  Eye,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import ListGridToolbar, { filterSelectClass } from '../../../shared/components/ListGridToolbar';
import DataListFooter from '../../../shared/components/DataListFooter';
import { useClientList } from '../../../shared/hooks/useClientList';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { StudentPracticeSkeleton } from '../components/StudentPageSkeleton';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import FlashcardStudy from '../components/FlashcardStudy';
import QuizStudy from '../components/QuizStudy';
import QuizCloseModal from '../components/QuizCloseModal';
import { getPractice, saveQuizDraft } from '../services/student.services';
import StudentSourceLabel from '../components/StudentSourceLabel';

const PRACTICE_PAGE_SIZE = 9;
const FLASHCARD_PAGE_SIZE = 6;

const quizStatusFilter = {
  key: 'status',
  defaultValue: 'all',
  apply: (item, value) => {
    if (value === 'all') return true;
    if (value === 'pending') {
      return item.status === 'pending' || item.status === 'in_progress';
    }
    return item.status === value;
  },
};

const sourceFilterDef = {
  key: 'source',
  defaultValue: 'all',
  apply: (item, value) => {
    if (value === 'all') return true;
    if (value === 'self') return Boolean(item.isPersonal);
    return !item.isPersonal;
  },
};

const flashcardStatusFilter = {
  key: 'status',
  defaultValue: 'all',
  apply: (group, value) => {
    if (value === 'all') return true;
    if (value === 'pending') return group.reviewed < group.total;
    return group.reviewed >= group.total && group.total > 0;
  },
};

const matchPracticeSearch = (item, query, keys) =>
  keys.some((key) => String(item[key] ?? '').toLowerCase().includes(query));

const quizCompletionPercent = (q) => {
  if (q.status === 'completed') return 100;
  return q.progressPercent ?? 0;
};

const quizProgressLabel = (q) => {
  const pct = quizCompletionPercent(q);
  return `${pct}% complete`;
};

const PracticeIconBox = ({ icon: Icon, tone = 'primary', className = '' }) => {
  const tones = {
    primary: 'bg-primary/15 text-primary',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  };
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${tones[tone] ?? tones.primary} ${className}`}>
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
  );
};

const practiceActionBtn = 'btn-outline flex min-h-9 flex-1 items-center justify-center gap-1.5 !px-3 !py-2 text-xs sm:min-h-0 sm:flex-initial sm:!px-2.5 sm:!py-1.5';
const practicePrimaryBtn = 'btn-gradient flex min-h-10 w-full items-center justify-center gap-1.5 !px-4 !py-2.5 text-xs sm:min-h-0 sm:w-auto sm:!px-3 sm:!py-1.5';

const quizIcon = (status) => {
  if (status === 'completed') return { Icon: CheckCircle, tone: 'emerald' };
  if (status === 'in_progress') return { Icon: Clock, tone: 'amber' };
  return { Icon: ClipboardList, tone: 'blue' };
};

const StudentPracticePage = () => {
  const { organizationId, organizationName, isSchoolStudent } = useAuth();
  const [searchParams] = useSearchParams();
  const lessonFilter = searchParams.get('lessonId');
  const [data, setData] = useState({ quizzes: [], flashcards: [], flashcardGroups: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('quizzes');
  const [answersQuiz, setAnswersQuiz] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizRetake, setQuizRetake] = useState(false);
  const [activeFlashcards, setActiveFlashcards] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [quizExitOpen, setQuizExitOpen] = useState(false);
  const [quizExitSaving, setQuizExitSaving] = useState(false);
  const quizSaveRef = useRef(null);

  const load = useCallback(() => {
    if (!organizationId) return;
    setLoading(true);
    getPractice(organizationId)
      .then((practiceData) => {
        setData(practiceData);
        const groups = practiceData?.flashcardGroups ?? [];
        setExpandedLessons(
          Object.fromEntries(groups.map((g) => [g.lessonId, false])),
        );
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => { load(); }, [load]);

  const lessonScopedQuizzes = useMemo(() => {
    const list = data.quizzes ?? [];
    if (!lessonFilter) return list;
    return list.filter((q) => q.lessonId === lessonFilter);
  }, [data.quizzes, lessonFilter]);

  const flashcardGroups = useMemo(() => {
    const groups = data.flashcardGroups ?? [];
    if (!lessonFilter) return groups;
    return groups.filter((g) => g.lessonId === lessonFilter);
  }, [data.flashcardGroups, lessonFilter]);

  const quizList = useClientList(lessonScopedQuizzes, {
    pageSize: PRACTICE_PAGE_SIZE,
    searchKeys: ['title', 'lessonTitle', 'subjectName'],
    matchSearch: matchPracticeSearch,
    filters: [quizStatusFilter, sourceFilterDef],
  });

  const flashcardList = useClientList(flashcardGroups, {
    pageSize: FLASHCARD_PAGE_SIZE,
    searchKeys: ['lessonTitle', 'subjectName'],
    matchSearch: matchPracticeSearch,
    filters: [flashcardStatusFilter, sourceFilterDef],
  });

  const activeList = tab === 'quizzes' ? quizList : flashcardList;

  const handleTabChange = (value) => {
    const from = value === 'quizzes' ? flashcardList : quizList;
    const to = value === 'quizzes' ? quizList : flashcardList;
    const source = from.filterValues.source ?? 'all';
    if (to.filterValues.source !== source) {
      to.setFilter('source', source);
    }
    setTab(value);
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizRetake(false);
    setQuizExitOpen(false);
    quizSaveRef.current = null;
  };

  const isLessonExpanded = (lessonId) => expandedLessons[lessonId] === true;

  const toggleLessonExpanded = (lessonId) => {
    setExpandedLessons((prev) => ({
      ...prev,
      [lessonId]: !prev[lessonId],
    }));
  };

  const handleQuizExitSave = async () => {
    if (quizSaveRef.current) {
      setQuizExitSaving(true);
      try {
        await quizSaveRef.current();
        notifications.show({ title: 'Saved', message: 'Quiz progress saved', color: 'green' });
        closeQuiz();
        load();
      } catch (err) {
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      } finally {
        setQuizExitSaving(false);
      }
      return;
    }
    if (activeQuiz?.quizId && activeQuiz?.draft) {
      setQuizExitSaving(true);
      try {
        await saveQuizDraft(activeQuiz.quizId, {
          answers: activeQuiz.draft.answers,
          currentStep: activeQuiz.draft.currentStep,
        });
        closeQuiz();
        load();
      } finally {
        setQuizExitSaving(false);
      }
      return;
    }
    closeQuiz();
  };

  if (!organizationId) return <EmptyOrgHint />;
  if (loading) return <StudentPracticeSkeleton />;

  const summary = data.summary ?? {};

  return (
    <>
      <PageHeader
        title="Practice"
        gradientWord="Practice"
        description={
          lessonFilter
            ? 'Quizzes and flashcards for this lesson — study in practice mode.'
            : 'All your quizzes and flashcards — pending and completed, with answer review.'
        }
      />

      {lessonFilter && (
        <p className="mb-4 text-sm text-muted-foreground">
          Filtered to one lesson.{' '}
          <Link to="/student/practice" className="text-primary hover:underline">Show all</Link>
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <GlassCard className="flex min-w-0 items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
          <PracticeIconBox icon={Target} tone="amber" />
          <div className="min-w-0">
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">Quizzes pending</p>
            <p className="font-display text-lg font-bold text-foreground sm:text-xl">{summary.quizzesPending ?? 0}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex min-w-0 items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
          <PracticeIconBox icon={CheckCircle} tone="emerald" />
          <div className="min-w-0">
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">Quizzes done</p>
            <p className="font-display text-lg font-bold text-foreground sm:text-xl">{summary.quizzesCompleted ?? 0}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex min-w-0 items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
          <PracticeIconBox icon={Layers} tone="blue" />
          <div className="min-w-0">
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">Cards pending</p>
            <p className="font-display text-lg font-bold text-foreground sm:text-xl">{summary.flashcardsPending ?? 0}</p>
          </div>
        </GlassCard>
        <GlassCard className="flex min-w-0 items-center gap-2.5 p-3 sm:gap-3 sm:p-4">
          <PracticeIconBox icon={Sparkles} tone="primary" />
          <div className="min-w-0">
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">Cards reviewed</p>
            <p className="font-display text-lg font-bold text-foreground sm:text-xl">{summary.flashcardsCompleted ?? 0}</p>
          </div>
        </GlassCard>
      </div>

      <ListGridToolbar
        search={activeList.search}
        onSearchChange={activeList.setSearch}
        searchPlaceholder={tab === 'quizzes' ? 'Search quizzes…' : 'Search flashcard lessons…'}
        showSearch
      >
        <Select
          label="Source"
          data={[
            { value: 'all', label: 'All sources' },
            { value: 'school', label: isSchoolStudent && organizationName ? organizationName : 'School' },
            { value: 'self', label: 'Self-learn' },
          ]}
          value={activeList.filterValues.source ?? 'all'}
          onChange={(v) => {
            quizList.setFilter('source', v ?? 'all');
            flashcardList.setFilter('source', v ?? 'all');
          }}
          className={filterSelectClass}
          size="sm"
        />
      </ListGridToolbar>

      <Tabs value={tab} onChange={handleTabChange}>
        <Tabs.List className="mb-4 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="quizzes" leftSection={<BookOpen className="h-4 w-4 shrink-0" />}>
            <span className="truncate">Quizzes ({quizList.filtered.length})</span>
          </Tabs.Tab>
          <Tabs.Tab value="flashcards" leftSection={<Layers className="h-4 w-4 shrink-0" />}>
            <span className="truncate">Flashcards ({flashcardList.filtered.length})</span>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="quizzes">
          <div className="glass-card min-w-0 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h3 className="font-display text-sm font-semibold text-foreground">Quizzes</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {quizList.totalItems} quiz{quizList.totalItems === 1 ? '' : 'zes'}
                  {quizList.search.trim() || quizList.filterValues.status !== 'all' || quizList.filterValues.source !== 'all'
                    ? ' matching filters'
                    : ''}
                </p>
              </div>
              <SegmentedControl
                fullWidth
                className="sm:!w-auto"
                size="xs"
                value={quizList.filterValues.status ?? 'all'}
                onChange={(v) => quizList.setFilter('status', v ?? 'all')}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Done', value: 'completed' },
                ]}
              />
            </div>

            <div className="grid min-w-0 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3">
              {quizList.paginatedItems.length ? quizList.paginatedItems.map((q) => {
              const { Icon: QuizIcon, tone } = quizIcon(q.status);
              return (
              <GlassCard key={q.quizId} className="flex min-w-0 flex-col p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <PracticeIconBox icon={QuizIcon} tone={tone} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
                      <h3 className="line-clamp-2 min-w-0 flex-1 font-display text-sm font-semibold leading-snug text-foreground">
                        {q.title || 'Quiz'}
                      </h3>
                      <AdesiaBadge status={q.status === 'completed' ? 'active' : 'draft'}>
                        {q.status === 'completed' ? 'Completed' : q.status === 'in_progress' ? 'In progress' : 'Pending'}
                      </AdesiaBadge>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {q.lessonTitle}
                      {(q.isPersonal || (isSchoolStudent && organizationName && !q.isPersonal)) && (
                        <>
                          {' · '}
                          <StudentSourceLabel
                            isPersonal={q.isPersonal}
                            organizationName={organizationName}
                            isSchoolStudent={isSchoolStudent}
                            className="inline"
                          />
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{quizProgressLabel(q)}</span>
                  </div>
                  <Progress
                    value={quizCompletionPercent(q)}
                    size="sm"
                    radius="xl"
                  />
                </div>
                {q.status === 'completed' && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Score: {Math.round(q.score ?? 0)}% · {formatDateTime(q.completedAt)}
                  </p>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  {q.status !== 'completed' ? (
                    <button
                      type="button"
                      className={practicePrimaryBtn}
                      onClick={() => {
                        setQuizRetake(false);
                        setActiveQuiz(q);
                      }}
                    >
                      <Play className="h-3.5 w-3.5" />
                      {q.status === 'in_progress' ? 'Continue quiz' : 'Take quiz'}
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <button
                        type="button"
                        className={practicePrimaryBtn}
                        onClick={() => {
                          setQuizRetake(true);
                          setActiveQuiz(q);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Retake
                      </button>
                      <button
                        type="button"
                        className={practiceActionBtn}
                        onClick={() => setAnswersQuiz(q)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View answers
                      </button>
                    </div>
                  )}
                  <Link
                    to={`/student/lessons/${q.lessonId}`}
                    className={`${practiceActionBtn} no-underline`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Open lesson
                  </Link>
                </div>
              </GlassCard>
            );
            }            ) : (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                {quizList.filtered.length ? 'No quizzes on this page.' : 'No quizzes match your filters.'}
              </p>
            )}
            </div>

            <DataListFooter
              rangeStart={quizList.rangeStart}
              rangeEnd={quizList.rangeEnd}
              totalItems={quizList.totalItems}
              page={quizList.page}
              totalPages={quizList.totalPages}
              pageSize={PRACTICE_PAGE_SIZE}
              onPageChange={quizList.setPage}
            />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="flashcards">
          <div className="glass-card min-w-0 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h3 className="font-display text-sm font-semibold text-foreground">Flashcard lessons</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {flashcardList.totalItems} lesson{flashcardList.totalItems === 1 ? '' : 's'}
                  {flashcardList.search.trim() || flashcardList.filterValues.status !== 'all' || flashcardList.filterValues.source !== 'all'
                    ? ' matching filters'
                    : ''}
                </p>
              </div>
              <SegmentedControl
                fullWidth
                className="sm:!w-auto"
                size="xs"
                value={flashcardList.filterValues.status ?? 'all'}
                onChange={(v) => flashcardList.setFilter('status', v ?? 'all')}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'In progress', value: 'pending' },
                  { label: 'Done', value: 'completed' },
                ]}
              />
            </div>

            <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
              {flashcardList.paginatedItems.length ? flashcardList.paginatedItems.map((group) => {
              const isOpen = isLessonExpanded(group.lessonId);
              return (
              <GlassCard key={group.lessonId} className="min-w-0 overflow-hidden p-0">
                <button
                  type="button"
                  className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-muted/20 sm:p-5"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleLessonExpanded(group.lessonId);
                  }}
                  aria-expanded={isOpen}
                >
                  <div className="flex w-full items-start gap-3">
                    <PracticeIconBox icon={BookOpen} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-1.5">
                          <ChevronDown
                            className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground">
                            {group.lessonTitle}
                          </h3>
                        </div>
                        <AdesiaBadge status={group.progressPercent >= 100 ? 'active' : 'draft'}>
                          {group.reviewed}/{group.total}
                        </AdesiaBadge>
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
                        <GraduationCap className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{group.subjectName}</span>
                        <span aria-hidden>·</span>
                        <StudentSourceLabel
                          isPersonal={group.isPersonal}
                          organizationName={organizationName}
                          isSchoolStudent={isSchoolStudent}
                        />
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:pl-[52px]">
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>Lesson progress</span>
                      <span>{group.progressPercent}%</span>
                    </div>
                    <Progress value={group.progressPercent} size="sm" radius="xl" />
                  </div>
                </button>

                <Collapse in={isOpen}>
                  <div className="border-t border-border/40 px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-2">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        className={practicePrimaryBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFlashcards(group.flashcards ?? []);
                        }}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Review deck ({group.total})
                      </button>
                      <Link
                        to={`/student/lessons/${group.lessonId}`}
                        className={`${practiceActionBtn} no-underline`}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        Open lesson
                      </Link>
                    </div>
                    <ul className="space-y-2">
                      {(group.flashcards ?? []).map((f) => (
                        <li
                          key={f.flashcardId}
                          className="flex flex-col gap-2.5 rounded-xl border border-border/40 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:rounded-lg sm:border-0 sm:p-2 sm:px-3"
                        >
                          <div className="flex min-w-0 items-start gap-2.5">
                            {f.status === 'completed' ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <p className="line-clamp-3 text-sm leading-snug text-foreground sm:line-clamp-2">{f.question}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:gap-2">
                            <button
                              type="button"
                              className={practiceActionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveFlashcards([f]);
                              }}
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Review
                            </button>
                            <button
                              type="button"
                              className={practiceActionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAnswersQuiz({
                                  title: 'Flashcard',
                                  lessonTitle: f.lessonTitle,
                                  answers: [{
                                    question: f.question,
                                    userAnswer: f.status === 'completed' ? f.lastResult : '—',
                                    correctAnswer: f.answer,
                                    isCorrect: f.lastResult === 'CORRECT',
                                  }],
                                });
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Q&A
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Collapse>
              </GlassCard>
            );
            }            ) : (
              <p className="py-12 text-center text-muted-foreground">
                {flashcardList.filtered.length ? 'No groups on this page.' : 'No flashcard groups match your filters.'}
              </p>
            )}
            </div>

            <DataListFooter
              rangeStart={flashcardList.rangeStart}
              rangeEnd={flashcardList.rangeEnd}
              totalItems={flashcardList.totalItems}
              page={flashcardList.page}
              totalPages={flashcardList.totalPages}
              pageSize={FLASHCARD_PAGE_SIZE}
              onPageChange={flashcardList.setPage}
            />
          </div>
        </Tabs.Panel>
      </Tabs>

      <Modal
        opened={Boolean(answersQuiz)}
        onClose={() => setAnswersQuiz(null)}
        title={answersQuiz?.title || 'Review'}
        size="lg"
        centered
        classNames={{ content: 'glass-card !bg-card' }}
      >
        {answersQuiz && (
          <div className="space-y-4">
            {answersQuiz.lessonTitle && (
              <p className="text-sm text-muted-foreground">{answersQuiz.lessonTitle}</p>
            )}
            {(answersQuiz.answers ?? []).map((a, i) => (
              <div
                key={a.questionId || i}
                className={`rounded-xl border p-4 ${
                  a.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <p className="text-sm font-medium text-foreground">{a.question}</p>
                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">Your answer: </span>
                  {a.userAnswer || '—'}
                </p>
                {!a.isCorrect && (
                  <p className="mt-1 text-sm text-primary">
                    Correct: {a.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        opened={Boolean(activeQuiz)}
        onClose={() => (quizRetake ? closeQuiz() : setQuizExitOpen(true))}
        title={activeQuiz?.title || 'Quiz'}
        size="lg"
        centered
        closeOnClickOutside={false}
        classNames={{ content: 'glass-card !bg-card' }}
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
            onCloseRequest={closeQuiz}
            onComplete={(result) => {
              const wasRetake = result?.practice || quizRetake;
              closeQuiz();
              if (!wasRetake) load();
            }}
            onSaved={load}
          />
        )}
      </Modal>

      <QuizCloseModal
        opened={quizExitOpen}
        onClose={() => setQuizExitOpen(false)}
        saving={quizExitSaving}
        onSaveAndExit={handleQuizExitSave}
        onLeaveWithoutSaving={closeQuiz}
      />

      <Modal
        opened={Boolean(activeFlashcards?.length)}
        onClose={() => setActiveFlashcards(null)}
        title="Flashcard review"
        size="lg"
        centered
        classNames={{ content: 'glass-card !bg-card' }}
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
              load();
            }}
          />
        )}
      </Modal>

    </>
  );
};

export default StudentPracticePage;
