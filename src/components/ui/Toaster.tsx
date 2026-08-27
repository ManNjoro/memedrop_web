import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/utils';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = { success: 'text-secondary', error: 'text-danger', info: 'text-primary' };

export function Toaster() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-100 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface px-4 py-3 shadow-lg"
          >
            <Icon size={18} className={cn('shrink-0', COLORS[toast.variant])} />
            <p className="flex-1 text-sm text-text-primary-light dark:text-text-primary">{toast.message}</p>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
              <X size={16} className="text-text-muted" />
            </button>
          </div>
        );
      })}
    </div>
  );
}