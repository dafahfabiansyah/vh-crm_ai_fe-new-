import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
} from "../types/interface";
import Cookies from 'js-cookie';
import * as CryptoJS from 'crypto-js';

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:', // Check if HTTPS
  sameSite: 'strict' as const,
  path: '/'
};

const USER_DATA_COOKIE = 'client_ctx';
const AUTH_TOKEN_COOKIE = 'auth_bearer';

// Encryption key - In production, this should be from environment variables
const ENCRYPTION_KEY = import.meta.env.VITE_PUBLIC_ENCRYPTION_KEY || 'vh-crm-secret-key';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL || 'http://localhost:8080/v1';

export class AuthService {
  /**
   * Encrypt data before storing
   */
  private static encryptData(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      return data; // Fallback to unencrypted if encryption fails
    }
  }

  /**
   * Decrypt data after retrieving
   */
  private static decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedData; // Fallback to original data if decryption fails
    }
  }

  /**
   * Register a new user (Real API implementation)
   */
  static async register(
    userData: RegisterRequest
  ): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          business_name: userData.business_name || "",
          phone_number: userData.phone_number || "",
          type: "Owner" // Default type as required
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw {
          message: errorData?.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      const apiResponse = await response.json();
      
      // Transform API response to match our RegisterResponse interface
      const transformedResponse: RegisterResponse = {
        id: apiResponse.id,
        email: apiResponse.email,
        name: apiResponse.name,
        business_name: apiResponse.business_name,
        phone_number: apiResponse.phone_number,
        created_at: apiResponse.created_at,
        token: `bearer_${apiResponse.id}`, // Generate token since API doesn't return one
      };

      // Store in cookies (encrypted)
      this.setUserData(apiResponse);
      this.setAuthToken(transformedResponse.token);

      return transformedResponse;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw {
        message: error.message || "Registration failed",
        status: error.status || 500,
      };
    }
  }

  /**
   * Login user (Real API implementation)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw {
          message: errorData?.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
      }

      const apiResponse = await response.json();
      
      // Transform API response to match our LoginResponse interface
      const transformedResponse: LoginResponse = {
        id: apiResponse.user.id,
        email: apiResponse.user.email,
        name: apiResponse.user.name,
        business_name: apiResponse.user.business_name,
        phone_number: apiResponse.user.phone_number,
        token: apiResponse.token,
      };

      // Store in cookies (encrypted)
      this.setUserData(apiResponse.user);
      this.setAuthToken(apiResponse.token);
      
      // Decode JWT and log role
      this.getRoleFromToken(apiResponse.token);

      return transformedResponse;
    } catch (error: any) {
      console.error('Login error:', error);
      throw {
        message: error.message || "Login failed",
        status: error.status || 500,
      };
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    Cookies.remove(USER_DATA_COOKIE, { path: '/' });
    Cookies.remove(AUTH_TOKEN_COOKIE, { path: '/' });
  }

  /**
   * Get stored user data from cookies (decrypted)
   */
  static getStoredUser(): User | null {
    try {
      const encryptedUserData = Cookies.get(USER_DATA_COOKIE);
      if (!encryptedUserData) return null;

      const decryptedData = this.decryptData(encryptedUserData);
      return decryptedData ? JSON.parse(decryptedData) : null;
    } catch (error) {
      console.error("Error parsing user data from cookies:", error);
      return null;
    }
  }

  /**
   * Get stored token from cookies (decrypted)
   */
  static getStoredToken(): string | null {
    try {
      const encryptedToken = Cookies.get(AUTH_TOKEN_COOKIE);
      if (!encryptedToken) return null;

      return this.decryptData(encryptedToken);
    } catch (error) {
      console.error("Error decrypting token:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    // console.log('🔍 AuthService.isAuthenticated() check:', {
    //   hasToken: !!token,
    //   hasUser: !!user,
    //   tokenLength: token?.length || 0,
    //   userValid: user ? !!(user.id && user.email) : false
    // });
    
    // Both token and user must exist
    if (!token || !user) {
      console.warn('⚠️ AuthService: Missing token or user data');
      return false;
    }
    
    // Basic validation: check if token is properly formatted
    if (token.length < 10) {
      console.warn('⚠️ Invalid token format detected');
      return false;
    }
    
    // Basic validation: check if user has required fields
    if (!user.id || !user.email) {
      console.warn('⚠️ Invalid user data detected');
      return false;
    }
    
    // console.log('✅ AuthService: Authentication valid');
    return true;
  }

  /**
   * Decode JWT token and get role
   */
  static getRoleFromToken(token?: string): string | null {
    try {
      const jwt = token || this.getStoredToken();
      if (!jwt) return null;
      // JWT format: header.payload.signature
      const payload = jwt.split('.')[1];
      if (!payload) return null;
      // Base64url decode
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const data = JSON.parse(jsonPayload);
      const role = data.role || null;
      // console.log('🔑 Decoded JWT role:', role, data);
      return role;
    } catch (e) {
      console.error('Failed to decode JWT:', e);
      return null;
    }
  }

  /**
   * Set user data in cookies (encrypted)
   */
  private static setUserData(userData: User): void {
    const encryptedData = this.encryptData(JSON.stringify(userData));
    Cookies.set(USER_DATA_COOKIE, encryptedData, COOKIE_OPTIONS);
  }

  /**
   * Set auth token in cookies (encrypted)
   */
  private static setAuthToken(token: string): void {
    const encryptedToken = this.encryptData(token);
    Cookies.set(AUTH_TOKEN_COOKIE, encryptedToken, COOKIE_OPTIONS);
  }

  /**
   * Update user data in cookies (encrypted)
   */
  static updateUserData(userData: Partial<User>): void {
    const currentUser = this.getStoredUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.setUserData(updatedUser);
    }
  }

  /**
   * Clear all authentication data (for debugging)
   */
  static clearAuthData(): void {
    this.logout();
    console.log('Authentication data cleared');
  }

  /**
   * Get session info (for debugging - without sensitive data)
   */
  static getSessionInfo(): { hasUser: boolean; hasToken: boolean; userName?: string } {
    const user = this.getStoredUser();
    const token = this.getStoredToken();
    
    return {
      hasUser: !!user,
      hasToken: !!token,
      userName: user?.name
    };
  }

  /**
   * Force logout and redirect to login
   */
  static forceLogout(reason?: string): void {
    console.warn(`🚨 Force logout: ${reason || 'Security check'}`);
    this.logout();
    window.location.href = '/auth/login';
  }

  /**
   * Check if current session is valid
   */
  static validateSession(): boolean {
    const isValid = this.isAuthenticated();
    if (!isValid) {
      this.forceLogout('Invalid session');
    }
    return isValid;
  }
}