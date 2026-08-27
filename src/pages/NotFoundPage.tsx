import { Ghost } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Ghost}
      title="Nothing here."
      subtitle="That page doesn't exist, or hasn't been built yet."
    />
  );
}