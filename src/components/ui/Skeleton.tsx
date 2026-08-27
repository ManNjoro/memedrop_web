import { cn } from '@/lib/utils';

function Pulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div style={style} className={cn('animate-pulse rounded-md bg-surface-alt-light dark:bg-surface-alt', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="mb-4">
      <Pulse className="w-full" style={{ aspectRatio: 0.85 }} />
      <Pulse className="mt-2 h-3.5 w-2/3" />
      <Pulse className="mt-1.5 h-3 w-1/3" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonFeedCard() {
  return (
    <div className="mb-4">
      <Pulse className="w-full" style={{ aspectRatio: 1.1 }} />
      <Pulse className="mt-2 h-3.5 w-1/2" />
      <Pulse className="mt-1.5 h-3 w-1/4" />
    </div>
  );
}

export function SkeletonFeedList({ count = 3 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-xl">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonFeedCard key={i} />
      ))}
    </div>
  );
}