import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export function CategoryChip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!selected}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors',
        selected
          ? 'border-primary bg-primary text-text-primary'
          : 'border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt text-text-secondary-light dark:text-text-secondary hover:bg-border-light dark:hover:bg-border'
      )}
    >
      {label}
    </button>
  );
}

export function FilterChip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!selected}
      className={cn(
        'shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
        selected
          ? 'bg-secondary text-bg'
          : 'bg-surface-alt-light dark:bg-surface-alt text-text-secondary-light dark:text-text-secondary hover:opacity-80'
      )}
    >
      {label}
    </button>
  );
}

export function TagChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt py-1.5 pl-3 pr-2 text-sm font-medium text-secondary"
    >
      #{label}
      {onRemove && <X size={14} className="text-text-muted" />}
    </button>
  );
}

export function StatusBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('rounded-sm bg-black/70 px-1.5 py-0.5 text-xs font-medium text-text-primary', className)}>
      {children}
    </span>
  );
}