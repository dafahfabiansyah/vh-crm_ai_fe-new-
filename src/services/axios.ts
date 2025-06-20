import axios from 'axios';
import { shouldAutoLogout, debugWarn } from '@/config/debug';

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
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        // Clear auth data on unauthorized response
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
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
