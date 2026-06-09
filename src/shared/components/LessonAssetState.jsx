import { AdesiaBadge } from './AdesiaBadge';
import StatusBadge from './StatusBadge';

const notReady = () => (
  <span className="text-xs text-muted-foreground">—</span>
);

const CompactReady = ({ count, unit }) => (
  <span className="inline-flex w-fit max-w-full flex-col items-start gap-0.5">
    <AdesiaBadge status="success" className="!normal-case">
      {count} {unit}
    </AdesiaBadge>
    <span className="text-[10px] font-medium text-emerald-700 dark:text-primary">Ready</span>
  </span>
);

export const FlashcardStateCell = ({ lesson }) => {
  if (lesson.generationStatus !== 'COMPLETED') return notReady();

  const count = lesson.flashcardCount ?? 0;
  if (count > 0 || lesson.flashcardsGenerated) {
    return <CompactReady count={count} unit={count === 1 ? 'card' : 'cards'} />;
  }

  return <AdesiaBadge status="draft" className="!normal-case">None</AdesiaBadge>;
};

export const QuizStateCell = ({ lesson }) => {
  if (lesson.generationStatus !== 'COMPLETED') return notReady();

  const status = lesson.quizGenerationStatus;
  const count = lesson.quizQuestionCount ?? 0;

  if (status && status !== 'COMPLETED') {
    return (
      <span className="inline-flex w-fit max-w-full flex-col items-start gap-0.5">
        <StatusBadge status={status} />
        {count > 0 && (
          <span className="text-[10px] text-muted-foreground">{count} Q</span>
        )}
      </span>
    );
  }

  if (count > 0 || lesson.quizGenerated) {
    return <CompactReady count={count} unit={count === 1 ? 'Q' : 'Qs'} />;
  }

  return <AdesiaBadge status="draft" className="!normal-case">None</AdesiaBadge>;
};

/** Combined flashcards + quiz for narrow viewports */
export const LessonAssetsMobileCell = ({ lesson }) => (
  <div className="flex min-w-0 flex-col gap-1.5">
    <FlashcardStateCell lesson={lesson} />
    <QuizStateCell lesson={lesson} />
  </div>
);

export default FlashcardStateCell;
