import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  className?: string;
};

export function SearchBar({ value, onChange, placeholder = 'Search memes…', onSubmit, autoFocus, className }: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex h-14 items-center rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt px-4',
        className
      )}
    >
      <Search size={20} className="shrink-0 text-text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        className="ml-3 w-full bg-transparent text-base text-text-primary-light dark:text-text-primary placeholder:text-text-muted focus:outline-none"
      />
      {value.length > 0 && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="shrink-0">
          <X size={18} className="text-text-muted" />
        </button>
      )}
    </div>
  );
}