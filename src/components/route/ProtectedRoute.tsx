import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAppSelector } from '@/hooks/redux';
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
    return <Loading />;
  }

  // Jika tidak authenticated, redirect ke login dengan state untuk remember intended path
  if (!isAuthenticated) {
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
