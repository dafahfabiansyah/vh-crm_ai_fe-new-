import { useEffect } from 'react';
import { useAppSelector } from './redux';
import { AuthService } from '@/services/authService';

/**
 * Hook sederhana untuk validate auth state
 * Akan redirect ke login jika token hilang dari cookies
 */
export const useAuthCheck = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Cek apakah user authenticated di Redux tapi cookie hilang
    if (isAuthenticated && !AuthService.isAuthenticated()) {
      console.warn('⚠️ Auth mismatch detected - redirecting to login');
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated]);

  return AuthService.isAuthenticated();
};
