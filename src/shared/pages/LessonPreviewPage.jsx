import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Anchor, Breadcrumbs, Tabs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft, BookOpen, Brain, CheckCircle2, ChevronRight, FileStack, HelpCircle, Map, Sparkles, Target,
} from 'lucide-react';
import MarkdownContent from '../components/MarkdownContent';
import LessonContentViewer from '../components/LessonContentViewer';
import ConceptMapView from '../components/ConceptMapView';
import LearningDNAInsights from '../components/LearningDNAInsights';
import { usePreviewOrganizationId } from '../hooks/usePreviewOrganizationId';
import { useAuth } from '../context/AuthContext';
import { platformContentPath } from '../../Features/Platform/platform.paths';
import { PageHeader } from '../components/PageShell';
import { EmptyOrgHint } from '../components/PageLoader';
import { ContentFadeIn, LessonPreviewSkeleton } from '../components/LoadingPrimitives';
import StatusBadge from '../components/StatusBadge';
import { AdesiaBadge } from '../components/AdesiaBadge';
import { FlashcardStateCell, QuizStateCell } from '../components/LessonAssetState';
import { GradientButton } from '../components/GradientButton';
import { formatDateTime, getErrorMessage } from '../utils/formatters';
import NotesPanel from '../../Features/Student/components/NotesPanel';
import LessonPracticePanel from '../../Features/Student/components/LessonPracticePanel';
import ContinueLearningCard from '../../Features/Student/components/ContinueLearningCard';
import LessonGroupManager from '../../Features/Student/components/LessonGroupManager';
import {
  completeLesson,
  getLessonDetail,
  getLessonSources,
} from '../../Features/Student/services/student.services';
import {
  getLearningDNA,
  getLessonContentSummary,
  resolveConceptMap,
} from '../services/lessonExperience.services';
import {
  generateLessonFlashcards,
  generateLessonQuiz,
  getLesson,
  getLessonFlashcards,
  getLessonQuizQuestions,
  getLessonSources as getOrgLessonSources,
} from '../../Features/Organization/services/organization.services';

const mapSourcesToMaterials = (sources) => {
  const list = sources?.materials ?? [];
  return list.map((m, index) => ({
    id: m.materialId ?? m.id,
    title: m.materialName ?? m.title ?? 'Material',
    type: m.type ?? 'Material',
    order: m.order ?? index,
  }));
};

const LessonPreviewPage = () => {
  const { lessonId } = useParams();
  const location = useLocation();
  const organizationId = usePreviewOrganizationId();
  const { user, isPlatformAdmin } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [progress, setProgress] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [lessonState, setLessonState] = useState(null);
  const [conceptMap, setConceptMap] = useState(null);
  const [learningDNA, setLearningDNA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [completing, setCompleting] = useState(false);

  const isStudent = location.pathname.startsWith('/student');
  const isTeacher = location.pathname.startsWith('/teacher');
  const isPlatform = location.pathname.startsWith('/platform');
  /** Super admins get the full living-lesson experience (pages, state, DNA, practice). */
  const fullLessonExperience = isStudent || isPlatformAdmin;

  const lessonsPath = isPlatform
    ? platformContentPath({ organizationId, type: 'lessons' })
    : isStudent
      ? '/student/lessons'
      : isTeacher
        ? '/teacher/lessons'
        : '/admin/lessons';

  const materialsPath = isPlatform
    ? platformContentPath({ organizationId, type: 'materials' })
    : isTeacher
      ? '/teacher/materials'
      : '/admin/materials';

  const resolveMaterials = useCallback(async (lessonData) => {
    if (lessonData?.materials?.length) return lessonData.materials;
    try {
      const sources = fullLessonExperience && isStudent
        ? await getLessonSources(organizationId, lessonId)
        : await getOrgLessonSources(lessonId, organizationId);
      return mapSourcesToMaterials(sources);
    } catch {
      return [];
    }
  }, [fullLessonExperience, isStudent, organizationId, lessonId]);

  const load = useCallback(async () => {
    if (!organizationId || !lessonId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      if (fullLessonExperience) {
        const detail = await getLessonDetail(organizationId, lessonId);
        const lessonData = detail?.lesson ?? null;
        const materials = await resolveMaterials(lessonData);
        setLesson(lessonData ? { ...lessonData, materials } : null);
        setProgress(detail?.progress ?? null);
        setLessonContent(detail?.lessonContent ?? null);
        setLessonState(detail?.lessonState ?? null);

        const [mapData, dnaData] = await Promise.all([
          resolveConceptMap({
            lessonId,
            organizationId,
            userId: user?.id,
            lesson: lessonData,
            lessonContent: detail?.lessonContent,
            lessonState: detail?.lessonState,
            initialMap: detail?.conceptMap,
          }),
          getLearningDNA(organizationId).catch(() => null),
        ]);
        setConceptMap(mapData);
        setLearningDNA(dnaData);

        if (!isStudent) {
          const [cards, questions] = await Promise.all([
            getLessonFlashcards(lessonId, organizationId).catch(() => []),
            getLessonQuizQuestions(lessonId, organizationId).catch(() => []),
          ]);
          setFlashcards(Array.isArray(cards) ? cards : cards?.items ?? []);
          setQuizQuestions(Array.isArray(questions) ? questions : questions?.items ?? []);
        } else {
          setFlashcards([]);
          setQuizQuestions([]);
        }
      } else {
        const lessonData = await getLesson(lessonId, organizationId);
        const materials = await resolveMaterials(lessonData);
        setLesson({ ...lessonData, materials });
        setProgress(null);
        setLessonState(null);
        setLearningDNA(null);

        const [cards, questions, contentSummary] = await Promise.all([
          getLessonFlashcards(lessonId, organizationId).catch(() => []),
          getLessonQuizQuestions(lessonId, organizationId).catch(() => []),
          getLessonContentSummary(lessonId, organizationId).catch(() => null),
        ]);
        const mapData = await resolveConceptMap({
          lessonId,
          organizationId,
          userId: user?.id,
          lesson: lessonData,
          lessonContent: contentSummary,
          lessonState: null,
        });
        setFlashcards(Array.isArray(cards) ? cards : cards?.items ?? []);
        setQuizQuestions(Array.isArray(questions) ? questions : questions?.items ?? []);
        setLessonContent(contentSummary);
        setConceptMap(mapData);
      }
    } catch (err) {
      setLoadError(getErrorMessage(err));
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  }, [organizationId, lessonId, fullLessonExperience, isStudent, resolveMaterials, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerateFlashcards = async () => {
    setGenerating('flashcards');
    try {
      await generateLessonFlashcards(lessonId, organizationId);
      notifications.show({ title: 'Queued', message: 'Flashcard generation started', color: 'green' });
      setTimeout(load, 2000);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateQuiz = async () => {
    setGenerating('quiz');
    try {
      await generateLessonQuiz(lessonId, organizationId);
      notifications.show({ title: 'Queued', message: 'Quiz generation started', color: 'green' });
      setTimeout(load, 2000);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setGenerating(null);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeLesson(lessonId);
      notifications.show({ title: 'Complete', message: 'Lesson marked complete', color: 'green' });
      load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setCompleting(false);
    }
  };

  if (!organizationId) return <EmptyOrgHint />;

  const isComplete = lesson?.generationStatus === 'COMPLETED';
  const progressComplete = progress?.status === 'COMPLETED' || (progress?.progressPercent ?? 0) >= 100;
  const materialCount = lesson?.materials?.length ?? 0;

  return (
    <>
      {isStudent ? (
        <Breadcrumbs separator={<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />} mb="md">
          <Anchor component={Link} to="/student/dashboard" size="sm" c="dimmed">
            Dashboard
          </Anchor>
          <Anchor component={Link} to={lessonsPath} size="sm" c="dimmed">
            Lessons
          </Anchor>
          <Anchor size="sm">{lesson?.title ?? 'Lesson'}</Anchor>
        </Breadcrumbs>
      ) : (
        <Link
          to={lessonsPath}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to lessons
        </Link>
      )}

      {loading ? (
        <LessonPreviewSkeleton />
      ) : loadError && !lesson ? (
        <div className="glass-card flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">{loadError}</p>
          <GradientButton type="button" onClick={load} className="!px-4 !py-2">
            Try again
          </GradientButton>
        </div>
      ) : !lesson ? (
        <div className="glass-card px-6 py-16 text-center text-sm text-muted-foreground">
          Lesson not found or you do not have access to view it.
        </div>
      ) : (
        <ContentFadeIn>
        <PageHeader
          title={lesson?.title || 'Lesson'}
          gradientWord={fullLessonExperience && !isPlatformAdmin ? undefined : 'preview'}
          description={
            fullLessonExperience
              ? lesson?.summary || 'Read the lesson, review source materials, and practice.'
              : 'Review lesson content, source materials, flashcards, and quiz questions.'
          }
          action={fullLessonExperience && !progressComplete && (
            <GradientButton type="button" onClick={handleComplete} disabled={completing} className="!px-3 !py-2">
              <CheckCircle2 className="h-4 w-4" />
              {completing ? 'Saving…' : 'Mark complete'}
            </GradientButton>
          )}
        />

      {fullLessonExperience && lesson && learningDNA && (
        <div className="mb-6">
          <LearningDNAInsights learningDNA={learningDNA} />
        </div>
      )}

      {isPlatformAdmin && lesson && (
        <p className="mb-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold text-primary">Full lesson experience</span>
          {' — '}
          Paginated content, lesson state, concept map, practice, and Learning DNA — same as students see.
        </p>
      )}

      {fullLessonExperience && lesson && (
        <div className="mb-4 flex flex-wrap gap-2">
          <AdesiaBadge status={progressComplete ? 'active' : 'draft'}>
            {progressComplete
              ? 'Completed'
              : `${Math.round(progress?.progressPercent ?? 0)}% progress`}
          </AdesiaBadge>
          {lesson.isPersonal && (
            <AdesiaBadge status="draft">Self-learn</AdesiaBadge>
          )}
          {lesson.studentLevel && (
            <AdesiaBadge status="draft">
              {lesson.studentLevel.charAt(0).toUpperCase() + lesson.studentLevel.slice(1)}
            </AdesiaBadge>
          )}
          {lesson.groupTitle && (
            <AdesiaBadge status="draft">{lesson.groupTitle}</AdesiaBadge>
          )}
        </div>
      )}

      {isStudent && lesson?.isPersonal && (
        <div className="mb-6 space-y-4">
          <ContinueLearningCard
            organizationId={organizationId}
            lessonId={lessonId}
            lesson={lesson}
            nextSuggestion={lesson.nextLessonSuggestion}
          />
          <LessonGroupManager
            organizationId={organizationId}
            lessonId={lessonId}
            currentGroupId={lesson.groupId}
            compact
            onChanged={load}
          />
        </div>
      )}

      {!isStudent && lesson?.studentLevel && (
        <div className="mb-4 flex flex-wrap gap-2">
          <AdesiaBadge status="draft">
            {lesson.studentLevel.charAt(0).toUpperCase() + lesson.studentLevel.slice(1)} level
          </AdesiaBadge>
        </div>
      )}

      {lesson && (
        <div className="space-y-6">
          <div className="glass-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lesson status</p>
              <div className="mt-1"><StatusBadge status={lesson.generationStatus} /></div>
            </div>
            {!isStudent && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Flashcards</p>
                  <div className="mt-1"><FlashcardStateCell lesson={lesson} /></div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Quiz</p>
                  <div className="mt-1"><QuizStateCell lesson={lesson} /></div>
                </div>
              </>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Materials</p>
              <p className="mt-1 font-medium">{materialCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
              <p className="mt-1 font-medium">{formatDateTime(lesson.createdAt)}</p>
            </div>
          </div>

          <Tabs
            defaultValue="content"
            classNames={{ list: 'mb-4 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1' }}
          >
            <Tabs.List>
              <Tabs.Tab value="content" leftSection={<BookOpen className="h-3.5 w-3.5" />}>Content</Tabs.Tab>
              <Tabs.Tab value="materials" leftSection={<FileStack className="h-3.5 w-3.5" />}>
                Materials ({materialCount})
              </Tabs.Tab>
              {fullLessonExperience && (
                <>
                  <Tabs.Tab value="notes">Notes</Tabs.Tab>
                  <Tabs.Tab value="concept-map" leftSection={<Map className="h-3.5 w-3.5" />}>
                    Concept map
                  </Tabs.Tab>
                  <Tabs.Tab value="practice" leftSection={<Target className="h-3.5 w-3.5" />}>
                    Practice
                  </Tabs.Tab>
                </>
              )}
              {!isStudent && (
                <>
                  <Tabs.Tab value="flashcards" leftSection={<Brain className="h-3.5 w-3.5" />}>
                    Flashcards ({flashcards.length})
                  </Tabs.Tab>
                  <Tabs.Tab value="quiz" leftSection={<HelpCircle className="h-3.5 w-3.5" />}>
                    Quiz ({quizQuestions.length})
                  </Tabs.Tab>
                </>
              )}
            </Tabs.List>

            <Tabs.Panel value="content">
              <div className="space-y-5">
                {lesson.summary && (
                  <div className="glass-card p-5">
                    <h3 className="mb-2 text-sm font-semibold">Summary</h3>
                    <MarkdownContent content={lesson.summary} />
                  </div>
                )}
                {lesson.objectives?.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="mb-2 text-sm font-semibold">Objectives</h3>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {lesson.objectives.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                )}

                {lessonContent?.pages?.length > 0 ? (
                  <LessonContentViewer
                    lessonId={lessonId}
                    organizationId={organizationId}
                    contentSummary={lessonContent}
                    lessonState={lessonState}
                    readOnly={!fullLessonExperience}
                    onStateChange={(nextState) => {
                      setLessonState(nextState);
                      setProgress((prev) => ({
                        ...prev,
                        progressPercent: nextState.progress,
                        currentPageId: nextState.currentPageId,
                        completedPages: nextState.completedPages,
                      }));
                      if (user?.id) {
                        resolveConceptMap({
                          lessonId,
                          organizationId,
                          userId: user.id,
                          lesson,
                          lessonContent,
                          lessonState: nextState,
                        })
                          .then(setConceptMap)
                          .catch(() => {});
                      }
                    }}
                  />
                ) : lesson.content ? (
                  <div className="glass-card p-5">
                    <h3 className="mb-2 text-sm font-semibold">Full content</h3>
                    <MarkdownContent content={lesson.content} />
                  </div>
                ) : (
                  !lesson.summary && !isComplete && (
                    <p className="text-sm text-muted-foreground">
                      Lesson content will appear once generation completes.
                    </p>
                  )
                )}
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="concept-map">
              <div className="glass-card p-5">
                <ConceptMapView
                  conceptMap={conceptMap}
                  lesson={lesson}
                  lessonContent={lessonContent}
                  lessonState={lessonState}
                />
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="materials">
              <div className="glass-card p-5">
                {!materialCount ? (
                  <div className="text-sm text-muted-foreground">
                    <p>No source materials linked to this lesson.</p>
                    {lesson.isPersonal && (
                      <p className="mt-2">
                        Lessons built from a description only do not have uploaded files.
                        {' '}
                        <Link to="/student/self-learn" className="text-primary hover:underline">
                          Open Self-learn
                        </Link>
                        {' '}
                        to add materials and rebuild from files.
                      </p>
                    )}
                  </div>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {lesson.materials.map((m, index) => (
                      <li
                        key={m.id || index}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{m.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.type || 'Material'}
                            {m.order != null ? ` · Order ${m.order + 1}` : ''}
                            {lesson.isPersonal ? ' · Your upload' : ''}
                          </p>
                        </div>
                        {m.id && (isStudent ? (
                          <Link
                            to={`/student/materials/${m.id}/preview`}
                            state={{ returnTo: `/student/lessons/${lessonId}` }}
                            className="btn-outline shrink-0 !px-2 !py-1 text-xs no-underline"
                          >
                            View material
                          </Link>
                        ) : isPlatform ? (
                          <Link
                            to={`${materialsPath}/${m.id}/preview?organizationId=${organizationId}`}
                            className="btn-outline shrink-0 !px-2 !py-1 text-xs no-underline"
                          >
                            View material
                          </Link>
                        ) : (
                          <Link
                            to={`${materialsPath}/${m.id}/preview`}
                            className="btn-outline shrink-0 !px-2 !py-1 text-xs no-underline"
                          >
                            View material
                          </Link>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Tabs.Panel>

            {fullLessonExperience && (
              <>
                <Tabs.Panel value="notes">
                  <NotesPanel lessonId={lessonId} />
                </Tabs.Panel>
                <Tabs.Panel value="practice">
                  <LessonPracticePanel lessonId={lessonId} organizationId={organizationId} />
                </Tabs.Panel>
              </>
            )}

            {!isStudent && (
              <>
            <Tabs.Panel value="flashcards">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {flashcards.length
                    ? `${flashcards.length} flashcard${flashcards.length === 1 ? '' : 's'} generated from this lesson.`
                    : 'No flashcards yet for this lesson.'}
                </p>
                {isComplete && !flashcards.length && (
                  <GradientButton
                    type="button"
                    className="!px-3 !py-2"
                    onClick={handleGenerateFlashcards}
                    disabled={generating === 'flashcards'}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate flashcards
                  </GradientButton>
                )}
              </div>
              {flashcards.length === 0 ? (
                <div className="glass-card p-5 text-sm text-muted-foreground">
                  {isComplete ? 'Generate flashcards to study key terms from this lesson.' : 'Complete lesson generation first.'}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {flashcards.map((card, index) => (
                    <div key={card.id || index} className="glass-card p-4">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Question {index + 1}
                      </p>
                      <p className="mb-3 text-sm font-medium">{card.question}</p>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-primary">Answer</p>
                      <p className="text-sm text-muted-foreground">{card.answer}</p>
                      {card.difficulty && (
                        <div className="mt-3">
                          <AdesiaBadge status="draft">{card.difficulty}</AdesiaBadge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="quiz">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {quizQuestions.length
                    ? `${quizQuestions.length} quiz question${quizQuestions.length === 1 ? '' : 's'}.`
                    : 'No quiz questions yet for this lesson.'}
                </p>
                {isComplete && !quizQuestions.length && lesson.quizGenerationStatus !== 'PROCESSING' && (
                  <GradientButton
                    type="button"
                    className="!px-3 !py-2"
                    onClick={handleGenerateQuiz}
                    disabled={generating === 'quiz'}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate quiz
                  </GradientButton>
                )}
              </div>
              {lesson.quizGenerationStatus && lesson.quizGenerationStatus !== 'COMPLETED' && (
                <div className="glass-card mb-4 p-4">
                  <StatusBadge status={lesson.quizGenerationStatus} />
                </div>
              )}
              {quizQuestions.length === 0 ? (
                <div className="glass-card p-5 text-sm text-muted-foreground">
                  {isComplete ? 'Generate a quiz to assess understanding of this lesson.' : 'Complete lesson generation first.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((q, index) => (
                    <div key={q.id || index} className="glass-card p-4">
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Question {index + 1} · {q.type?.replace(/_/g, ' ') ?? 'Question'}
                      </p>
                      <p className="mb-3 text-sm font-medium">{q.question}</p>
                      {q.options?.length > 0 && (
                        <ul className="mb-3 space-y-1">
                          {q.options.map((opt) => (
                            <li
                              key={opt}
                              className={`rounded-lg border px-3 py-2 text-sm ${
                                opt === q.correctAnswer
                                  ? 'border-emerald-600/40 bg-emerald-50 text-foreground dark:border-primary/40 dark:bg-primary/10'
                                  : 'border-border/50 text-muted-foreground'
                              }`}
                            >
                              {opt}
                              {opt === q.correctAnswer && (
                                <span className="ml-2 text-[10px] font-semibold uppercase text-emerald-700 dark:text-primary">Correct</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Explanation: </span>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Panel>
              </>
            )}
          </Tabs>
        </div>
      )}
        </ContentFadeIn>
      )}
    </>
  );
};

export default LessonPreviewPage;
