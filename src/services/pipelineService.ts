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
}

export default PipelineService;
