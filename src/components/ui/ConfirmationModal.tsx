import { PrimaryButton, SecondaryButton } from './Button';
import { cn } from '@/lib/utils';

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onCancel}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative w-full max-w-sm rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface p-6">
        <h2 className="mb-2 text-lg font-bold text-text-primary-light dark:text-text-primary">{title}</h2>
        <p className="mb-6 text-sm leading-5 text-text-secondary-light dark:text-text-secondary">{message}</p>
        <div className="flex gap-3">
          <SecondaryButton onClick={onCancel} className="flex-1" disabled={loading}>
            {cancelLabel}
          </SecondaryButton>
          <PrimaryButton
            onClick={onConfirm}
            loading={loading}
            className={cn('flex-1', destructive && 'from-danger to-danger bg-none bg-danger')}
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}