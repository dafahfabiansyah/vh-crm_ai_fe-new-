import axios from 'axios';
import { shouldAutoLogout, debugWarn } from '@/config/debug';
import { store } from '../store';
import { logout } from '../store/authSlice';

// Base axios instance configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    let token = state.auth.token;
    
    // If no token in Redux, try to get from localStorage user_data
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
    }    // If token is an object, extract access_token
    if (token && typeof token === 'object') {
      token = (token as { access_token?: string }).access_token || null;
    }
    
    console.log('🔑 Token from Redux/localStorage:', token ? 'Token exists' : 'No token');
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
