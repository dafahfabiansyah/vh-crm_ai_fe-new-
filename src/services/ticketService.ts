import axiosInstance from "./axios";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class TicketService {
  static async getTickets(params?: any) {
    return axiosInstance.get("/v1/tickets", { params });
  }

  static async getTicketById(id: string) {
    return axiosInstance.get(`/v1/tickets/${id}`);
  }

  static async createTicket(data: any) {
    return axiosInstance.post("/v1/tickets", data);
  }

  static async updateTicket(id: string, data: any) {
    return axiosInstance.put(`/v1/tickets/${id}`, data);
  }

  static async deleteTicket(id: string) {
    return axiosInstance.delete(`/v1/tickets/${id}`);
  }
} 