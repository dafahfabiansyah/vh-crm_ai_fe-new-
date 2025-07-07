// Demo file untuk testing API integration
// File ini dapat dihapus setelah testing selesai

import { AuthService } from '../services/authService';

// Test functions untuk API calls
export const testRegisterAPI = async () => {
  try {
    const testUser = {
      email: "test123@gmail.com",
      password: "securepassword",
      name: "test123",
      business_name: "test123",
      phone_number: "+1234567890"
    };

    console.log("Testing register API with:", testUser);
    const result = await AuthService.register(testUser);
    console.log("Register success:", result);
    return result;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};

export const testLoginAPI = async () => {
  try {
    const testCredentials = {
      email: "Kurokawakane74@gmail.com",
      password: "123123"
    };

    console.log("Testing login API with:", testCredentials);
    const result = await AuthService.login(testCredentials);
    console.log("Login success:", result);
    return result;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Test Redux actions
export const testReduxLogin = async (dispatch: any) => {
  try {
    const { loginUser } = await import('../store/authSlice');
    
    const testCredentials = {
      email: "Kurokawakane74@gmail.com",
      password: "123123"
    };

    console.log("Testing Redux login action with:", testCredentials);
    const result = await dispatch(loginUser(testCredentials));
    console.log("Redux login result:", result);
    return result;
  } catch (error) {
    console.error("Redux login failed:", error);
    throw error;
  }
};

export const testReduxRegister = async (dispatch: any) => {
  try {
    const { registerUser } = await import('../store/authSlice');
    
    const testUser = {
      email: "test123@gmail.com",
      password: "securepassword",
      name: "test123",
      business_name: "test123",
      phone_number: "+1234567890"
    };

    console.log("Testing Redux register action with:", testUser);
    const result = await dispatch(registerUser(testUser));
    console.log("Redux register result:", result);
    return result;
  } catch (error) {
    console.error("Redux register failed:", error);
    throw error;
  }
};
