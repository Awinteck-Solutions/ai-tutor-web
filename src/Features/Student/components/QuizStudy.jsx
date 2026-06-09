import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader, Progress, Radio, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ChevronRight, Loader2, Save, Trophy } from 'lucide-react';
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

const QuizStudy = ({
  quiz,
  draft: initialDraft,
  retakeMode = false,
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
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (retakeMode) {
      setAnswers({});
      setStep(0);
      setResult(null);
      dirtyRef.current = false;
      return;
    }
    const { answers: restored, step: restoredStep } = answersFromDraft(initialDraft, questions);
    setAnswers(restored);
    setStep(restoredStep);
    setResult(null);
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
    if (!quiz?.quizId || !hasProgress) return null;
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
  }, [quiz?.quizId, hasProgress, buildPayload, onSaved]);

  useEffect(() => {
    onRegisterSave?.(() => persistDraft());
  }, [onRegisterSave, persistDraft]);

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
    if (!hasProgress) {
      onCloseRequest?.();
      return;
    }
    onCloseWithUnsaved?.();
  }, [hasProgress, onCloseRequest, onCloseWithUnsaved]);

  if (!quiz) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No quiz available — complete a lesson first.</p>
      </GlassCard>
    );
  }

  if (result) {
    return (
      <GlassCard className="quiz-result-enter p-8 text-center">
        <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
        <p className="font-display text-3xl font-bold tabular-nums text-foreground">{result.score}%</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.correctAnswers} of {result.totalQuestions} correct
        </p>
        {result.practice ? (
          <p className="mt-3 text-sm text-muted-foreground">Practice retake — not saved to your record</p>
        ) : result.xp?.awarded ? (
          <p className="mt-3 text-sm font-medium text-primary">+{result.xp.xpAmount} XP earned</p>
        ) : null}
        <GradientButton type="button" className="mt-6" onClick={() => onComplete?.(result)}>
          Done
        </GradientButton>
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
      const res = retakeMode
        ? await submitQuizPractice(quiz.quizId, payload)
        : await submitQuiz(quiz.quizId, payload);
      setResult({ ...res, practice: retakeMode || res.practice });
      dirtyRef.current = false;
      if (!retakeMode && res?.xp?.awarded) {
        notifications.show({
          title: `+${res.xp.xpAmount} XP`,
          message: 'First quiz completion',
          color: 'green',
        });
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
          {!retakeMode && (
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
