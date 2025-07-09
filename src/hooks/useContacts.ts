import { useState, useEffect, useCallback } from 'react';
import { ContactsService, type Contact, type ContactsResponse } from '@/services';
import { useWebSocket } from './useWebSocket';
import { type ContactUpdateMessage } from '@/services/websocketService';

export interface UseContactsReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  assignedCount: number;
  unassignedCount: number;
  resolvedCount: number;
  refetch: () => Promise<void>;
}

export function useContacts(page: number = 1, perPage: number = 100): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);

  // Handle real-time contact updates
  const handleContactUpdate = useCallback((message: ContactUpdateMessage) => {
    const { contact_id, last_message, last_message_at, lead_status } = message.data;
    
    setContacts(prevContacts => {
      const updatedContacts = prevContacts.map(contact => {
        if (contact.id === contact_id) {
          return {
            ...contact,
            last_message,
            last_message_at,
            lead_status
          };
        }
        return contact;
      });
      
      // Recalculate counts
      const assigned = updatedContacts.filter(contact => contact.lead_status === 'assigned').length;
      const unassigned = updatedContacts.filter(contact => contact.lead_status === 'unassigned').length;
      const resolved = updatedContacts.filter(contact => contact.lead_status === 'resolved').length;
      
      setAssignedCount(assigned);
      setUnassignedCount(unassigned);
      setResolvedCount(resolved);
      
      return updatedContacts;
    });
  }, []);

  // Initialize WebSocket connection
  useWebSocket({
    onContactUpdate: handleContactUpdate,
    onConnect: () => console.log('WebSocket connected for contacts'),
    onError: (error) => console.error('WebSocket error in contacts:', error)
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ContactsResponse = await ContactsService.getContacts(page, perPage);

      setContacts(response.items);
      setTotalCount(response.total_count);

      // Calculate counts for each status
      const assigned = response.items.filter(contact => contact.lead_status === 'assigned').length;
      const unassigned = response.items.filter(contact => contact.lead_status === 'unassigned').length;
      const resolved = response.items.filter(contact => contact.lead_status === 'resolved').length;

      setAssignedCount(assigned);
      setUnassignedCount(unassigned);
      setResolvedCount(resolved);

    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, perPage]);

  return {
    contacts,
    loading,
    error,
    totalCount,
    assignedCount,
    unassignedCount,
    resolvedCount,
    refetch: fetchContacts,
  };
}