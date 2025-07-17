import axiosInstance from './axios';

export interface CreatePipelineRequest {
  name: string;
  description: string;
}

export interface CreatePipelineResponse {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  // Add other fields based on your API response
}

export interface PipelineListResponse {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineListApiResponse {
  page: number;
  per_page: number;
  page_count: number;
  total_count: number;
  items: PipelineListResponse[];
}

export class PipelineService {
  /**
   * Create a new pipeline
   */
  static async createPipeline(data: CreatePipelineRequest): Promise<CreatePipelineResponse> {
    try {
      const response = await axiosInstance.post('/v1/pipeline', {
        name: data.name.trim(),
        description: data.description.trim() || data.name.trim()
      });

      return response.data;
    } catch (error: any) {
      console.error('Create pipeline error:', error);
      
      // Transform error for better handling
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to create pipeline. Please try again.');
      }
    }
  }

  /**
   * Get all pipelines
   */
  static async getPipelines(): Promise<PipelineListResponse[]> {
    try {
      const response = await axiosInstance.get('/v1/pipeline');
      const data: PipelineListApiResponse = response.data;
      return data.items; // Return only the items array
    } catch (error: any) {
      console.error('Get pipelines error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch pipelines. Please try again.');
      }
    }
  }

  /**
   * Get pipeline by ID
   */
  static async getPipelineById(id: string): Promise<PipelineListResponse> {
    try {
      const response = await axiosInstance.get(`/v1/pipeline/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Get pipeline by ID error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch pipeline. Please try again.');
      }
    }
  }

  /**
   * Update pipeline
   */
  static async updatePipeline(id: string, data: Partial<CreatePipelineRequest>): Promise<CreatePipelineResponse> {
    try {
      const response = await axiosInstance.put(`/v1/pipeline/${id}`, {
        ...data.name && { name: data.name.trim() },
        ...data.description && { description: data.description.trim() }
      });

      return response.data;
    } catch (error: any) {
      console.error('Update pipeline error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to update pipeline. Please try again.');
      }
    }
  }

  /**
   * Delete pipeline
   */
  static async deletePipeline(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/pipeline/${id}`);
    } catch (error: any) {
      console.error('Delete pipeline error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to delete pipeline. Please try again.');
      }
    }
  }

  /**
   * Create a new stage in a pipeline
   */
  static async createStage({
    name,
    description,
    id_agent,
    id_pipeline,
  }: {
    name: string;
    description: string;
    id_agent: string;
    id_pipeline: string;
  }): Promise<any> {
    try {
      const response = await axiosInstance.post('/v1/stages', {
        name,
        description,
        id_agent,
        id_pipeline,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to create stage. Please try again.');
      }
    }
  }

  /**
   * Get all stages (optionally by pipeline)
   */
  static async getStages(params?: { id_pipeline?: string }): Promise<any[]> {
    try {
      let url = '/v1/stages';
      if (params?.id_pipeline) {
        url += `?id_pipeline=${params.id_pipeline}`;
      }
      const response = await axiosInstance.get(url);
      return response.data.items || [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch stages. Please try again.');
      }
    }
  }

  /**
   * Update a stage by ID
   */
  static async updateStage(id: string, data: { name: string; description: string; stage_order: number }): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/v1/stages/${id}`, {
        name: data.name,
        description: data.description,
        stage_order: data.stage_order,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to update stage. Please try again.');
      }
    }
  }

  /**
   * Delete a stage by ID
   */
  static async deleteStage(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/stages/${id}`);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to delete stage. Please try again.');
      }
    }
  }

  /**
   * Get all leads (optionally by filter)
   */
  static async getLeads(params?: Record<string, any>): Promise<any[]> {
    try {
      let url = '/v1/leads';
      if (params) {
        const query = new URLSearchParams(params).toString();
        if (query) url += `?${query}`;
      }
      const response = await axiosInstance.get(url);
      return response.data.items || [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch leads. Please try again.');
      }
    }
  }

  /**
   * Move a lead card (update lead by ID)
   */
  static async moveLeadCard(id: string, data: Record<string, any>): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/v1/leads/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to move lead card. Please try again.');
      }
    }
  }

  /**
   * Get leads by pipeline ID
   */
  static async getLeadsByPipeline(pipelineId: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get(`v1/leads/pipeline/${pipelineId}`);
      console.log('Leads by pipeline:', response.data);
      return response.data.items || [];
    } catch (error: any) {
      console.error('Get leads by pipeline error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch leads by pipeline. Please try again.');
      }
    }
  }

  /**
   * Get leads by stage ID
   */
  static async getLeadsByStageId(stageId: string): Promise<any[]> {
    try {
      const response = await axiosInstance.get(`/v1/leads/stage/${stageId}`);
      return response.data.items || response.data || [];
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch leads by stage. Please try again.');
      }
    }
  }
}

export default PipelineService;
