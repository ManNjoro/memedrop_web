import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, isPassword, className, ...rest }, ref) => {
    const [hidden, setHidden] = useState(!!isPassword);

    return (
      <div className="mb-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-secondary-light dark:text-text-secondary">
          {label}
        </label>
        <div
          className={cn(
            'flex items-center rounded-lg border bg-surface-alt-light dark:bg-surface-alt px-4',
            error ? 'border-danger' : 'border-border-light dark:border-border'
          )}
        >
          <input
            ref={ref}
            type={isPassword ? (hidden ? 'password' : 'text') : rest.type}
            autoComplete={rest.autoComplete}
            className={cn(
              'w-full bg-transparent py-3.5 text-base text-text-primary-light dark:text-text-primary placeholder:text-text-muted focus:outline-none',
              className
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setHidden(!hidden)}
              aria-label={hidden ? 'Show password' : 'Hide password'}
              className="shrink-0 text-text-muted"
            >
              {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}
        </div>
        {!!error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
AuthInput.displayName = 'AuthInput';