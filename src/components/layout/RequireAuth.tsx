import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { Spinner } from '@/components/ui/Spinner';

/** 
 * Wrap any route element in this that should require sign-in, e.g.:
 *   <Route element={<RequireAuth />}>
 *     <Route path="/upload" element={<UploadPage />} />
 *   </Route>
 */
export function RequireAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
}