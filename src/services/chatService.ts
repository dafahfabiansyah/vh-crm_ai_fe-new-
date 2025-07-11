import axiosInstance from './axios';

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  id: string;
  agent_id: string;
  session_id: string;
  message: string;
  response: string;
  created_at: string;
  tokens_used: number;
}

export class ChatService {
  /**
   * Send a chat message to an AI agent
   */
  static async sendMessage(agentId: string, message: string, sessionId: string): Promise<ChatResponse> {
    try {
      const requestBody: ChatRequest = {
        message,
        session_id: sessionId
      };

      const response = await axiosInstance.post<ChatResponse>(`/v1/chat/agent/${agentId}`, requestBody);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to send message',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Generate a random session ID
   */
  static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `session-${timestamp}-${randomStr}`;
  }
}
