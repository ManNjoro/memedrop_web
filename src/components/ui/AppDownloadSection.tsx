import type { ReactNode } from 'react';
import { Apple, Smartphone } from 'lucide-react';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

type StoreBadgeProps = {
  href: string | null;
  icon: ReactNode;
  eyebrow: string;
  label: string;
};

function StoreBadge({ href, icon, eyebrow, label }: StoreBadgeProps) {
  const disabled = !href;
  return (
    <a
      href={href ?? undefined}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      aria-disabled={disabled}
      title={disabled ? 'Coming soon' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border-light dark:border-border bg-surface-alt-light dark:bg-surface-alt px-4 py-2.5 transition-opacity',
        disabled ? 'cursor-default opacity-50' : 'hover:opacity-80'
      )}
      onClick={(e) => disabled && e.preventDefault()}
    >
      {icon}
      <span className="text-left leading-tight">
        <span className="block text-[10px] uppercase tracking-wide text-text-muted">
          {disabled ? 'Coming soon' : eyebrow}
        </span>
        <span className="block text-sm font-bold text-text-primary-light dark:text-text-primary">{label}</span>
      </span>
    </a>
  );
}

/**
 * Custom-styled CTAs rather than Apple/Google's official badge artwork —
 * reproducing their exact logos/wordmarks means following each platform's
 * brand guidelines precisely (developer.apple.com/app-store/marketing,
 * play.google.com/intl/en_us/badges). Swap in the official SVG badges here
 * once you've pulled them from those pages; this keeps the same layout.
 */
export function AppDownloadSection() {
  return (
    <section className="rounded-lg border border-border-light dark:border-border bg-surface-light dark:bg-surface p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary-light dark:text-text-primary">
            Take MemeDrop with you
          </h2>
          <p className="mt-1 max-w-md text-sm text-text-secondary-light dark:text-text-secondary">
            Browse, drop, and share memes on the go — get the app for iOS and Android.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <StoreBadge
            href={APP_STORE_URL}
            icon={<Apple size={26} className="shrink-0 text-text-primary-light dark:text-text-primary" />}
            eyebrow="Download on the"
            label="App Store"
          />
          <StoreBadge
            href={PLAY_STORE_URL}
            icon={<Smartphone size={26} className="shrink-0 text-text-primary-light dark:text-text-primary" />}
            eyebrow="Get it on"
            label="Google Play"
          />
        </div>
      </div>
    </section>
  );
}