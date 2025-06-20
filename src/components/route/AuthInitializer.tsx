import React, { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { initializeAuth } from '@/store/authSlice';
import { AuthService } from '@/services/authService';

interface AuthInitializerProps {
  children: React.ReactNode;
}

/**
 * AuthInitializer Component
 * 
 * Komponen ini akan mengecek localStorage saat aplikasi dimuat
 * untuk restore authentication state jika user sebelumnya sudah login.
 */
export const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();  useEffect(() => {
    // Check for stored auth data pada app initialization
    const storedToken = AuthService.getStoredToken();
    const storedUser = AuthService.getStoredUser();

    if (storedToken && storedUser) {
      // Restore auth state
      dispatch(initializeAuth({
        user: storedUser,
        token: storedToken
      }));
    } else {
      // No stored auth data, set as initialized but not authenticated
      dispatch(initializeAuth(null));
    }
  }, [dispatch]);
  return <>{children}</>;
};

export default AuthInitializer;
