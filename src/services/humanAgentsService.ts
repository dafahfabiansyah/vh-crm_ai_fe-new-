import axiosInstance from "./axios";
import type { ApiSuccessResponse } from "../types/interface";

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

export interface UpdateHumanAgentRequest {
  name?: string;
  user_email?: string;
  password?: string;
  role?: string;
  department?: string;
  is_active?: boolean;
}

export class HumanAgentsService {
  /**
   * Get all human agents
   */
  static async getHumanAgents(): Promise<HumanAgent[]> {
    try {
      const response = await axiosInstance.get("/v1/agents?offset=0&limit=10");
      // Response: { items: [...] }
      const items = response.data.items || [];
      const transformedData: HumanAgent[] = items.map((item: any) => ({
        id: item.id,
        name: item.name || "-", // fallback jika tidak ada
        user_email: item.user_email || "-", // fallback jika tidak ada
        role: item.role || item.agent_type || "agent", // fallback ke agent_type jika role tidak ada
        department: item.department || "-",
        is_active: item.is_active,
        status: undefined, // tidak ada di response
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
    }
  ): Promise<any> {
    try {
      const requestBody = {
        name: agentData.name,
        email: agentData.email,
        password: agentData.password,
        // department: agentData.department ?? null,
        department: null,
        phone_number: agentData.phone_number,
        agent_type: "Human",
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
      const response = await axiosInstance.put<ApiSuccessResponse<HumanAgent>>(
        `/tenant/human-agents/${id}`,
        agentData
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
        `/tenant/human-agents/${id}`
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
}
