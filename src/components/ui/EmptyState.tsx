import type { LucideIcon } from 'lucide-react';
import { PrimaryButton } from './Button';

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-surface-alt-light dark:bg-surface-alt">
        <Icon size={32} className="text-primary" strokeWidth={1.75} />
      </div>
      <p className="mb-1.5 text-lg font-bold text-text-primary-light dark:text-text-primary">{title}</p>
      {subtitle && <p className="mb-6 max-w-sm text-sm leading-5 text-text-secondary-light dark:text-text-secondary">{subtitle}</p>}
      {actionLabel && onAction && (
        <PrimaryButton onClick={onAction} className="w-full max-w-60">
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}