import axiosInstance from './axios';
import type { ApiSuccessResponse } from '../types/api';

export interface HumanAgent {
  id: string;
  name: string;
  user_email: string;
  role: string;
  department: string;
  is_active: boolean;
  status?: string;
}

export interface CreateHumanAgentRequest {
  name: string;
  user_email: string;
  password: string;
  role: string;
  department: string;
  is_active: boolean;
}

export interface HumanAgentsResponse {
  agents: HumanAgent[];
  total: number;
  page: number;
  limit: number;
}

export class HumanAgentsService {
  /**
   * Get all human agents
   */  static async getHumanAgents(): Promise<HumanAgent[]> {
    try {
      const response = await axiosInstance.get('/tenant/human-agents');
      
      console.log('API Response:', response.data); // Debug log
      
      // Handle different response structures
      let rawData;
      if (response.data.data) {
        rawData = response.data.data;
      } else if (Array.isArray(response.data)) {
        rawData = response.data;
      } else {
        rawData = [];
      }
        // Transform the data to match our interface
      const transformedData: HumanAgent[] = Array.isArray(rawData) ? rawData.map((item: any) => ({
        id: item.id || item.user_id || String(Date.now()),
        name: item.name || item.username || 'Unknown',
        user_email: item.user_email || item.email || '',
        role: typeof item.role === 'object' ? (item.role?.name || 'agent') : (item.role || 'agent'),
        department: typeof item.department === 'object' ? (item.department?.name || 'general') : (item.department || 'general'),
        is_active: item.is_active !== undefined ? item.is_active : true,
      })) : [];
      
      return transformedData;
    } catch (error: any) {
      console.error('Error fetching human agents:', error);
      // Handle and format error response
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch human agents',
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
   * Create a new human agent
   */  static async createHumanAgent(agentData: CreateHumanAgentRequest): Promise<HumanAgent> {
    try {
      const response = await axiosInstance.post<ApiSuccessResponse<HumanAgent>>('/tenant/human-agents', agentData);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to create human agent',
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
   * Update a human agent
   */  static async updateHumanAgent(id: string, agentData: Partial<CreateHumanAgentRequest>): Promise<HumanAgent> {
    try {
      const response = await axiosInstance.put<ApiSuccessResponse<HumanAgent>>(`/tenant/human-agents/${id}`, agentData);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to update human agent',
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
   * Delete a human agent
   */
  static async deleteHumanAgent(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/tenant/human-agents/${id}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to delete human agent',
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
   * Get single human agent by ID
   */  static async getHumanAgent(id: string): Promise<HumanAgent> {
    try {
      const response = await axiosInstance.get<ApiSuccessResponse<HumanAgent>>(`/tenant/human-agents/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch human agent',
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
