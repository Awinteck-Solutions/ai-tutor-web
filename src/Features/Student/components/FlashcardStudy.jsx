import { useState } from 'react';
import { Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Check, Loader2, RotateCcw, X } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { submitFlashcardReview } from '../services/student.services';

const FlashcardStudy = ({ cards = [], onProgress, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(0);

  const card = cards[index];
  if (!cards.length) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No flashcards due for review right now.</p>
      </GlassCard>
    );
  }

  if (index >= cards.length) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Session complete</p>
        <p className="mt-2 text-sm text-muted-foreground">
          You reviewed {done} card{done === 1 ? '' : 's'} this round.
        </p>
      </GlassCard>
    );
  }

  const handleReview = async (result) => {
    setSubmitting(true);
    try {
      const res = await submitFlashcardReview(card.flashcardId, result);
      if (res?.xp?.awarded) {
        notifications.show({
          title: `+${res.xp.xpAmount} XP`,
          message: 'Completed all flashcards in this lesson',
          color: 'green',
        });
      }
      setDone((d) => d + 1);
      onProgress?.(index + 1, cards.length);
      setFlipped(false);
      setIndex((i) => i + 1);
      if (index + 1 >= cards.length) onComplete?.();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flashcard-study relative min-h-[280px]">
      {submitting && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-background/85 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader size="md" type="dots" />
          <p className="mt-3 text-sm font-medium text-foreground">Saving your review…</p>
        </div>
      )}
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Card {index + 1} of {cards.length}</span>
        <span>{Math.round(((index) / cards.length) * 100)}% through deck</span>
      </div>

      <button
        type="button"
        className="flashcard-scene mx-auto w-full max-w-lg disabled:cursor-not-allowed disabled:opacity-60"
        disabled={submitting}
        onClick={() => !submitting && setFlipped((f) => !f)}
        aria-label="Flip flashcard"
      >
        <div className={`flashcard-card ${flipped ? 'flipped' : ''}`}>
          <GlassCard className="flashcard-face front relative flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
            <p className="font-display text-lg font-semibold text-foreground">{card.question}</p>
            <p className="mt-6 text-xs text-muted-foreground">Tap to reveal answer</p>
          </GlassCard>
          <GlassCard className="flashcard-face back flex min-h-[220px] items-center justify-center p-8 text-center">
            <p className="text-base text-foreground">{card.answer}</p>
          </GlassCard>
        </div>
      </button>

      {flipped && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 animate-in fade-in">
          <button
            type="button"
            className="btn-outline flex items-center gap-2 !border-red-500/40 !px-4 !py-2"
            disabled={submitting}
            onClick={() => handleReview('INCORRECT')}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {submitting ? 'Saving…' : 'Needs work'}
          </button>
          <button
            type="button"
            className="btn-outline flex items-center gap-2 !px-4 !py-2"
            disabled={submitting}
            onClick={() => setFlipped(false)}
          >
            <RotateCcw className="h-4 w-4" />
            Flip back
          </button>
          <GradientButton
            type="button"
            disabled={submitting}
            className="flex items-center gap-2 !px-4 !py-2"
            onClick={() => handleReview('CORRECT')}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {submitting ? 'Saving…' : 'Got it'}
          </GradientButton>
        </div>
      )}
    </div>
  );
};

export default FlashcardStudy;
