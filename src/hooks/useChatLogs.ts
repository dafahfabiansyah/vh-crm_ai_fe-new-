import { useState, useEffect, useCallback } from 'react';
import { ChatLogsService, type ChatLog } from '@/services';
import { useWebSocket } from './useWebSocket';
import { type ChatlogUpdateMessage } from '@/services/websocketService';

export const useChatLogs = (contactId: string | null) => {
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle real-time chatlog updates
  const handleChatlogUpdate = useCallback((message: ChatlogUpdateMessage) => {
    const messageData = message.data;
    
    // Transform WebSocket message data to ChatLog format
    const newChatLog: ChatLog = {
      id: messageData.id,
      id_contact: messageData.contact_id, // Map contact_id to id_contact
      message: messageData.message,
      type: messageData.type,
      media: messageData.media || '',
      from_me: messageData.from_me,
      sent_at: messageData.sent_at
    };
    
    setChatLogs(prevChatLogs => {
      // Check if this chatlog already exists (avoid duplicates)
      const existingIndex = prevChatLogs.findIndex(log => log.id === newChatLog.id);
      
      if (existingIndex >= 0) {
        // Update existing chatlog
        const updatedChatLogs = [...prevChatLogs];
        updatedChatLogs[existingIndex] = newChatLog;
        return updatedChatLogs;
      } else {
        // Add new chatlog
        return [...prevChatLogs, newChatLog];
      }
    });
  }, []);

  // Initialize WebSocket connection
  const { subscribeToContact, unsubscribeFromContact } = useWebSocket({
    onChatlogUpdate: handleChatlogUpdate,
    onConnect: () => console.log('WebSocket connected for chatlogs'),
    onError: (error) => console.error('WebSocket error in chatlogs:', error)
  });

  useEffect(() => {
    if (!contactId) {
      setChatLogs([]);
      setLoading(false);
      setError(null);
      // Unsubscribe from any previous contact
      unsubscribeFromContact();
      return;
    }

    const fetchChatLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ChatLogsService.getChatLogsByContactId(contactId);
        setChatLogs(response.chatlogs);
        
        // Subscribe to WebSocket updates for this contact
        subscribeToContact(contactId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chat logs');
        setChatLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatLogs();
  }, [contactId, subscribeToContact, unsubscribeFromContact]);

  // Cleanup: unsubscribe when component unmounts
  useEffect(() => {
    return () => {
      unsubscribeFromContact();
    };
  }, [unsubscribeFromContact]);

  return { chatLogs, loading, error };
};