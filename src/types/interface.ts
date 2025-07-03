// API Request types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  business_name: string;
  phone_number: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// API Response types
export interface User {
  id: string;
  email: string;
  name: string;
  business_name: string;
  phone_number?: string;
  created_at?: string;
}

export interface RegisterResponse extends User {
  phone_number: string;
  created_at: string;
  token: string; // Make token required
}

export interface LoginResponse extends User {
  token: string;
}

// Backend API wrapper responses
export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth state types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Add this to track if auth state has been initialized
}

// decode JWT token response
export interface DecodeTokenResponse {
  user_id: string;
  tenant_id: string;
  email: string;
  database: string;
  is_human_agent: boolean;
  agent_id: string;
  agent_department: string;
  exp ?: number; // Optional expiration time
  iat ?: number; // Optional issued at time
}
