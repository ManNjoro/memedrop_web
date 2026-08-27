import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { registerAuthTokenGetter } from '@/lib/api/client';

export function ClerkAuthSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    registerAuthTokenGetter(getToken);
    return () => registerAuthTokenGetter(null);
  }, [getToken]);

  return null;
}