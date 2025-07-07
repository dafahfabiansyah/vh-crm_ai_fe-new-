import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WhatsAppStatusResponse } from '@/services/whatsappService';

// WhatsApp connection state interface
export interface WhatsAppConnectionData {
  isConnected: boolean;
  isLoggedIn: boolean;
  phoneNumber: string | null;
  deviceId: string | null;
  deviceName: string | null;
  status: string | null;
  timestamp: string | null;
  sessionId: string | null;
}

interface WhatsAppState {
  connectionData: WhatsAppConnectionData;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  error: string | null;
  lastUpdated: string | null;
}

const initialState: WhatsAppState = {
  connectionData: {
    isConnected: false,
    isLoggedIn: false,
    phoneNumber: null,
    deviceId: null,
    deviceName: null,
    status: null,
    timestamp: null,
    sessionId: null,
  },
  connectionStatus: 'disconnected',
  error: null,
  lastUpdated: null,
};

const whatsappSlice = createSlice({
  name: 'whatsapp',
  initialState,
  reducers: {
    // Set connection data from QR scan result
    setConnectionData: (
      state,
      action: PayloadAction<{
        statusData: WhatsAppStatusResponse['data'];
        sessionId?: string;
      }>
    ) => {
      const { statusData, sessionId } = action.payload;
      
      state.connectionData = {
        isConnected: statusData.is_connected,
        isLoggedIn: statusData.is_logged_in,
        phoneNumber: statusData.phone_number,
        deviceId: statusData.device_id,
        deviceName: statusData.device_name,
        status: statusData.status,
        timestamp: statusData.timestamp,
        sessionId: sessionId || state.connectionData.sessionId,
      };
      
      // Update connection status based on logged in state
      if (statusData.is_logged_in) {
        state.connectionStatus = 'connected';
      } else if (statusData.is_connected) {
        state.connectionStatus = 'connecting';
      } else {
        state.connectionStatus = 'disconnected';
      }
      
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },

    // Update connection status only
    setConnectionStatus: (
      state,
      action: PayloadAction<'disconnected' | 'connecting' | 'connected'>
    ) => {
      state.connectionStatus = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    // Set session ID from QR code generation
    setSessionId: (state, action: PayloadAction<string>) => {
      state.connectionData.sessionId = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    // Set device ID
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.connectionData.deviceId = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.lastUpdated = new Date().toISOString();
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },

    // Disconnect WhatsApp
    disconnect: (state) => {
      state.connectionData = {
        isConnected: false,
        isLoggedIn: false,
        phoneNumber: null,
        deviceId: null,
        deviceName: null,
        status: null,
        timestamp: null,
        sessionId: null,
      };
      state.connectionStatus = 'disconnected';
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },

    // Reset state
    reset: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setConnectionData,
  setConnectionStatus,
  setSessionId,
  setDeviceId,
  setError,
  clearError,
  disconnect,
  reset,
} = whatsappSlice.actions;

export default whatsappSlice.reducer;

// Selectors
export const selectWhatsAppConnectionData = (state: { whatsapp: WhatsAppState }) =>
  state.whatsapp.connectionData;

export const selectWhatsAppConnectionStatus = (state: { whatsapp: WhatsAppState }) =>
  state.whatsapp.connectionStatus;

export const selectWhatsAppError = (state: { whatsapp: WhatsAppState }) =>
  state.whatsapp.error;

export const selectWhatsAppLastUpdated = (state: { whatsapp: WhatsAppState }) =>
  state.whatsapp.lastUpdated;

export const selectIsWhatsAppConnected = (state: { whatsapp: WhatsAppState }) =>
  state.whatsapp.connectionData.isLoggedIn;
