import { useState, useEffect, useCallback } from 'react';
import { ChatLogsService, type ChatLog } from '@/services';
import { useWebSocket } from './useWebSocket';
import { type ChatlogUpdateMessage } from '@/services/websocketService';

export const useChatLogs = (contactId: string | null) => {
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContactId, setCurrentContactId] = useState<string | null>(null);
  const [subscriptionPending, setSubscriptionPending] = useState(false);

  // Handle real-time chatlog updates
  const handleChatlogUpdate = useCallback((message: ChatlogUpdateMessage) => {
    console.log('useChatLogs: Received chatlog update:', message);
    console.log('useChatLogs: Current contact ID:', currentContactId);
    
    const messageData = message.data;

    // Only update if the message is for the current contactId
    // Use currentContactId state to avoid race conditions
    if (!currentContactId || messageData.contact_id !== currentContactId) {
      console.log('useChatLogs: Ignoring message - contact ID mismatch or no current contact');
      console.log('useChatLogs: Message contact_id:', messageData.contact_id, 'Current contact_id:', currentContactId);
      return;
    }

    console.log('useChatLogs: Processing chatlog update for contact:', currentContactId);

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

    console.log('useChatLogs: New chatlog created:', newChatLog);

    setChatLogs(prevChatLogs => {
      console.log('useChatLogs: Current chatLogs count:', prevChatLogs.length);
      
      // Check if this chatlog already exists (avoid duplicates)
      const existingIndex = prevChatLogs.findIndex(log => log.id === newChatLog.id);

      if (existingIndex >= 0) {
        console.log('useChatLogs: Updating existing chatlog at index:', existingIndex);
        // Update existing chatlog
        const updatedChatLogs = [...prevChatLogs];
        updatedChatLogs[existingIndex] = newChatLog;
        return updatedChatLogs;
      } else {
        console.log('useChatLogs: Adding new chatlog');
        // Add new chatlog
        const updatedChatLogs = [...prevChatLogs, newChatLog];
        console.log('useChatLogs: Updated chatLogs count:', updatedChatLogs.length);
        return updatedChatLogs;
      }
    });
  }, [currentContactId]);

  // Initialize WebSocket connection
  const { subscribeToContact, unsubscribeFromContact } = useWebSocket({
    onChatlogUpdate: handleChatlogUpdate,
    onConnect: () => {
      console.log('WebSocket connected for chatlogs');
      // Re-subscribe if we have a pending subscription
      if (subscriptionPending && currentContactId) {
        console.log('Re-subscribing to contact after connection:', currentContactId);
        subscribeToContact(currentContactId);
        setSubscriptionPending(false);
      }
    },
    onError: (error) => {
      console.error('WebSocket error in chatlogs:', error);
      setError('WebSocket connection error');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected for chatlogs');
      // Mark subscription as pending if we were subscribed
      if (currentContactId) {
        setSubscriptionPending(true);
      }
    }
  });

  useEffect(() => {
    // Handle contact ID changes
    if (contactId !== currentContactId) {
      // Unsubscribe from previous contact if any
      if (currentContactId) {
        unsubscribeFromContact();
        setSubscriptionPending(false);
      }
      
      // Update current contact ID
      setCurrentContactId(contactId);
    }

    if (!contactId) {
      setChatLogs([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchChatLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ChatLogsService.getChatLogsByContactId(contactId);
        setChatLogs(response.chatlogs);

        // Subscribe to WebSocket updates for this contact
        try {
          subscribeToContact(contactId);
          setSubscriptionPending(false);
        } catch (subscriptionError) {
          console.warn('Failed to subscribe to contact, marking as pending:', subscriptionError);
          setSubscriptionPending(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chat logs');
        setChatLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatLogs();
  }, [contactId, currentContactId, subscribeToContact, unsubscribeFromContact]);

  // Cleanup: unsubscribe when component unmounts
  useEffect(() => {
    return () => {
      unsubscribeFromContact();
    };
  }, [unsubscribeFromContact]);

  return { chatLogs, loading, error };
};