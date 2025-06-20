# Troubleshooting Auth Persistence

## Masalah: Page Refresh Kembali ke Login

### Kemungkinan Penyebab:

1. **Token tidak tersimpan di localStorage**
   - Backend tidak mengirim token di response
   - Ada error saat menyimpan token
   - Token hilang karena localStorage di-clear

2. **Token tersimpan tapi tidak di-restore**
   - AuthInitializer tidak berjalan
   - AuthService.getStoredToken() mengembalikan null
   - Redux state tidak terupdate

3. **Race condition**
   - ProtectedRoute check terjadi sebelum AuthInitializer selesai
   - isInitialized belum true saat pengecekan

### Debugging Steps:

1. **Cek localStorage di browser console:**
```javascript
// Cek di browser console
DebugAuth.checkLocalStorage()

// Atau manual
console.log('Token:', localStorage.getItem('auth_token'))
console.log('User:', localStorage.getItem('user_data'))
```

2. **Cek apakah login/register menyimpan token:**
   - Buka Network tab di browser dev tools
   - Login/Register
   - Cek response API apakah ada field `token`
   - Cek console log untuk "Storing token and user data"

3. **Cek AuthInitializer:**
   - Refresh page
   - Cek console log untuk "AuthInitializer: Checking stored auth data"
   - Lihat apakah token dan user ditemukan

4. **Cek Redux state:**
   - Install Redux DevTools Extension
   - Lihat apakah action `initializeAuth` dipanggil
   - Cek apakah `isInitialized` menjadi true

### Solusi Berdasarkan Masalah:

#### 1. Jika Token Tidak Tersimpan:
- Cek response API login/register
- Pastikan backend mengirim field `token`
- Jika backend tidak mengirim token, modifikasi backend

#### 2. Jika Token Tersimpan Tapi Tidak Di-restore:
- Cek AuthInitializer di main.tsx
- Pastikan tidak ada error di AuthService
- Cek console log untuk error parsing

#### 3. Jika Race Condition:
- Pastikan `isInitialized` false di initial state
- Pastikan ProtectedRoute cek `isInitialized`
- Pastikan AuthInitializer set `isInitialized` true

### Manual Test untuk Debug:

```javascript
// Di browser console setelah page load
DebugAuth.setTestAuth() // Set test data
location.reload() // Refresh page
// Lihat apakah tetap login atau redirect ke login
```

### Temporary Workaround:

Jika masih bermasalah, bisa gunakan sessionStorage sebagai fallback:

```javascript
// Di AuthService
static getStoredToken(): string | null {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

// Saat menyimpan token
localStorage.setItem('auth_token', token);
sessionStorage.setItem('auth_token', token); // Backup
```
