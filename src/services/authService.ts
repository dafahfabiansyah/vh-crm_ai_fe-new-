import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
} from "../types/interface";
import Cookies from 'js-cookie';

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // Only secure in production
  sameSite: 'strict' as const,
  path: '/'
};

const USER_DATA_COOKIE = 'user_data';
const AUTH_TOKEN_COOKIE = 'auth_token';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/v1';

export class AuthService {
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

      // Store in cookies
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

      // Store in cookies
      this.setUserData(apiResponse.user);
      this.setAuthToken(apiResponse.token);

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
   * Get stored user data from cookies
   */
  static getStoredUser(): User | null {
    try {
      const userData = Cookies.get(USER_DATA_COOKIE);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data from cookies:", error);
      return null;
    }
  }

  /**
   * Get stored token from cookies
   */
  static getStoredToken(): string | null {
    return Cookies.get(AUTH_TOKEN_COOKIE) || null;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Set user data in cookies
   */
  private static setUserData(userData: User): void {
    Cookies.set(USER_DATA_COOKIE, JSON.stringify(userData), COOKIE_OPTIONS);
  }

  /**
   * Set auth token in cookies
   */
  private static setAuthToken(token: string): void {
    Cookies.set(AUTH_TOKEN_COOKIE, token, COOKIE_OPTIONS);
  }

  /**
   * Update user data in cookies
   */
  static updateUserData(userData: Partial<User>): void {
    const currentUser = this.getStoredUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      this.setUserData(updatedUser);
    }
  }
}
