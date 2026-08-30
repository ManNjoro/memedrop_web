import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { SearchPage } from '@/pages/SearchPage';
import { MemeDetailsPage } from '@/pages/MemeDetailsPage';
import { UploadPage } from '@/pages/UploadPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/meme/:id" element={<MemeDetailsPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/upload" element={<UploadPage />} />
          {/* Profile and Settings join this protected group next. */}
        </Route>

        {/* Creator Profile lands here in a follow-up pass. */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}