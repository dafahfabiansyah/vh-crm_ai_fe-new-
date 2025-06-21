# WhatsApp Redux Integration

Setelah scan QR code berhasil, data WhatsApp akan disimpan di Redux store dan dapat digunakan di halaman manapun dalam aplikasi.

## Data yang Disimpan

Setelah scan QR code sukses, data berikut akan tersimpan di Redux:

```typescript
interface WhatsAppConnectionData {
  isConnected: boolean;      // Status koneksi perangkat
  isLoggedIn: boolean;       // Status login WhatsApp
  phoneNumber: string | null; // Nomor telepon yang terhubung
  deviceId: string | null;   // ID perangkat unik
  deviceName: string | null; // Nama perangkat
  status: string | null;     // Status detail dari API
  timestamp: string | null;  // Waktu update terakhir
  sessionId: string | null;  // ID sesi dari QR code
}
```

## Cara Menggunakan Data WhatsApp di Komponen Lain

### 1. Import Hooks dan Selectors

```typescript
import { useAppSelector } from '@/hooks/redux';
import {
  selectWhatsAppConnectionData,
  selectWhatsAppConnectionStatus,
  selectIsWhatsAppConnected,
} from '@/store/whatsappSlice';
```

### 2. Gunakan di Komponen

```typescript
const MyComponent = () => {
  // Ambil semua data koneksi WhatsApp
  const connectionData = useAppSelector(selectWhatsAppConnectionData);
  
  // Ambil status koneksi saja
  const connectionStatus = useAppSelector(selectWhatsAppConnectionStatus);
  
  // Cek apakah WhatsApp sudah terhubung dan login
  const isConnected = useAppSelector(selectIsWhatsAppConnected);

  return (
    <div>
      {isConnected ? (
        <div>
          <p>WhatsApp terhubung!</p>
          <p>Nomor: {connectionData.phoneNumber}</p>
          <p>Device: {connectionData.deviceName}</p>
        </div>
      ) : (
        <p>WhatsApp belum terhubung</p>
      )}
    </div>
  );
};
```

### 3. Contoh Penggunaan Lengkap

Lihat file `src/components/whatsapp-status-widget.tsx` untuk contoh lengkap penggunaan data WhatsApp dari Redux.

## Selectors yang Tersedia

1. `selectWhatsAppConnectionData` - Mengambil semua data koneksi
2. `selectWhatsAppConnectionStatus` - Status: 'disconnected' | 'connecting' | 'connected'
3. `selectWhatsAppError` - Error message jika ada
4. `selectWhatsAppLastUpdated` - Waktu update terakhir
5. `selectIsWhatsAppConnected` - Boolean apakah sudah terhubung dan login

## Actions yang Tersedia

Jika perlu mengupdate data secara manual:

```typescript
import { useAppDispatch } from '@/hooks/redux';
import { setConnectionData, disconnect, setError } from '@/store/whatsappSlice';

const dispatch = useAppDispatch();

// Update data koneksi
dispatch(setConnectionData({ statusData, sessionId }));

// Disconnect WhatsApp
dispatch(disconnect());

// Set error
dispatch(setError('Error message'));
```

## Penggunaan di Halaman-Halaman Lain

### Dashboard
Tampilkan status WhatsApp di dashboard untuk memberi tahu user apakah WhatsApp sudah terhubung.

### Chat Page
Gunakan data `phoneNumber` dan `deviceId` untuk mengirim pesan WhatsApp.

### Settings Page
Tampilkan informasi lengkap koneksi WhatsApp dan tombol disconnect.

### Navigation
Tampilkan indikator status WhatsApp di navigation bar.

## Persistence

Data WhatsApp di Redux akan hilang ketika refresh page. Jika perlu persistence, tambahkan redux-persist atau simpan ke localStorage.

## Contoh Real-time Status Check

```typescript
// Cek status secara berkala
useEffect(() => {
  const interval = setInterval(() => {
    if (connectionData.deviceId) {
      // Panggil API check status dan update Redux
      checkWhatsAppStatus(connectionData.deviceId);
    }
  }, 30000); // Cek setiap 30 detik

  return () => clearInterval(interval);
}, [connectionData.deviceId]);
```
