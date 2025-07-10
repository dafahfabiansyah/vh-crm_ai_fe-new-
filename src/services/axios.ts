import axios from 'axios';
import { shouldAutoLogout, debugWarn } from '@/config/debug';
import { store } from '../store';
import { logout } from '../store/authSlice';
import { AuthService } from './authService';

// Base axios instance configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 30000, // Increased timeout for WhatsApp operations,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    let token = state.auth.token;
    
    // If no token in Redux, try to get from AuthService (cookies)
    if (!token) {
      token = AuthService.getStoredToken();
    }
    
    // If still no token, try legacy localStorage
    if (!token) {
      try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
          const parsedData = JSON.parse(userData);
          token = parsedData.access_token;
        }
      } catch (error) {
        console.log('Error parsing user_data from localStorage:', error);
      }
    }
    
    // If token is an object, extract access_token
    if (token && typeof token === 'object') {
      token = (token as { access_token?: string }).access_token || null;
    }
    
    console.log('🔑 Token from Redux/Cookies/localStorage:', token ? 'Token exists' : 'No token');
    console.log('🔑 Auth state:', { 
      isAuthenticated: state.auth.isAuthenticated,
      hasToken: !!token 
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No token found');
    }
    // Hanya set Content-Type application/json jika body bukan FormData
    if (
      config.data &&
      typeof window !== 'undefined' &&
      !(config.data instanceof FormData)
    ) {
      config.headers['Content-Type'] = 'application/json';
    } else if (config.data instanceof FormData) {
      // Biarkan browser/axios yang set Content-Type
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      debugWarn('401 Unauthorized error detected:', error.response);
        // Only auto-logout if not in debug mode
      if (shouldAutoLogout()) {
        // Dispatch logout action to clear Redux state
        store.dispatch(logout());
        // Redirect to login if needed
        window.location.href = '/auth/login';
      } else {
        debugWarn('Auto-logout disabled for debugging');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
