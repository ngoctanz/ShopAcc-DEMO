'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuthContext } from '@/contexts/auth-context';

/**
 * Hook to redirect away from auth pages (login/register) if already authenticated
 * Admin users are redirected to dashboard, regular users to home
 *
 * @param redirectTo - URL to redirect to if authenticated (default: '/' for users, '/dashboard' for admin)
 * @returns { isLoading }
 */
export function useRedirectIfAuthenticated(redirectTo?: string) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthContext();

  useEffect(() => {
    // Wait for auth to initialize before checking
    if (!isInitialized) return;

    // If authenticated, redirect away from auth pages
    if (isAuthenticated && user) {
      // Determine redirect URL based on role
      const targetUrl = redirectTo ?? (user.role === 'admin' ? ROUTES.DASHBOARD.HOME : ROUTES.HOME);
      router.replace(targetUrl);
    }
  }, [isInitialized, isAuthenticated, user, router, redirectTo]);

  return {
    isLoading: isLoading || !isInitialized,
  };
}
