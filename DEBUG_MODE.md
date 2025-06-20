# Debug Mode Documentation

## Overview

Aplikasi ini dilengkapi dengan sistem debug mode untuk memudahkan development dan troubleshooting. Debug mode memungkinkan developer untuk:

1. Menonaktifkan automatic logout saat error 401
2. Menonaktifkan route protection untuk testing
3. Menampilkan informasi error yang lebih detail
4. Logging yang lebih verbose

## Konfigurasi Debug Mode

File konfigurasi: `src/config/debug.ts`

```typescript
export const DEBUG_CONFIG = {
  // Mode debugging untuk route protection
  DISABLE_AUTH_PROTECTION: true,
  
  // Mode debugging untuk axios interceptor
  DISABLE_AUTO_LOGOUT: true,
  
  // Log level debugging
  VERBOSE_LOGGING: true,
  
  // Mock API responses
  USE_MOCK_API: false,
} as const;
```

## Cara Menggunakan

### 1. Enable/Disable Debug Mode

Edit file `src/config/debug.ts`:

**Untuk Development/Debugging:**
```typescript
DISABLE_AUTH_PROTECTION: true,  // Akses tanpa login
DISABLE_AUTO_LOGOUT: true,      // Tidak auto logout saat 401
VERBOSE_LOGGING: true,          // Log detail di console
```

**Untuk Production:**
```typescript
DISABLE_AUTH_PROTECTION: false, // Require authentication
DISABLE_AUTO_LOGOUT: false,     // Auto logout saat 401
VERBOSE_LOGGING: false,         // Minimal logging
```

### 2. Error Handling

Ketika `VERBOSE_LOGGING: true`:
- Error page akan menampilkan stack trace
- Console akan menampilkan detail error
- ErrorBoundary akan log informasi lengkap

### 3. Route Protection

Ketika `DISABLE_AUTH_PROTECTION: true`:
- Semua protected routes dapat diakses tanpa login
- Tidak akan redirect ke /auth/login
- Masih menampilkan loading state jika diperlukan

### 4. Axios Interceptor

Ketika `DISABLE_AUTO_LOGOUT: true`:
- Error 401 tidak akan auto logout
- Token tidak akan dihapus dari localStorage
- Tidak akan redirect ke login page

## Helper Functions

```typescript
import { debugLog, debugWarn, debugError } from '@/config/debug';

// Log debugging information
debugLog('User action:', userAction);

// Warn about potential issues
debugWarn('API response delayed:', response);

// Log errors
debugError('Failed to process:', error);
```

## Rekomendasi Workflow

### Development Phase
1. Set `DISABLE_AUTH_PROTECTION: true`
2. Set `DISABLE_AUTO_LOGOUT: true` 
3. Set `VERBOSE_LOGGING: true`
4. Develop dan test fitur tanpa gangguan auth

### Testing Phase
1. Set `DISABLE_AUTH_PROTECTION: false`
2. Set `DISABLE_AUTO_LOGOUT: false`
3. Set `VERBOSE_LOGGING: true`
4. Test auth flow dan error handling

### Production Deployment
1. Set semua debug flags ke `false`
2. Build dan deploy

## Troubleshooting

### Problem: Masih redirect ke login setelah error
**Solution:** Pastikan `DISABLE_AUTO_LOGOUT: true` di `debug.ts`

### Problem: Tidak bisa akses protected routes
**Solution:** Pastikan `DISABLE_AUTH_PROTECTION: true` di `debug.ts`

### Problem: Tidak ada informasi error detail
**Solution:** Pastikan `VERBOSE_LOGGING: true` di `debug.ts`

## Files Yang Terpengaruh

- `src/config/debug.ts` - Konfigurasi debug
- `src/components/route/ProtectedRoute.tsx` - Route protection
- `src/services/axios.ts` - HTTP interceptor
- `src/components/ErrorBoundary.tsx` - Error boundary
- `src/pages/ErrorPage.tsx` - Error display

## Catatan Penting

⚠️ **JANGAN LUPA** disable debug mode sebelum production deployment!

✅ **SELALU** test dengan debug mode disabled sebelum release

🔍 **GUNAKAN** verbose logging untuk troubleshooting
