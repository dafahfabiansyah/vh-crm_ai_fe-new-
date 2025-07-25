import axiosInstance from './axios';

export interface ChatLog {
    id: string;
    id_contact: string;
    message: string;
    type: string;
    media: string;
    from_me: boolean;
    sent_at: string;
}

export interface ChatLogsResponse {
    chatlogs: ChatLog[];
}

export class ChatLogsService {
    private static readonly BASE_URL = '/v1/chatlogs';

    static async getChatLogsByContactId(contactId: string): Promise<ChatLogsResponse> {
        try {
            const response = await axiosInstance.get<ChatLogsResponse>(
                `${this.BASE_URL}/contact/${contactId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching chat logs:', error);
            throw error;
        }
    }
}