import axiosInstance from "./axios";
import type { ApiSuccessResponse } from "../types/interface";

export interface HumanAgent {
  id: string;
  identifier: string;
  department: string | null;
  agent_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    name: string;
    password: string;
    business_name: string;
    phone_number: string;
    type: string;
    status: boolean;
    created_at: string;
    updated_at: string;
  };
  // Legacy properties for backward compatibility
  name?: string;
  user_email?: string;
  role?: string;
}

export interface CreateHumanAgentRequest {
  name: string;
  user_email: string;
  password: string;
  role: string;
  department: string;
  is_active: boolean;
}

export interface UpdateHumanAgentRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
  agent_type?: string;
  phone_number?: string;
  type?: string;
}

export class HumanAgentsService {
  /**
   * Get all human agents
   */
  static async getHumanAgents(): Promise<HumanAgent[]> {
    try {
      const response = await axiosInstance.get("/v1/agents/human");
      // Response: { page, per_page, page_count, total_count, items: [...] }
      const items = response.data.items || [];
      const transformedData: HumanAgent[] = items.map((item: any) => ({
        ...item,
        // Add legacy properties for backward compatibility
        name: item.user?.name || "-",
        user_email: item.user?.email || "-",
        // role: item.agent_type ? item.agent_type : "",
      }));
      return transformedData;
    } catch (error: any) {
      console.error("Error fetching human agents:", error);
      if (error.response?.data) {
        throw {
          message:
            error.response.data.message || "Failed to fetch human agents",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }

  /**
   * Create a new human agent
   */
  static async createHumanAgent(
    agentData: {
      name: string;
      email: string;
      password: string;
      department?: string | null;
      phone_number?: string;
      agent_type : string;
       role?: string;
    }
  ): Promise<any> {
    try {
      const requestBody = {
        name: agentData.name,
        email: agentData.email,
        password: agentData.password,
        department: agentData.department, // kirim dari form
        phone_number: agentData.phone_number,
        agent_type: "Human",
        role: agentData.role,
        is_active: true,
      };
      const response = await axiosInstance.post(
        "/v1/agents",
        requestBody
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message:
            error.response.data.message || "Failed to create human agent",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }
  /**
   * Update a human agent
   */
  static async updateHumanAgent(
    id: string,
    agentData: UpdateHumanAgentRequest
  ): Promise<HumanAgent> {
    try {
      // Build request body with only provided fields
      const requestBody: any = {};
      
      if (agentData.department !== undefined) {
        if (agentData.department && agentData.department !== "") {
          requestBody.department = agentData.department;
        }
      }
      
      if (agentData.is_active !== undefined) {
        requestBody.is_active = agentData.is_active;
      }
      
      if (agentData.agent_type !== undefined) {
        requestBody.agent_type = agentData.agent_type;
      }
      
      if (agentData.name !== undefined) {
        requestBody.name = agentData.name;
      }
      
      if (agentData.email !== undefined) {
        requestBody.email = agentData.email;
      }
      
      if (agentData.phone_number !== undefined) {
        requestBody.phone_number = agentData.phone_number;
      }
      
      if (agentData.role !== undefined) {
        requestBody.role = agentData.role;
      }
      
      if (agentData.type !== undefined) {
        requestBody.type = agentData.type;
      }
      
      if (agentData.password !== undefined) {
        requestBody.password = agentData.password;
      }
      
      const response = await axiosInstance.patch<ApiSuccessResponse<HumanAgent>>(
        `/v1/agents/${id}`,
        requestBody
      );
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message:
            error.response.data.message || "Failed to update human agent",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }

  /**
   * Delete a human agent
   */
  static async deleteHumanAgent(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/agents/${id}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message:
            error.response.data.message || "Failed to delete human agent",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }

  /**
   * Get single human agent by ID
   */ static async getHumanAgent(id: string): Promise<HumanAgent> {
    try {
      const response = await axiosInstance.get<ApiSuccessResponse<HumanAgent>>(
        `/v1/agents/human/${id}`
      );
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Failed to fetch human agent",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }

  /**
   * Get agent details with complete user information
   */
  static async getAgentDetails(id: string): Promise<HumanAgent> {
    try {
      const response = await axiosInstance.get(
        `/v1/agents/details/${id}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Failed to fetch agent details",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }

  /**
   * PATCH update a human agent (minimal fields)
   */
  static async patchAgent(
    id: string,
    data: { department?: string; is_active?: boolean; agent_type?: string }
  ): Promise<HumanAgent> {
    try {
      const response = await axiosInstance.patch<ApiSuccessResponse<HumanAgent>>(
        `/v1/agents/${id}`,
        data
      );
      return response.data.data || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || "Failed to patch agent",
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }
}
