import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  icon?: ReactNode;
};

export function PrimaryButton({ children, loading, disabled, icon, className, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-bold text-text-primary',
        'bg-linear-to-br from-primary to-primary-pressed transition-opacity',
        'hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, loading, disabled, icon, className, ...rest }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 font-semibold',
        'bg-surface-alt-light dark:bg-surface-alt border border-border-light dark:border-border',
        'text-text-primary-light dark:text-text-primary transition-colors',
        'hover:bg-border-light dark:hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}