import axiosInstance from './axios';
import type { AgentsResponse, AIAgent, AgentRole } from '../types';
import type { ApiSuccessResponse } from '../types/interface';

export interface CreateAgentRequest {
  name: string;
  role_id: string;
  is_active?: boolean;
}

export interface CreateAgentResponse {
  data: AIAgent;
}

export class AgentsService {  /**
   * Get all AI agents
   */
  static async getAgents(): Promise<AgentsResponse> {
    try {
      const response = await axiosInstance.get<ApiSuccessResponse<AgentsResponse>>('/tenant/agents');
      
      // Extract actual data from wrapper
      const actualData = response.data.data;
      
      return actualData;
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
   * Get AI agents with pagination
   */
  static async getAgentsWithPagination(limit: number = 10, offset: number = 0): Promise<{data: AIAgent[]}> {
    try {
      const response = await axiosInstance.get(`/tenant/agents?limit=${limit}&offset=${offset}`);
      
      console.log("Raw API response:", response.data);
      
      // The API response structure should be: { data: [agents], meta: {...} }
      // Return in format expected by the component
      return {
        data: response.data.data || []
      };
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
   * Get single AI agent by ID
   */
  static async getAgent(id: string): Promise<AIAgent> {
    try {
      const response = await axiosInstance.get<ApiSuccessResponse<AIAgent>>(`/tenant/agents/${id}`);
      return response.data.data;
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
   * Create a new AI agent
   */
  static async createAgent(data: CreateAgentRequest): Promise<AIAgent> {
    try {
      const response = await axiosInstance.post<ApiSuccessResponse<AIAgent>>('/tenant/agents', data);
      return response.data.data;
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
   * Update an existing AI agent
   */
  static async updateAgent(id: string, data: Partial<CreateAgentRequest>): Promise<AIAgent> {
    try {
      const response = await axiosInstance.put<ApiSuccessResponse<AIAgent>>(`/tenant/agents/${id}`, data);
      return response.data.data;
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
   * Delete an AI agent
   */
  static async deleteAgent(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/tenant/agents/${id}`);
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
   * Get available agent roles/templates
   */
  static async getAgentRoles(): Promise<AgentRole[]> {
    try {
      const response = await axiosInstance.get<AgentRole[]>('/tenant/agents/roles');
      // Response is direct array, not wrapped in ApiSuccessResponse
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: unknown }; status?: number } };
      if (err.response?.data) {
        throw {
          message: err.response.data.message || 'Failed to fetch agent roles',
          status: err.response.status,
          errors: err.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }
}
