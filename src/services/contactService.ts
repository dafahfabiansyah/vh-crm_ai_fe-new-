import axiosInstance from './axios';

export const contactService = {
  async fetchContacts(page = 1, perPage = 100) {
    const response = await axiosInstance.get(`/v1/contacts?page=${page}&per_page=${perPage}`);
    return response.data;
  },
  async createContact(body: { id_platform: string; contact_identifier: string; push_name: string }) {
    const response = await axiosInstance.post('/v1/contacts', body);
    return response.data;
  },
  async deleteContact(id: string) {
    const response = await axiosInstance.delete(`/v1/contacts/${id}`);
    return response.data;
  },
};
