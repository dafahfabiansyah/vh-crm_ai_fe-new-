import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAppSelector } from '@/hooks/redux';
import Loading from '@/pages/Loading';

interface PublicRouteProps {
  redirectTo?: string;
  restrictWhenAuthenticated?: boolean;
}

/**
 * PublicRoute Component
 * 
 * Untuk routes yang bisa diakses publik (login, register).
 * Jika restrictWhenAuthenticated=true dan user sudah login, 
 * akan redirect ke dashboard.
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  redirectTo = '/dashboard',
  restrictWhenAuthenticated = true 
}) => {
  const { isAuthenticated, isLoading, isInitialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Jika belum diinisialisasi atau sedang loading, tampilkan loading
  if (!isInitialized || isLoading) {
    return <Loading />;
  }

  // Jika sudah authenticated dan route ini restricted, redirect ke dashboard
  if (isAuthenticated && restrictWhenAuthenticated) {
    // Check if there's a intended redirect from login state
    const intendedPath = (location.state as any)?.from || redirectTo;
    return <Navigate to={intendedPath} replace />;
  }

  // Render nested routes melalui Outlet
  return <Outlet />;
};

export default PublicRoute;
