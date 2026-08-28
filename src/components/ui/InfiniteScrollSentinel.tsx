import { useEffect, useRef } from 'react';

type InfiniteScrollSentinelProps = {
  onIntersect: () => void;
  enabled: boolean;
};

/** Invisible element that triggers `onIntersect` (typically fetchNextPage) once it scrolls into view. */
export function InfiniteScrollSentinel({ onIntersect, enabled }: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin: '400px' } // fire a bit before it's actually visible, so the next page is ready by the time the person scrolls there
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return <div ref={ref} className="h-1" />;
}