import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAppSelector } from '@/hooks/redux';
import { AuthService } from '@/services/authService';
import Loading from '@/pages/Loading';
import { isDebugMode, debugLog } from '@/config/debug';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Melindungi routes yang memerlukan autentikasi.
 * Jika user belum login, akan redirect ke halaman login.
 * Jika sedang loading (cek auth), tampilkan loading screen.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/auth/login'
}) => {
  const { isAuthenticated, isLoading, isInitialized } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const debugMode = isDebugMode();

  // DEBUG MODE: Allow access without authentication for testing
  if (debugMode) {
    debugLog('ProtectedRoute Debug Mode - Auth Status:', {
      isAuthenticated,
      isLoading,
      isInitialized,
      currentPath: location.pathname
    });
    
    // Still show loading if not initialized
    if (!isInitialized && isLoading) {
      return <Loading />;
    }
    
    // In debug mode, allow access even if not authenticated
    return <>{children}</>;
  }

  // PRODUCTION MODE: Normal protection logic
  // Jika belum diinisialisasi atau sedang loading, tampilkan loading
  if (!isInitialized || isLoading) {
    console.log('🔄 ProtectedRoute: Loading or not initialized');
    return <Loading />;
  }

  // Double check dengan AuthService - jika cookie tidak ada, paksa logout
  const hasValidAuth = AuthService.isAuthenticated();
  
  console.log('🔐 ProtectedRoute Auth Check:', {
    reduxAuthenticated: isAuthenticated,
    cookieAuthenticated: hasValidAuth,
    currentPath: location.pathname
  });
  
  // Jika tidak authenticated di Redux ATAU cookie hilang, redirect ke login
  if (!isAuthenticated || !hasValidAuth) {
    console.warn('⚠️ ProtectedRoute: Redirecting to login', {
      reduxAuth: isAuthenticated,
      cookieAuth: hasValidAuth
    });
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Jika authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;
