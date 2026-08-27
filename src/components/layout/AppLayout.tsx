import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from '../ui/Toaster';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}