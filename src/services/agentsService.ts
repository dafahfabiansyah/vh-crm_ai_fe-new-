import axiosInstance from './axios';
import type { AgentsResponse, AIAgent, AgentRole } from '../types';
import type { ApiSuccessResponse } from '../types/api';

export interface CreateAgentRequest {
  name: string;
  role_id: string;
  is_active?: boolean;
}

export interface CreateAgentResponse {
  data: AIAgent;
}

export class AgentsService {
  /**
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
      const response = await axiosInstance.get<ApiSuccessResponse<AgentRole[]>>('/tenant/agent-roles');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch agent roles',
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
