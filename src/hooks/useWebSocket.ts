import { useEffect, useCallback, useRef } from 'react'
import { websocketService, type WebSocketMessage, type ContactUpdateMessage, type ChatlogUpdateMessage } from '@/services/websocketService'

export interface UseWebSocketOptions {
  onContactUpdate?: (message: ContactUpdateMessage) => void
  onChatlogUpdate?: (message: ChatlogUpdateMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onContactUpdate,
    onChatlogUpdate,
    onConnect,
    onDisconnect,
    onError
  } = options

  const isConnectedRef = useRef(false)
  const listenersRef = useRef<{
    contactUpdate?: (message: WebSocketMessage) => void
    chatlogUpdate?: (message: WebSocketMessage) => void
  }>({})

  // Initialize WebSocket connection
  const connect = useCallback(async () => {
    if (isConnectedRef.current) {
      return
    }

    try {
      await websocketService.connect()
      isConnectedRef.current = true
      onConnect?.()
    } catch (error) {
      console.warn('WebSocket connection failed, will retry automatically:', error)
      // Don't call onError for initial connection failures as reconnection will be handled automatically
      // onError?.(error as Event)
    }
  }, [onConnect])

  // Subscribe to a specific contact for chatlog updates
  const subscribeToContact = useCallback((contactId: string) => {
    websocketService.subscribeToContact(contactId)
  }, [])

  // Unsubscribe from current contact
  const unsubscribeFromContact = useCallback(() => {
    websocketService.unsubscribeFromContact()
  }, [])

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect()
    isConnectedRef.current = false
    onDisconnect?.()
  }, [onDisconnect])

  // Check if WebSocket is connected
  const isConnected = useCallback(() => {
    return websocketService.isConnected()
  }, [])

  useEffect(() => {
    // Set up contact update listener
    if (onContactUpdate) {
      const contactListener = (message: WebSocketMessage) => {
        if (message.type === 'contact_update') {
          onContactUpdate(message as ContactUpdateMessage)
        }
      }
      listenersRef.current.contactUpdate = contactListener
      websocketService.addListener('contact_update', contactListener)
    }

    // Set up chatlog update listener
    if (onChatlogUpdate) {
      const chatlogListener = (message: WebSocketMessage) => {
        if (message.type === 'chatlog_update') {
          onChatlogUpdate(message as ChatlogUpdateMessage)
        }
      }
      listenersRef.current.chatlogUpdate = chatlogListener
      websocketService.addListener('chatlog_update', chatlogListener)
    }

    // Auto-connect when hook is used
    connect()

    // Cleanup function
    return () => {
      if (listenersRef.current.contactUpdate) {
        websocketService.removeListener('contact_update', listenersRef.current.contactUpdate)
      }
      if (listenersRef.current.chatlogUpdate) {
        websocketService.removeListener('chatlog_update', listenersRef.current.chatlogUpdate)
      }
    }
  }, [onContactUpdate, onChatlogUpdate, connect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect here as other components might be using the same connection
      // The service handles connection management globally
    }
  }, [])

  return {
    connect,
    disconnect,
    subscribeToContact,
    unsubscribeFromContact,
    isConnected
  }
}