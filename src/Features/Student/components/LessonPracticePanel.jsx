import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Progress, Tabs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Circle,
  ClipboardList,
  Clock,
  Eye,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import FlashcardStudy from './FlashcardStudy';
import QuizStudy from './QuizStudy';
import QuizCloseModal from './QuizCloseModal';
import { getPractice, saveQuizDraft } from '../services/student.services';

const quizCompletionPercent = (q) => {
  if (q.status === 'completed') return 100;
  return q.progressPercent ?? 0;
};

const quizProgressLabel = (q) => `${quizCompletionPercent(q)}% complete`;

const quizIcon = (status) => {
  if (status === 'completed') return { Icon: CheckCircle, tone: 'emerald' };
  if (status === 'in_progress') return { Icon: Clock, tone: 'amber' };
  return { Icon: ClipboardList, tone: 'blue' };
};

const PracticeIconBox = ({ icon: Icon, tone = 'primary' }) => {
  const tones = {
    primary: 'bg-primary/15 text-primary',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  };
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone] ?? tones.primary}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
};

const LessonPracticePanel = ({ lessonId, organizationId }) => {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [tab, setTab] = useState('quizzes');
  const [answersQuiz, setAnswersQuiz] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizRetake, setQuizRetake] = useState(false);
  const [activeFlashcards, setActiveFlashcards] = useState(null);
  const [quizExitOpen, setQuizExitOpen] = useState(false);
  const [quizExitSaving, setQuizExitSaving] = useState(false);
  const quizSaveRef = useRef(null);

  const load = useCallback(() => {
    if (!organizationId || !lessonId) return;
    setLoading(true);
    getPractice(organizationId)
      .then((data) => {
        setQuizzes((data?.quizzes ?? []).filter((q) => q.lessonId === lessonId));
        const group = (data?.flashcardGroups ?? []).find((g) => g.lessonId === lessonId);
        setFlashcards(group?.flashcards ?? []);
      })
      .catch((err) => {
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
        setQuizzes([]);
        setFlashcards([]);
      })
      .finally(() => setLoading(false));
  }, [organizationId, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const flashcardProgress = useMemo(() => {
    if (!flashcards.length) return 0;
    const reviewed = flashcards.filter((f) => f.status === 'completed').length;
    return Math.round((reviewed / flashcards.length) * 100);
  }, [flashcards]);

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizRetake(false);
    setQuizExitOpen(false);
    quizSaveRef.current = null;
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

  if (loading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading practice…</p>;
  }

  return (
    <>
      <Tabs
        value={tab}
        onChange={setTab}
        classNames={{ list: 'mb-4 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1' }}
      >
        <Tabs.List>
          <Tabs.Tab value="quizzes" leftSection={<BookOpen className="h-4 w-4" />}>
            Quizzes ({quizzes.length})
          </Tabs.Tab>
          <Tabs.Tab value="flashcards" leftSection={<Layers className="h-4 w-4" />}>
            Flashcards ({flashcards.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="quizzes">
          {quizzes.length === 0 ? (
            <GlassCard className="p-6 text-center text-sm text-muted-foreground">
              No quizzes for this lesson yet.
            </GlassCard>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((q) => {
                const { Icon: QuizIcon, tone } = quizIcon(q.status);
                return (
                  <GlassCard key={q.quizId} className="flex flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <PracticeIconBox icon={QuizIcon} tone={tone} />
                      <AdesiaBadge status={q.status === 'completed' ? 'active' : 'draft'}>
                        {q.status === 'completed' ? 'Completed' : q.status === 'in_progress' ? 'In progress' : 'Pending'}
                      </AdesiaBadge>
                    </div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{q.title || 'Quiz'}</h3>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{quizProgressLabel(q)}</span>
                      </div>
                      <Progress value={quizCompletionPercent(q)} size="sm" radius="xl" />
                    </div>
                    {q.status === 'completed' && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Score: {Math.round(q.score ?? 0)}% · {formatDateTime(q.completedAt)}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {q.status !== 'completed' ? (
                        <button
                          type="button"
                          className="btn-outline flex items-center gap-1 !px-2 !py-1 text-xs"
                          onClick={() => {
                            setQuizRetake(false);
                            setActiveQuiz(q);
                          }}
                        >
                          <Play className="h-3 w-3" />
                          {q.status === 'in_progress' ? 'Continue quiz' : 'Take quiz'}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn-outline flex items-center gap-1 !px-2 !py-1 text-xs"
                            onClick={() => {
                              setQuizRetake(true);
                              setActiveQuiz(q);
                            }}
                          >
                            <RotateCcw className="h-3 w-3" />
                            Retake
                          </button>
                          <button
                            type="button"
                            className="btn-outline flex items-center gap-1 !px-2 !py-1 text-xs"
                            onClick={() => setAnswersQuiz(q)}
                          >
                            <Eye className="h-3 w-3" />
                            View answers
                          </button>
                        </>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="flashcards">
          {flashcards.length === 0 ? (
            <GlassCard className="p-6 text-center text-sm text-muted-foreground">
              No flashcards for this lesson yet.
            </GlassCard>
          ) : (
            <GlassCard className="overflow-hidden p-0">
              <div className="border-b border-border/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">Flashcard deck</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {flashcards.filter((f) => f.status === 'completed').length}
                      {' / '}
                      {flashcards.length}
                      {' reviewed'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-outline flex items-center gap-1 !px-3 !py-1.5 text-xs"
                    onClick={() => setActiveFlashcards(flashcards)}
                  >
                    <Sparkles className="h-3 w-3" />
                    Review all
                  </button>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{flashcardProgress}%</span>
                  </div>
                  <Progress value={flashcardProgress} size="sm" radius="xl" />
                </div>
              </div>
              <ul className="divide-y divide-border/40">
                {flashcards.map((f) => (
                  <li
                    key={f.flashcardId}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {f.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <p className="truncate text-sm text-foreground">{f.question}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="btn-outline flex items-center gap-1 !px-2 !py-1 text-xs"
                        onClick={() => setActiveFlashcards([f])}
                      >
                        <Sparkles className="h-3 w-3" />
                        Review
                      </button>
                      <button
                        type="button"
                        className="btn-outline flex items-center gap-1 !px-2 !py-1 text-xs"
                        onClick={() => setAnswersQuiz({
                          title: 'Flashcard',
                          answers: [{
                            question: f.question,
                            userAnswer: f.status === 'completed' ? f.lastResult : '—',
                            correctAnswer: f.answer,
                            isCorrect: f.lastResult === 'CORRECT',
                          }],
                        })}
                      >
                        <Eye className="h-3 w-3" />
                        View Q&A
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
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

export default LessonPracticePanel;
