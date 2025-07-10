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
  }
};
