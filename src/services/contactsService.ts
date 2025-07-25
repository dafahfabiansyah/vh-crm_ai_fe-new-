import axiosInstance from './axios';

export interface Contact {
    id: string;
    id_platform: string;
    contact_identifier: string;
    push_name: string;
    last_message: string;
    last_message_at: string;
    unread_messages: number;
    created_at: string;
    updated_at: string;
    lead_status: 'assigned' | 'unassigned' | 'resolved';
    assigned_agent_name: string | null;
    agent_name?: string;
    platform_name: string | null;
    source_type: string | null;
    platform_inbox_id: string | null;
}

export interface ContactsResponse {
    page: number;
    per_page: number;
    page_count: number;
    total_count: number;
    items: Contact[];
}

export class ContactsService {
    private static readonly BASE_PATH = '/v1/contacts';

    static async getContacts(page: number = 1, perPage: number = 100): Promise<ContactsResponse> {
        try {
            const response = await axiosInstance.get<ContactsResponse>(
                `${this.BASE_PATH}?page=${page}&per_page=${perPage}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching contacts:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
        }
    }

    static async getContactById(id: string): Promise<Contact> {
        try {
            const response = await axiosInstance.get<Contact>(`${this.BASE_PATH}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching contact:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch contact');
        }
    }

    static async takeoverConversation(contactId: string): Promise<void> {
        try {
            await axiosInstance.post(`/v1/leads/conversation-control/${contactId}`, {
                action: 'assign'
            });
        } catch (error: any) {
            console.error('Error taking over conversation:', error);
            throw new Error(error.response?.data?.message || 'Failed to takeover conversation');
        }
    }

    static async resolveConversation(contactId: string): Promise<void> {
        try {
            await axiosInstance.post(`/v1/leads/conversation-control/${contactId}`, {
                action: 'resolve'
            });
        } catch (error: any) {
            console.error('Error resolving conversation:', error);
            throw new Error(error.response?.data?.message || 'Failed to resolve conversation');
        }
    }

    static async sendMessage(session: string, number: string, message: string): Promise<void> {
        try {
            const whatsappUrl = import.meta.env.VITE_API_WHATSAPP_URL;
            if (!whatsappUrl) {
                throw new Error('WhatsApp API URL not configured');
            }

            await axiosInstance.post(`${whatsappUrl}/send-message`, {
                session,
                number,
                message
            });
        } catch (error: any) {
            console.error('Error sending message:', error);
            throw new Error(error.response?.data?.message || 'Failed to send message');
        }
    }

    static async createContact(contactData: any): Promise<any> {
        try {
            const response = await axiosInstance.post(`${this.BASE_PATH}`, contactData);
            return response.data;
        } catch (error: any) {
            console.error('Error creating contact:', error);
            throw new Error(error.response?.data?.message || 'Failed to create contact');
        }
    }
}