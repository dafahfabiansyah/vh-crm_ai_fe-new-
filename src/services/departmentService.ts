import axiosInstance from './axios';

export const DepartmentService = {
  /**
   * Create a new department
   * @param {Object} data - Department data { name: string, description: string }
   * @returns {Promise<any>} - The created department response
   */
  async createDepartment(data: { name: string; description: string }) {
    const response = await axiosInstance.post('/v1/departments', data);
    return response.data;
  },

  /**
   * Get all departments (returns paginated response)
   * @returns {Promise<any>} - Full paginated response from API
   */
  async getAllDepartments() {
    const response = await axiosInstance.get('/v1/departments');
    return response.data; // full response, not just items
  },

  /**
   * Get only department items (array)
   * @returns {Promise<any[]>} - List of departments (array only)
   */
  async getDepartments() {
    const response = await axiosInstance.get('/v1/departments');
    return response.data.items || [];
  },

  /**
   * Get department by ID
   * @param {string} id - Department ID
   * @returns {Promise<any>} - Department detail
   */
  async getDepartmentById(id: string) {
    const response = await axiosInstance.get(`/v1/departments/${id}`);
    return response.data;
  },

  /**
   * Update department by ID
   * @param {string} id - Department ID
   * @param {Object} data - Update data { name, description, is_active }
   * @returns {Promise<any>} - Updated department
   */
  async updateDepartment(id: string, data: { name: string; description: string; is_active: boolean }) {
    const response = await axiosInstance.put(`/v1/departments/${id}`, data);
    return response.data;
  },

  /**
   * Delete department by ID
   * @param {string} id - Department ID
   * @returns {Promise<any>} - Delete response
   */
  async deleteDepartment(id: string) {
    const response = await axiosInstance.delete(`/v1/departments/${id}`);
    return response.data;
  },
};
