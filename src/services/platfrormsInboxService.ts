import axiosInstance from './axios';

export const platformsInboxService = {
  /**
   * Ambil data platform inbox
   */
  async getPlatformInbox() {
    try {
      const response = await axiosInstance.get('/v1/platform-inbox');
      console.log('Platform Inbox fetched:', response.data);
      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error fetching platform inbox:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch platform inbox');
    }
  },

  /**
   * Hapus platform inbox berdasarkan id
   */
  async deletePlatformInbox(id: string) {
    try {
      const response = await axiosInstance.delete(`/v1/platform-inbox/${id}`);
      console.log('Platform Inbox deleted:', id, response.data);
      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error deleting platform inbox:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete platform inbox');
    }
  },

  /**
   * Mapping AI Agent ke Platform
   */
  async mapAgentToPlatform(id_agent: string, id_platform: string) {
    try {
      const response = await axiosInstance.post('/v1/platform_mappings', {
        id_agent,
        id_platform,
        agent_type: 'AI',
      });
      console.log('Mapping AI Agent to Platform:', { id_agent, id_platform, agent_type: 'AI' }, response.data);
      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error mapping agent to platform:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(err.response?.data?.message || err.message || 'Failed to map agent to platform');
    }
  },

  /**
   * Clear AI Agent mapping dari Platform
   */
  async clearAgentMapping(id_platform: string) {
    try {
      const response = await axiosInstance.post('/v1/platform_mappings', {
        id_agent: '',
        id_platform,
        agent_type: 'AI',
      });
      console.log('Cleared AI Agent mapping from Platform:', { id_platform }, response.data);
      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error clearing agent mapping:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(err.response?.data?.message || err.message || 'Failed to clear agent mapping');
    }
  },

  /**
   * Update platform mapping dengan pipeline
   */
  async updatePlatformMapping(id: string, id_pipeline: string | null, preserveConnectionStatus: boolean = true) {
    try {
      const requestBody: any = { id, id_pipeline };
      // If we want to preserve connection status, we might need to send additional fields
      if (preserveConnectionStatus) {
        console.log('Attempting to preserve connection status during pipeline mapping');
      }
      console.log('Sending PATCH request to /v1/platform-inbox with:', requestBody);
      const response = await axiosInstance.patch('/v1/platform-inbox', requestBody);
      console.log('Platform mapping updated - Full response:', response);
      console.log('Platform mapping updated - Response data:', response.data);
      console.log('Platform mapping updated - Response status:', response.status);
      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error updating platform mapping:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      throw new Error(err.response?.data?.message || err.message || 'Failed to update platform mapping');
    }
  },

  /**
   * Map Pipeline ke Platform menggunakan endpoint yang sama dengan AI Agent
   */
  async mapPipelineToPlatform(id_pipeline: string, id_platform: string) {
    try {
      console.log('Sending POST request to /v1/platform_mappings for pipeline:', { id_pipeline, id_platform });
      const response = await axiosInstance.post('/v1/platform_mappings', {
        id_pipeline,
        id_platform,
        agent_type: 'PIPELINE',
      });
      console.log('Pipeline mapping response:', response.data);
      return response.data;
    } catch (error) {
      const err = error as any;
      console.error('Error mapping pipeline to platform:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(err.response?.data?.message || err.message || 'Failed to map pipeline to platform');
    }
  }
};
