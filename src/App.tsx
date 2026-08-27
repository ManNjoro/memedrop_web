import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        {/* Explore, Search, Meme Details, Upload, Profile, Creator Profile,
            Settings, and Sign In/Sign Up land here in follow-up passes,
            same as the mobile app's screen-by-screen build order. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}