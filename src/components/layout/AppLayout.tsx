// src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from '../ui/Toaster';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-light dark:bg-bg">
      <Header />
      <main className="mx-auto w-full max-w-350 flex-1 px-6 py-6">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}