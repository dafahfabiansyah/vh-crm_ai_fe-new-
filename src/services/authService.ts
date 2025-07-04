import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  User,
} from "../types/interface";

// Mock data untuk simulasi
const mockUsers = [
  {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    business_name: "Test Business",
    phone_number: "+1234567890",
    password: "password123" // In real app, this would be hashed
  }
];

export class AuthService {
  /**
   * Register a new user (Mock implementation)
   */
  static async register(
    userData: RegisterRequest
  ): Promise<RegisterResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw {
          message: "User already exists with this email",
          status: 409,
        };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        business_name: userData.business_name || "",
        phone_number: userData.phone_number || "",
        password: userData.password
      };

      mockUsers.push(newUser);

      // Generate mock token
      const token = `mock_token_${Date.now()}`;
      
      const response: RegisterResponse = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        business_name: newUser.business_name,
        phone_number: newUser.phone_number,
        created_at: new Date().toISOString(),
        token,
      };

      // Store in localStorage
      localStorage.setItem("user_data", JSON.stringify(response));

      return response;
    } catch (error: any) {
      throw {
        message: error.message || "Registration failed",
        status: error.status || 500,
      };
    }
  }

  /**
   * Login user (Mock implementation)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists
      const user = mockUsers.find(u => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (!user) {
        throw {
          message: "Invalid email or password",
          status: 401,
        };
      }

      // Generate mock token
      const token = `mock_token_${Date.now()}`;
      
      const response: LoginResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        business_name: user.business_name,
        phone_number: user.phone_number,
        token,
      };

      // Store in localStorage
      localStorage.setItem("user_data", JSON.stringify(response));

      return response;
    } catch (error: any) {
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
