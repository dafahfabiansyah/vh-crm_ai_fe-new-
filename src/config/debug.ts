/**
 * Debug Configuration
 * 
 * Konfigurasi untuk mode debugging aplikasi.
 * Set ke false untuk production deployment.
 */

export const DEBUG_CONFIG = {
  // Mode debugging untuk route protection
  DISABLE_AUTH_PROTECTION: false, // Set to false to enable auth protection
  
  // Mode debugging untuk axios interceptor
  DISABLE_AUTO_LOGOUT: false, // Set to false to enable auto logout
  
  // Log level debugging
  VERBOSE_LOGGING: true,
  
  // Mock API responses
  USE_MOCK_API: false,
} as const;

// Helper functions
export const isDebugMode = () => DEBUG_CONFIG.DISABLE_AUTH_PROTECTION;
export const shouldAutoLogout = () => !DEBUG_CONFIG.DISABLE_AUTO_LOGOUT;
export const isVerboseLogging = () => DEBUG_CONFIG.VERBOSE_LOGGING;

// Console helpers
export const debugLog = (...args: unknown[]) => {
  if (DEBUG_CONFIG.VERBOSE_LOGGING) {
    console.log('[DEBUG]', ...args);
  }
};

export const debugWarn = (...args: unknown[]) => {
  if (DEBUG_CONFIG.VERBOSE_LOGGING) {
    console.warn('[DEBUG]', ...args);
  }
};

export const debugError = (...args: unknown[]) => {
  if (DEBUG_CONFIG.VERBOSE_LOGGING) {
    console.error('[DEBUG]', ...args);
  }
};
