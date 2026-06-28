import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader, Progress, Radio, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ChevronRight, Eye, Loader2, Save, Trophy } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { saveQuizDraft, submitQuiz, submitQuizPractice } from '../services/student.services';

const answersFromDraft = (draft, questions) => {
  if (!draft?.answers?.length) return { answers: {}, step: draft?.currentStep ?? 0 };
  const map = {};
  draft.answers.forEach((a) => {
    map[a.questionId] = a.answer;
  });
  const step = Math.min(
    Math.max(0, draft.currentStep ?? 0),
    Math.max(0, questions.length - 1),
  );
  return { answers: map, step };
};

const normalizeAnswer = (value) => (value ?? '').trim().toLowerCase();

const answersMatch = (userAnswer, expected) => {
  const user = normalizeAnswer(userAnswer);
  const correct = normalizeAnswer(expected);
  return Boolean(user) && Boolean(correct) && user === correct;
};

const mapGradedAnswersToReview = (gradedAnswers = []) =>
  gradedAnswers.map((a) => ({
    questionId: a.questionId?.toString?.() ?? a.questionId,
    question: a.question ?? '',
    userAnswer: a.userAnswer ?? a.answer ?? '',
    correctAnswer: a.correctAnswer ?? '',
    explanation: a.explanation,
    isCorrect: Boolean(a.isCorrect),
  }));

const gradePracticeQuiz = (questions, answers) => {
  let correctAnswers = 0;
  const answerReview = questions.map((question) => {
    const qId = question.id || question._id;
    const userAnswer = answers[qId] ?? '';
    const expected = (question.correctAnswer ?? '').trim();
    const isCorrect = answersMatch(userAnswer, expected);
    if (isCorrect) correctAnswers += 1;
    return {
      questionId: qId,
      question: question.question,
      userAnswer,
      correctAnswer: expected,
      explanation: question.explanation,
      isCorrect,
    };
  });
  const totalQuestions = questions.length;
  const score = totalQuestions
    ? Math.round((correctAnswers / totalQuestions) * 100)
    : 0;
  return { score, correctAnswers, totalQuestions, practice: true, answerReview };
};

const buildAnswerReview = (questions, answers) =>
  questions.map((question) => {
    const qId = question.id || question._id;
    const userAnswer = answers[qId] ?? '';
    const expected = (question.correctAnswer ?? '').trim();
    const isCorrect = answersMatch(userAnswer, expected);
    return {
      questionId: qId,
      question: question.question,
      userAnswer,
      correctAnswer: expected,
      explanation: question.explanation,
      isCorrect,
    };
  });

const QuizStudy = ({
  quiz,
  draft: initialDraft,
  retakeMode = false,
  practiceOnly = false,
  onComplete,
  onSaved,
  onCloseRequest,
  onCloseWithUnsaved,
  onRegisterSave,
}) => {
  const questions = useMemo(() => quiz?.questions ?? [], [quiz]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (retakeMode) {
      setAnswers({});
      setStep(0);
      setResult(null);
      setShowAnswerReview(false);
      dirtyRef.current = false;
      return;
    }
    const { answers: restored, step: restoredStep } = answersFromDraft(initialDraft, questions);
    setAnswers(restored);
    setStep(restoredStep);
    setResult(null);
    setShowAnswerReview(false);
    dirtyRef.current = false;
  }, [quiz?.quizId, initialDraft, questions, retakeMode]);

  const hasProgress = useMemo(
    () => Object.values(answers).some((v) => v?.trim?.() || v),
    [answers],
  );

  const buildPayload = useCallback(() => ({
    answers: questions.map((question) => ({
      questionId: question.id || question._id,
      answer: answers[question.id || question._id] ?? '',
    })),
    currentStep: step,
  }), [answers, questions, step]);

  const persistDraft = useCallback(async () => {
    if (practiceOnly || !quiz?.quizId || !hasProgress) return null;
    setSaving(true);
    try {
      const saved = await saveQuizDraft(quiz.quizId, buildPayload());
      dirtyRef.current = false;
      onSaved?.(saved);
      return saved;
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return null;
    } finally {
      setSaving(false);
    }
  }, [quiz?.quizId, hasProgress, buildPayload, onSaved, practiceOnly]);

  useEffect(() => {
    if (practiceOnly) return undefined;
    onRegisterSave?.(() => persistDraft());
  }, [onRegisterSave, persistDraft, practiceOnly]);

  useEffect(() => {
    const handler = (e) => {
      if (!dirtyRef.current && !hasProgress) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasProgress]);

  const requestClose = useCallback(() => {
    if (practiceOnly || !hasProgress) {
      onCloseRequest?.();
      return;
    }
    onCloseWithUnsaved?.();
  }, [practiceOnly, hasProgress, onCloseRequest, onCloseWithUnsaved]);

  if (!quiz) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No quiz available — complete a lesson first.</p>
      </GlassCard>
    );
  }

  if (result) {
    if (showAnswerReview && result.answerReview?.length) {
      return (
        <div className="space-y-4">
          {(result.answerReview ?? []).map((a, i) => (
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
              <p className="mt-1 text-sm">
                <span className="text-muted-foreground">Correct answer: </span>
                <span className={a.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}>
                  {a.correctAnswer || '—'}
                </span>
              </p>
              {a.explanation ? (
                <p className="mt-2 text-xs text-muted-foreground">{a.explanation}</p>
              ) : null}
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-outline !px-4 !py-2 text-sm"
              onClick={() => setShowAnswerReview(false)}
            >
              Back to score
            </button>
            <GradientButton type="button" onClick={() => onComplete?.(result)}>
              Done
            </GradientButton>
          </div>
        </div>
      );
    }

    return (
      <GlassCard className="quiz-result-enter p-8 text-center">
        <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
        <p className="font-display text-3xl font-bold tabular-nums text-foreground">{result.score}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.correctAnswers} of {result.totalQuestions} correct
        </p>
        {result.practice ? (
          <p className="mt-3 text-sm text-muted-foreground">Chat practice — not saved to your record</p>
        ) : result.xp?.awarded ? (
          <p className="mt-3 text-sm font-medium text-primary">+{result.xp.xpAmount} XP earned</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {result.answerReview?.length > 0 && (
            <button
              type="button"
              className="btn-outline inline-flex items-center gap-2 !px-4 !py-2 text-sm"
              onClick={() => setShowAnswerReview(true)}
            >
              <Eye className="h-4 w-4" />
              View answers
            </button>
          )}
          <GradientButton type="button" onClick={() => onComplete?.(result)}>
            Done
          </GradientButton>
        </div>
      </GlassCard>
    );
  }

  const q = questions[step];
  const qId = q?.id || q?._id;
  const progress = questions.length ? ((step + 1) / questions.length) * 100 : 0;

  const setAnswer = (value) => {
    dirtyRef.current = true;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    const payload = {
      answers: questions.map((question) => ({
        questionId: question.id || question._id,
        answer: answers[question.id || question._id] ?? '',
      })),
      timeSpentSeconds: 60,
    };

    setSubmitting(true);
    try {
      if (practiceOnly) {
        setResult(gradePracticeQuiz(questions, answers));
        dirtyRef.current = false;
      } else {
        const res = retakeMode
          ? await submitQuizPractice(quiz.quizId, payload)
          : await submitQuiz(quiz.quizId, payload);
        const answerReview = res?.answers?.length
          ? mapGradedAnswersToReview(res.answers)
          : buildAnswerReview(questions, answers);
        setResult({
          ...res,
          practice: retakeMode || res.practice,
          answerReview,
        });
        dirtyRef.current = false;
        if (!retakeMode && res?.xp?.awarded) {
          notifications.show({
            title: `+${res.xp.xpAmount} XP`,
            message: 'First quiz completion',
            color: 'green',
          });
        }
      }
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    const saved = await persistDraft();
    if (saved) {
      notifications.show({
        title: 'Progress saved',
        message: 'You can continue this quiz later from Practice.',
        color: 'green',
      });
      onCloseRequest?.();
    }
  };

  const currentAnswer = answers[qId];
  const canAdvance = Boolean(currentAnswer?.trim?.() || currentAnswer);

  return (
    <div className="quiz-study relative min-h-[200px]">
      {submitting && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-background/85 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader size="md" type="dots" />
          <p className="mt-3 text-sm font-medium text-foreground">Submitting your quiz…</p>
          <p className="mt-1 text-xs text-muted-foreground">This may take a few seconds</p>
        </div>
      )}
      {retakeMode && (
        <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          Practice retake — your score will not be saved or affect XP.
        </p>
      )}
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>{quiz.lessonTitle} — {quiz.title || 'Quiz'}</span>
          <span>Question {step + 1} / {questions.length}</span>
        </div>
        <Progress value={progress} size="sm" radius="xl" className="quiz-progress-bar" />
      </div>

      <GlassCard key={qId} className="quiz-question-enter p-6">
        <p className="mb-4 font-display text-base font-semibold text-foreground">{q.question}</p>

        {q.options?.length ? (
          <Radio.Group value={currentAnswer} onChange={setAnswer}>
            <div className="space-y-2">
              {q.options.map((opt) => (
                <Radio
                  key={opt}
                  value={opt}
                  label={opt}
                  className="rounded-lg border border-border/50 px-3 py-2"
                />
              ))}
            </div>
          </Radio.Group>
        ) : (
          <TextInput
            placeholder="Your answer"
            value={currentAnswer ?? ''}
            onChange={(e) => setAnswer(e.target.value)}
          />
        )}
      </GlassCard>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          disabled={submitting}
          onClick={requestClose}
        >
          Close quiz
        </button>
        <div className="flex flex-wrap gap-2">
          {!retakeMode && !practiceOnly && (
            <button
              type="button"
              className="btn-outline flex items-center gap-2 !px-3 !py-2 text-sm"
              disabled={!hasProgress || saving}
              onClick={handleSaveAndExit}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save & continue later'}
            </button>
          )}
          <GradientButton
            type="button"
            disabled={!canAdvance || submitting}
            className="flex items-center gap-2 !px-4 !py-2"
            onClick={handleNext}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                {step < questions.length - 1 ? 'Next' : 'Submit quiz'}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default QuizStudy;
