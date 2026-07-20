'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth-context';

/**
 * Hook to require authentication for a page
 * Redirects to login if not authenticated after initialization
 *
 * @param redirectTo - URL to redirect to if not authenticated (default: '/login')
 * @returns { isLoading, isAuthenticated, user }
 */
export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthContext();

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!isInitialized) return;

    // If not authenticated after initialization, redirect
    if (!isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isInitialized, isAuthenticated, router, redirectTo]);

  return {
    isLoading: isLoading || !isInitialized,
    isAuthenticated,
    user,
  };
}
