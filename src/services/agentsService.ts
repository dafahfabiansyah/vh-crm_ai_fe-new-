import axiosInstance from './axios';
import type { AIAgent } from '../types';

export interface CreateAgentRequest {
  name: string;
  description: string;
  settings: {
    behaviour?: string;
    welcome_message?: string;
    transfer_condition?: string;
    model?: string;
    history_limit?: number;
    context_limit?: number;
    message_await?: number;
    message_limit?: number;
    // RajaOngkir
    rajaongkir_enabled?: boolean;
    rajaongkir_origin_city?: string;
    rajaongkir_couriers?: string[];
  };
}

export interface CreateAgentResponse {
  data: AIAgent;
}

export interface AgentSettings {
  id: string;
  behaviour: string;
  welcome_message: string;
  transfer_condition: string;
  model: string;
  history_limit: number;
  context_limit: number;
  message_await: number;
  message_limit: number;
  // RajaOngkir
  rajaongkir_enabled?: boolean;
  rajaongkir_origin_city?: string;
  rajaongkir_couriers?: string[];
  created_at: string;
  updated_at: string;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
}

export interface UpdateAgentSettingsRequest {
  behaviour?: string;
  welcome_message?: string;
  transfer_condition?: string;
  model?: string;
  history_limit?: number;
  context_limit?: number;
  message_await?: number;
  message_limit?: number;
  // RajaOngkir
  rajaongkir_enabled?: boolean;
  rajaongkir_origin_city?: string;
  rajaongkir_couriers?: string[];
}

export class AgentsService {
  /**
   * Get all AI agents
   */
  static async getAgents(): Promise<AIAgent[]> {
    try {
      const response = await axiosInstance.get<AIAgent[]>('/v1/ai/agents');
      
      // Response is direct array
      return response.data;
    } catch (error: any) {
      // Handle and format error response
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch agents',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Create a new AI agent
   */
  static async createAgent(data: CreateAgentRequest): Promise<AIAgent> {
    try {
      const response = await axiosInstance.post<AIAgent>('/v1/ai/agents', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to create agent',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Delete an AI agent
   */
  static async deleteAgent(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/ai/agents/${id}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to delete agent',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Get a specific AI agent by ID
   */
  static async getAgent(id: string): Promise<AIAgent> {
    try {
      const response = await axiosInstance.get<AIAgent>(`/v1/ai/agents/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch agent',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Get agent settings by agent ID
   */
  static async getAgentSettings(id: string): Promise<AgentSettings> {
    try {
      const response = await axiosInstance.get<AgentSettings>(`/v1/ai/agents/${id}/settings`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch agent settings',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Update an AI agent
   */
  static async updateAgent(id: string, data: UpdateAgentRequest): Promise<AIAgent> {
    try {
      const response = await axiosInstance.put<AIAgent>(`/v1/ai/agents/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to update agent',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Update agent settings using settings ID
   */
  static async updateAgentSettings(settingsId: string, data: UpdateAgentSettingsRequest): Promise<AgentSettings> {
    try {
      const response = await axiosInstance.put<AgentSettings>(`/v1/ai/settings/${settingsId}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to update agent settings',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }
}
