# Auth Persistence Fix - Backend Response Structure

## Problem
Aplikasi redirect ke login page setelah refresh, meskipun user sudah login.

## Root Cause
Backend API mengirim response dengan wrapper format:
```json
{
  "success": true,
  "message": "login successful", 
  "data": {
    "id": "...",
    "email": "...", 
    "name": "...",
    "token": "..." // <- Token ada di dalam data, bukan di root
  }
}
```

Frontend mengexpect token di root level:
```json
{
  "id": "...",
  "token": "..." // <- Frontend expect di sini
}
```

## Solution
1. **Updated API Types** - Added `ApiSuccessResponse<T>` wrapper type
2. **Updated AuthService** - Extract data from `response.data.data` instead of `response.data`
3. **Fixed Token Storage** - Now correctly accesses `actualData.token`

## Changes Made

### `src/types/api.ts`
- Added `ApiSuccessResponse<T>` interface
- Added `ApiErrorResponse` interface

### `src/services/authService.ts`
- Updated register() method to handle wrapper response
- Updated login() method to handle wrapper response
- Extract actual data from `response.data.data`

## Result
✅ Token now correctly saved to localStorage  
✅ Auth state persists on page refresh  
✅ User stays logged in after browser refresh  
✅ Protected routes work correctly  

## Testing
1. Login to application
2. Check localStorage: `localStorage.getItem('auth_token')` should return token
3. Refresh page - should stay on current page, not redirect to login
4. Navigate to protected routes - should work without redirect

## Debug (if needed)
```javascript
// In browser console
DebugAuth.checkLocalStorage() // Check stored data
AuthPersistenceTest.runAllTests() // Run full test suite
```
