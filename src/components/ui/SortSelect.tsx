import { ChevronDown } from 'lucide-react';

type SortSelectProps<T extends string> = {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label?: string;
};

export function SortSelect<T extends string>({ value, options, onChange, label = 'Sort' }: SortSelectProps<T>) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="appearance-none rounded-lg bg-surface-alt-light dark:bg-surface-alt py-1.5 pl-3 pr-8 text-xs font-semibold text-text-primary-light dark:text-text-primary focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {label}: {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 text-text-primary-light dark:text-text-primary" />
    </div>
  );
}