// WhatsApp Service - Simplified version
// import { AuthService } from './authService';
import axiosInstance from './axios';

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
      const response = await axiosInstance.post(`${API_BASE_URL}/create-session`, {
        session: sessionName,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to create session',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  },

  getStatus: async (sessionId: string): Promise<GetStatusResponse> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/status/${sessionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to get status',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  },

  getQRCode: async (deviceId: string): Promise<GetQRCodeResponse> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/qrcode/${deviceId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to get QR code',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  },

  getAllBusinessSessions: async (): Promise<GetAllBusinessSessionsResponse> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/sessions`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to get sessions',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  },

  sendMessage: async ({ session, number, message }: { session: string; number: string; message: string }) => {
    try {
      const response = await axiosInstance.post(`http://localhost:3000/send-message`, {
        session,
        number,
        message,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to send message',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  },
};

export default whatsappService;
