import { AppDownloadSection } from '@/components/ui/AppDownloadSection';

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 py-10">
      <AppDownloadSection />
      <p className="mt-8 text-center text-xs text-text-muted">
        MemeDrop — Drop it. Find it. Share it. © {new Date().getFullYear()}
      </p>
    </footer>
  );
}