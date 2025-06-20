import axiosInstance from "./axios";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
  ApiSuccessResponse,
} from "../types/api";

export class AuthService {
  /**
   * Register a new user
   */ static async register(
    userData: RegisterRequest
  ): Promise<RegisterResponse> {
    try {
      const response = await axiosInstance.post<
        ApiSuccessResponse<RegisterResponse>
      >("/auth/register", userData);

      // Extract actual data from wrapper
      const actualData = response.data.data;      // Store token and user data if provided
      if (actualData.token) {
        localStorage.setItem("user_data", JSON.stringify(actualData));
      } else {
        // Some backends might not return token on register, just store user data
        localStorage.setItem("user_data", JSON.stringify(actualData));
      }

      return actualData;
    } catch (error: any) {
      // Handle and format error response
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Registration failed",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }

  /**
   * Login user
   */ static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<
        ApiSuccessResponse<LoginResponse>
      >("/auth/login", credentials);

      // Extract actual data from wrapper
      const actualData = response.data.data;      // Store token and user data
      if (actualData.token) {
        localStorage.setItem("user_data", JSON.stringify(actualData));
      }

      return actualData;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Login failed",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }
  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem("user_data");
  }
  /**
   * Get stored user data
   */
  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  /**
   * Get stored token
   */
  static getStoredToken(): string | null {
    return localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data") || "{}").token || null : null;
  }
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }
}
