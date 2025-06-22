import axiosInstance from './axios';

export interface CreateAgentMappingRequest {
  whatsapp_number: string;
  agent_id: string;
  is_active: boolean;
  DeviceID: string;  // Required field according to API
  MappingType: string;  // Required field according to API
}

export interface AgentMappingResponse {
  id: string;
  whatsapp_number: string;
  agent_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentMappingAPIResponse {
  status: string;
  message: string;
  data: AgentMappingResponse;
}

export class AgentMappingService {
  static async createMapping(request: CreateAgentMappingRequest): Promise<CreateAgentMappingAPIResponse> {
    try {
      const response = await axiosInstance.post<CreateAgentMappingAPIResponse>(
        '/tenant/whatsapp-agent/mappings',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating agent mapping:', error);
      throw error;
    }
  }
}
