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
}