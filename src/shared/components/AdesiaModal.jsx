import { Modal } from '@mantine/core';
import { GradientButton } from './GradientButton';

export const AdesiaModal = ({
  opened,
  onClose,
  title,
  children,
  size = 'md',
  submitLabel,
  onSubmit,
  submitting = false,
  submitDisabled = false,
}) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={title}
    centered
    size={size}
    overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    classNames={{
      title: 'font-display font-semibold text-foreground',
      header: 'border-b border-border/50',
      content: 'glass-card !bg-card',
      body: 'pt-4',
    }}
  >
    {children}
    {submitLabel && onSubmit && (
      <GradientButton
        type="button"
        onClick={onSubmit}
        disabled={submitting || submitDisabled}
        className="mt-4 w-full justify-center"
      >
        {submitting ? 'Saving…' : submitLabel}
      </GradientButton>
    )}
  </Modal>
);

export default AdesiaModal;
