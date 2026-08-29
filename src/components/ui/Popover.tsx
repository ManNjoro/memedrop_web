import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PopoverProps = {
  trigger: (props: { onClick: () => void; open: boolean }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
};

export function Popover({ trigger, children, align = 'right' }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {trigger({ onClick: () => setOpen((o) => !o), open })}
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-30 mt-2 min-w-45 rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface p-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

type PopoverItemProps = {
  children: ReactNode;
  onClick: () => void;
  destructive?: boolean;
  icon?: ReactNode;
};

export function PopoverItem({ children, onClick, destructive, icon }: PopoverItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-surface-alt-light dark:hover:bg-surface-alt',
        destructive ? 'text-danger' : 'text-text-primary-light dark:text-text-primary'
      )}
    >
      {icon}
      {children}
    </button>
  );
}