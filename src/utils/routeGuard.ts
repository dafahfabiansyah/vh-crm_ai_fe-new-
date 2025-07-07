import { AuthService } from '@/services/authService';

/**
 * Route Guard Utilities
 * 
 * Provides utility functions for checking route permissions
 */

export const RouteGuard = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return AuthService.isAuthenticated();
  },

  /**
   * Check if current route requires authentication
   */
  isProtectedRoute(pathname: string): boolean {
    const protectedRoutes = [
      '/dashboard',
      '/ai-agents',
      '/human-agents',
      '/connected-platforms',
      '/contacts',
      '/billing',
      '/pipeline/*',
      '/settings'
    ];

    return protectedRoutes.some(route => pathname.startsWith(route));
  },

  /**
   * Check if current route is auth-only (redirect if authenticated)
   */
  isAuthOnlyRoute(pathname: string): boolean {
    const authOnlyRoutes = [
      '/auth/login',
      '/auth/register'
    ];

    return authOnlyRoutes.includes(pathname);
  },

  /**
   * Get redirect URL based on authentication status and current route
   */
  getRedirectUrl(pathname: string, isAuthenticated: boolean): string | null {
    // If user is authenticated and on auth-only route, redirect to dashboard
    if (isAuthenticated && this.isAuthOnlyRoute(pathname)) {
      return '/dashboard';
    }

    // If user is not authenticated and on protected route, redirect to login
    if (!isAuthenticated && this.isProtectedRoute(pathname)) {
      return '/auth/login';
    }

    return null;
  },
  /**
   * Check if user has permission for specific feature (extensible for future roles)
   */
  hasPermission(_feature: string): boolean {
    // For now, all authenticated users have all permissions
    // This can be extended later with role-based permissions
    return this.isAuthenticated();
  }
};

export default RouteGuard;
