// WhatsApp Service - Simplified version
import { AuthService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_WHATSAPP_URL || 'http://localhost:8080';

export interface CreateSessionRequest {
  session: string;
}

export interface CreateSessionResponse {
  success: boolean;
  message: string;
  session: string;
  status: string;
  qr: string;
}

export interface GetStatusResponse {
  session: string;
  status: string;
  is_connected: boolean;
  is_logged_in: boolean;
  phone_number: string | null;
  device_id: string | null;
  device_name: string | null;
  timestamp: string | null;
}

export interface GetQRCodeResponse {
  success: boolean;
  message: string;
  data: {
    qr_code: string;
    expires_at: string;
    session_id: string;
    // tambahkan field lain jika perlu
  };
}

export interface GetAllBusinessSessionsResponse {
  success: boolean;
  message: string;
  data: {
    sessions: Array<any>; // Ganti any dengan tipe session jika sudah ada
  };
}

export const whatsappService = {
  createSession: async (sessionName: string): Promise<CreateSessionResponse> => {
    try {
      // Get token from cookies
      const token = AuthService.getStoredToken();
      
      const response = await fetch(`${API_BASE_URL}/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          session: sessionName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('WhatsApp Create Session Error:', error);
      throw new Error(error.message || 'Failed to create session');
    }
  },

  getStatus: async (sessionId: string): Promise<GetStatusResponse> => {
    try {
      // Get token from cookies
      const token = AuthService.getStoredToken();
      
      const response = await fetch(`${API_BASE_URL}/status/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('WhatsApp Get Status Error:', error);
      throw new Error(error.message || 'Failed to get status');
    }
  },

  getQRCode: async (deviceId: string): Promise<GetQRCodeResponse> => {
    const token = AuthService.getStoredToken();
    const response = await fetch(`${API_BASE_URL}/qrcode/${deviceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getAllBusinessSessions: async (): Promise<GetAllBusinessSessionsResponse> => {
    const token = AuthService.getStoredToken();
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default whatsappService;
