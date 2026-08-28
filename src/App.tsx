import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { SearchPage } from '@/pages/SearchPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/search" element={<SearchPage />} />
        {/* Meme Details, Upload, Profile, Creator Profile, Settings, and
            Sign In/Sign Up land here in follow-up passes, same as the
            mobile app's screen-by-screen build order. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}