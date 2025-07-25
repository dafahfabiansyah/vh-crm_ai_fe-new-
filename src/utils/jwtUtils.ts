/**
 * JWT utility functions for frontend token handling
 * Note: This is a simple decoder for reading JWT payload without verification
 * Token verification should be handled by the backend
 */

import { AuthService } from '../services/authService';

export interface JWTPayload {
  id_tenant?: string;
  [key: string]: any;
}

/**
 * Decode JWT token payload without verification
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    console.log('decodeJWT input token:', token.substring(0, 50) + '...');
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');
    console.log('Clean token (after removing Bearer):', cleanToken.substring(0, 50) + '...');
    
    // Split token into parts
    const parts = cleanToken.split('.');
    console.log('Token parts count:', parts.length);
    
    if (parts.length !== 3) {
      console.error('Invalid JWT format - expected 3 parts, got:', parts.length);
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    console.log('Raw payload part:', payload.substring(0, 50) + '...');
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    console.log('Padded payload:', paddedPayload.substring(0, 50) + '...');
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    console.log('Decoded payload string:', decodedPayload);
    
    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload);
    console.log('Parsed payload object:', parsedPayload);
    
    return parsedPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Get tenant ID from JWT token stored in cookies via AuthService
 * @returns Tenant ID or null if not found
 */
export function getTenantIdFromToken(): string | null {
  try {
    const token = AuthService.getStoredToken();
    if (!token) {
      console.error('No token found in cookies');
      return null;
    }
    
    console.log('Raw token from cookies:', token.substring(0, 50) + '...');
    const payload = decodeJWT(token);
    console.log('Decoded payload in getTenantIdFromToken:', payload);
    
    if (!payload) {
      console.error('Failed to decode JWT payload');
      return null;
    }
    
    const tenantId = payload.id_tenant;
    console.log('Extracted tenant ID:', tenantId);
    
    return tenantId || null;
  } catch (error) {
    console.error('Error getting tenant ID from token:', error);
    return null;
  }
}

/**
 * Get full JWT payload from token stored in cookies via AuthService
 * @returns JWT payload or null if not found
 */
export function getTokenPayload(): JWTPayload | null {
  try {
    const token = AuthService.getStoredToken();
    if (!token) {
      console.error('No token found in cookies');
      return null;
    }
    
    return decodeJWT(token);
  } catch (error) {
    console.error('Error getting token payload:', error);
    return null;
  }
}