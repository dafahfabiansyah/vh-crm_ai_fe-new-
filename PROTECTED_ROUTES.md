# Protected Routes Documentation

## Overview
Sistem Protected Routes telah diimplementasikan untuk mencegah akses unauthorized ke halaman dashboard dan fitur-fitur lainnya. User harus login atau register terlebih dahulu sebelum bisa mengakses area protected.

## Components

### 1. ProtectedRoute (`src/components/route/ProtectedRoute.tsx`)
**Fungsi**: Melindungi routes yang memerlukan autentikasi
- Jika user belum login → redirect ke `/auth/login`
- Jika sedang loading → tampilkan Loading component
- Jika sudah login → render children component
- Menyimpan intended path untuk redirect setelah login

**Usage**:
```tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 2. PublicRoute (`src/components/route/PublicRoute.tsx`)
**Fungsi**: Untuk routes publik dengan optional restriction
- Jika `restrictWhenAuthenticated=true` dan user sudah login → redirect ke dashboard
- Berguna untuk halaman login/register agar tidak bisa diakses saat sudah login
- Support intended path redirect setelah login

**Usage**:
```tsx
<Route 
  path="/auth/login" 
  element={
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  } 
/>
```

### 3. AuthInitializer (`src/components/route/AuthInitializer.tsx`)
**Fungsi**: Restore authentication state saat aplikasi dimuat
- Cek localStorage untuk token dan user data
- Restore Redux auth state jika data valid
- Dijalankan saat aplikasi pertama kali dimuat

## Protected Routes List

Berikut adalah routes yang dilindungi (memerlukan autentikasi):
- `/dashboard` - Main dashboard
- `/ai-agents` - AI Agents management
- `/human-agents` - Human Agents management  
- `/connected-platforms` - Platform connections
- `/contacts` - Contact management
- `/billing` - Billing & subscription
- `/pipeline/create` - Pipeline creation
- `/settings` - Application settings

## Public Routes List

Routes yang bisa diakses tanpa autentikasi:
- `/auth/login` - Login page (redirect to dashboard if authenticated)
- `/auth/register` - Register page (redirect to dashboard if authenticated)
- `/` - Root (redirect to `/auth/login`)
- `*` - 404 page

## Flow Diagram

```
User tries to access protected route
                ↓
        Is user authenticated?
               ↙        ↘
            NO           YES
             ↓            ↓
    Redirect to login   Render component
    with intended path
             ↓
    User logs in successfully
             ↓
    Redirect to intended path
    (or dashboard if no intended path)
```

## Features

### ✅ **Route Protection**
- Semua dashboard routes dilindungi
- Auto redirect ke login jika belum autentikasi
- Prevent akses manual via URL browser

### ✅ **Smart Redirects**
- Remember intended path saat redirect ke login
- Redirect ke intended path setelah login berhasil
- Redirect ke dashboard jika sudah login dan akses login/register

### ✅ **State Persistence**
- Auth state dipersist di localStorage
- Auto restore saat aplikasi reload
- Seamless user experience

### ✅ **Loading States**
- Loading component saat cek authentication
- Prevent flash of unauthorized content
- Smooth user experience

### ✅ **Logout Functionality**
- Logout button di topbar
- Clear Redux state dan localStorage
- Auto redirect ke login page

## Security Features

1. **Client-side Protection**: Prevent unauthorized access via browser URL
2. **Token Validation**: Check stored token validity
3. **Auto Logout**: Clear session on 401 responses
4. **State Sync**: Sync auth state across components

## Usage Examples

### Protecting a New Route
```tsx
// In App.tsx
<Route 
  path="/new-feature" 
  element={
    <ProtectedRoute>
      <NewFeaturePage />
    </ProtectedRoute>
  } 
/>
```

### Adding Public Route with Restriction
```tsx
// In App.tsx  
<Route 
  path="/forgot-password" 
  element={
    <PublicRoute restrictWhenAuthenticated={false}>
      <ForgotPasswordPage />
    </PublicRoute>
  } 
/>
```

### Checking Authentication in Component
```tsx
import { useAppSelector } from '@/hooks/redux';

function MyComponent() {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user?.name}</div>;
}
```

## Testing

Test scenarios untuk memverifikasi protected routes:
1. **Akses dashboard tanpa login** → should redirect to login
2. **Login kemudian akses dashboard** → should work  
3. **Akses login saat sudah login** → should redirect to dashboard
4. **Direct URL access** → should be handled properly
5. **Refresh page saat login** → should maintain auth state
6. **Logout** → should clear state and redirect to login

## Next Steps

1. **Role-based Permissions**: Extend untuk different user roles
2. **Route-level Permissions**: Granular permissions per route
3. **Session Timeout**: Auto logout setelah idle
4. **Remember Me**: Extended session duration
5. **Multi-factor Authentication**: Additional security layer
