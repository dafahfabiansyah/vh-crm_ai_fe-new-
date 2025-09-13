import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../services/authService';
import { getCurrentSubscription } from '../services/transactionService';
import type { AuthState, RegisterRequest, LoginRequest, ApiError } from '../types/interface';

// Initial state - Initialize from cookies
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false, // Will be set to true after syncWithCookies
  subscription: null, // Package name from subscription
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error as ApiError);
    }
  }
);

export const fetchSubscription = createAsyncThunk(
  'auth/fetchSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentSubscription();
      return response.package_name;
    } catch (error: any) {
      return rejectWithValue(error as ApiError);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      AuthService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isInitialized = true;
      state.subscription = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isInitialized = true;
    },
    initializeAuth: (state, action: PayloadAction<{ user: any; token: string } | null>) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
      state.isInitialized = true;
    },
    setSubscription: (state, action: PayloadAction<string | null>) => {
      state.subscription = action.payload;
      // Save subscription to localStorage
      if (action.payload) {
        AuthService.setSubscription(action.payload);
      }
    },
    // Sync state with cookies
    syncWithCookies: (state) => {
      const user = AuthService.getStoredUser();
      const token = AuthService.getStoredToken();
      const subscription = AuthService.getStoredSubscription();
      const isAuthenticated = AuthService.isAuthenticated();
      
      // console.log('🔄 Syncing with cookies:', { user: !!user, token: !!token, subscription: !!subscription, isAuthenticated });
      
      state.user = user;
      state.token = token;
      state.subscription = subscription;
      state.isAuthenticated = isAuthenticated;
      state.isInitialized = true;
      
      // If cookies are missing but Redux thinks user is authenticated, force logout
      if (!isAuthenticated && (state.user || state.token)) {
        console.warn('⚠️ Cookie data missing, forcing logout');
        AuthService.logout();
        state.user = null;
        state.token = null;
        state.subscription = null;
        state.isAuthenticated = false;
        // state.error = 'Session expired';
      }
    },
  },
  extraReducers: (builder) => {
    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;        state.user = action.payload;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as ApiError)?.message || 'Registration failed';
        state.isAuthenticated = false;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as ApiError)?.message || 'Login failed';
        state.isAuthenticated = false;
      })
      // Fetch subscription cases
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        console.log('🔄 fetchSubscription.fulfilled - payload:', action.payload);
        state.subscription = action.payload;
        // Save subscription to localStorage
        if (action.payload) {
          AuthService.setSubscription(action.payload);
          console.log('✅ Subscription saved to localStorage:', action.payload);
        }
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        console.warn('Failed to fetch subscription:', action.payload);
        // Don't set error for subscription fetch failure
      });
  },
});

export const { clearError, logout, setCredentials, initializeAuth, syncWithCookies, setSubscription } = authSlice.actions;
export default authSlice.reducer;
// fetchSubscription is already exported as async thunk above
