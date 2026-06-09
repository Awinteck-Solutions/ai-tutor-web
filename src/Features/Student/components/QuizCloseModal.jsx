import { Modal } from '@mantine/core';
import { GradientButton } from '../../../shared/components/GradientButton';

const QuizCloseModal = ({
  opened,
  onClose,
  onSaveAndExit,
  onLeaveWithoutSaving,
  saving = false,
}) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title="Leave quiz?"
    size="sm"
    centered
    zIndex={400}
    classNames={{
      content: 'student-drawer-solid !bg-card max-w-[min(100vw-2rem,24rem)]',
      header: 'student-drawer-solid-header !bg-card',
      body: 'student-drawer-solid !bg-card',
    }}
  >
    <p className="text-sm leading-relaxed text-muted-foreground">
      You have unsaved answers. Save your progress to continue later, or leave without saving.
    </p>
    <div className="mt-6 flex flex-col gap-2">
      <GradientButton
        type="button"
        className="w-full justify-center !py-2.5 text-sm"
        disabled={saving}
        onClick={onSaveAndExit}
      >
        {saving ? 'Saving…' : 'Save for later'}
      </GradientButton>
      <button
        type="button"
        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
        onClick={onClose}
      >
        Continue quiz
      </button>
      <button
        type="button"
        className="w-full rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
        disabled={saving}
        onClick={onLeaveWithoutSaving}
      >
        Leave without saving
      </button>
    </div>
  </Modal>
);

export default QuizCloseModal;
