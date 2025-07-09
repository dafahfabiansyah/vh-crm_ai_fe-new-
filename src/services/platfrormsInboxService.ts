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
  }
};
