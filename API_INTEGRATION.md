# API Integration Documentation

## Overview
Integrasi backend telah diimplementasikan untuk fitur authentication (register dan login) dengan struktur yang terorganisir dan pemisahan concern yang jelas.

## Structure

### 1. API Types (`src/types/api.ts`)
- `RegisterRequest`: Interface untuk request body register
- `LoginRequest`: Interface untuk request body login
- `User`, `RegisterResponse`, `LoginResponse`: Interface untuk response data
- `ApiError`: Interface untuk error handling
- `AuthState`: Interface untuk Redux state management

### 2. Axios Configuration (`src/services/axios.ts`)
- Base configuration untuk HTTP client
- Request interceptor untuk menambahkan auth token
- Response interceptor untuk handle common errors (401, dll)
- Auto redirect ke login page jika unauthorized

### 3. Auth Service (`src/services/authService.ts`)
- `AuthService.register()`: Register user baru
- `AuthService.login()`: Login user
- `AuthService.logout()`: Logout dan clear data
- `AuthService.getStoredUser()`: Get user data dari localStorage
- `AuthService.getStoredToken()`: Get token dari localStorage
- `AuthService.isAuthenticated()`: Check authentication status

### 4. Redux Store (`src/store/`)
- `authSlice.ts`: Redux slice untuk auth state management
- `index.ts`: Store configuration dengan Redux Toolkit

### 5. Custom Hooks (`src/hooks/redux.ts`)
- `useAppDispatch`: Typed dispatch hook
- `useAppSelector`: Typed selector hook

## API Endpoints

### Register
- **URL**: `http://localhost:8080/api/v1/auth/register`
- **Method**: POST
- **Request Body**:
```json
{
  "email": "test123@gmail.com",
  "password": "securepassword",
  "name": "test123",
  "business_name": "test123",
  "phone_number": "+1234567890"
}
```

### Login
- **URL**: `http://localhost:8080/api/v1/auth/login`
- **Method**: POST
- **Request Body**:
```json
{
  "email": "Kurokawakane74@gmail.com",
  "password": "123123"
}
```

## Usage in Components

### Register Form
```tsx
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { registerUser, clearError } from "@/store/authSlice";

// In component
const dispatch = useAppDispatch();
const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

// Handle submit
const handleSubmit = async (e: React.FormEvent) => {
  const registerData = {
    email: formData.email,
    password: formData.password,
    name: formData.username,
    business_name: formData.businessName || "",
    phone_number: formData.phoneNumber || "",
  };

  const result = await dispatch(registerUser(registerData));
  // Handle result...
};
```

### Login Form
```tsx
import { loginUser } from "@/store/authSlice";

// Handle submit
const handleSubmit = async (e: React.FormEvent) => {
  const loginData = {
    email: formData.email,
    password: formData.password,
  };

  const result = await dispatch(loginUser(loginData));
  // Handle result...
};
```

## Error Handling
- Network errors ditangani di axios interceptor
- API errors ditangani di service layer
- Component errors ditampilkan melalui Redux state
- Auto logout untuk 401 responses

## Data Persistence
- Token disimpan di localStorage
- User data disimpan di localStorage
- Auto-restore state saat aplikasi di-reload

## Features
- ✅ Type-safe API calls dengan TypeScript
- ✅ Centralized error handling
- ✅ Auto token management
- ✅ Redux state management
- ✅ Persistent authentication
- ✅ Auto redirect after login/register
- ✅ Loading states untuk UI
- ✅ Separation of concerns (UI vs business logic)

## Testing
Test functions tersedia di `src/utils/testAPI.ts` untuk testing manual:
- `testRegisterAPI()`: Test direct API call
- `testLoginAPI()`: Test direct API call  
- `testReduxLogin()`: Test Redux action
- `testReduxRegister()`: Test Redux action

## Next Steps
1. Implement forgot password API endpoint
2. Add refresh token mechanism
3. Add API error logging
4. Add loading indicators yang lebih sophisticated
5. Add unit tests
