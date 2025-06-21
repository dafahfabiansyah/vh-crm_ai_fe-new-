import axiosInstance from './axios';

export interface WhatsAppQRCodeRequest {
  device_id: string;
}

export interface WhatsAppQRCodeResponse {
  success: boolean;
  message: string;
  data: {
    qr_code: string;
    qr_code_image: string;
    session_id: string;
    device_id: string;
    expires_at: string;
    instructions: string;
  };
}

export interface WhatsAppStatusResponse {
  success: boolean;
  message: string;
  data: {
    is_connected: boolean;
    is_logged_in: boolean;
    phone_number: string;
    device_id: string;
    device_name: string;
    status: string;
    timestamp: string;
  };
}

export interface WhatsAppSession {
  id: string;
  tenant_id: string;
  device_id: string;
  status: 'active' | 'inactive' | 'connecting';
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface WhatsAppBusinessSessionsResponse {
  success: boolean;
  message: string;
  data: {
    sessions: WhatsAppSession[];
    tenant_id: string;
    total_sessions: number;
  };
}

export const whatsappService = {
  getQRCode: async (device_id: string): Promise<WhatsAppQRCodeResponse> => {
    try {
      const response = await axiosInstance.post<WhatsAppQRCodeResponse>(
        '/tenant/whatsapp/meow/qr',
        { device_id }
      );
      return response.data;
    } catch (error: any) {
      console.error('WhatsApp QR Code Error:', error);

      // Handle different types of errors
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to WhatsApp service. Please check if the server is running.');
      } else if (error.response?.status === 404) {
        throw new Error('WhatsApp service endpoint not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to generate QR code. Please try again.');
      }
    }
  },

  getStatus: async (device_id: string): Promise<WhatsAppStatusResponse> => {
    try {
      const response = await axiosInstance.get<WhatsAppStatusResponse>(
        `/tenant/whatsapp/meow/status?device_id=${device_id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('WhatsApp Status Error:', error);

      // Handle different types of errors
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to WhatsApp service.');
      } else if (error.response?.status === 404) {
        throw new Error('Device not found or WhatsApp service unavailable.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to check WhatsApp status.');
      }
    }
  },

  getBusinessSessions: async (device_id: string): Promise<WhatsAppBusinessSessionsResponse> => {
    try {
      const response = await axiosInstance.get<WhatsAppBusinessSessionsResponse>(
        `/tenant/whatsapp/meow/business-sessions?device_id=${device_id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('WhatsApp Business Sessions Error:', error);

      // Handle different types of errors
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to WhatsApp service.');
      } else if (error.response?.status === 404) {
        throw new Error('Device not found or WhatsApp service unavailable.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to retrieve WhatsApp business sessions.');
      }
    }
  },

  getAllBusinessSessions: async (): Promise<WhatsAppBusinessSessionsResponse> => {
    try {
      const response = await axiosInstance.get<WhatsAppBusinessSessionsResponse>(
        '/tenant/whatsapp/business-sessions'
      );
      return response.data;
    } catch (error: any) {
      console.error('WhatsApp Business Sessions Error:', error);
      
      // Handle different types of errors
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to WhatsApp service. Please check if the server is running.');
      } else if (error.response?.status === 404) {
        throw new Error('WhatsApp business sessions endpoint not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to fetch WhatsApp business sessions. Please try again.');
      }
    }
  },
};

export default whatsappService;
