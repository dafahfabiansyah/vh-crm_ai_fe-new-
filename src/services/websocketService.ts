export interface ContactUpdateMessage {
  type: 'contact_update'
  data: {
    contact_id: string
    last_message: string
    last_message_at: string
    lead_status: 'unassigned' | 'assigned' | 'resolved'
  }
  timestamp: string
}

export interface ChatlogUpdateMessage {
  type: 'chatlog_update'
  data: {
    id: string
    contact_id: string
    message: string
    type: 'text' | 'image' | 'document'
    media?: string
    from_me: boolean
    sent_at: string
  }
  timestamp: string
}

export interface SubscribeMessage {
  type: 'subscribe_contact'
  contact_id: string
}

export interface UnsubscribeMessage {
  type: 'unsubscribe_contact'
}

export type WebSocketMessage = ContactUpdateMessage | ChatlogUpdateMessage
export type ClientMessage = SubscribeMessage | UnsubscribeMessage

export class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  private currentContactId: string | null = null

  constructor() {
    this.url = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/v1/ws'
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    const typeListeners = this.listeners.get(message.type)
    if (typeListeners) {
      typeListeners.forEach(listener => listener(message))
    }

    // Also notify 'all' listeners
    const allListeners = this.listeners.get('all')
    if (allListeners) {
      allListeners.forEach(listener => listener(message))
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect().then(() => {
          // Re-subscribe to current contact if any
          if (this.currentContactId) {
            this.subscribeToContact(this.currentContactId)
          }
        }).catch(error => {
          console.error('Reconnection failed:', error)
        })
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  subscribeToContact(contactId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Unsubscribe from previous contact if any
      if (this.currentContactId) {
        this.unsubscribeFromContact()
      }

      // Subscribe to new contact
      const message: SubscribeMessage = {
        type: 'subscribe_contact',
        contact_id: contactId
      }
      this.ws.send(JSON.stringify(message))
      this.currentContactId = contactId
      console.log('Subscribed to contact:', contactId)
    } else {
      console.warn('WebSocket not connected, cannot subscribe to contact')
    }
  }

  unsubscribeFromContact() {
    if (this.ws?.readyState === WebSocket.OPEN && this.currentContactId) {
      const message: UnsubscribeMessage = {
        type: 'unsubscribe_contact'
      }
      this.ws.send(JSON.stringify(message))
      console.log('Unsubscribed from contact:', this.currentContactId)
      this.currentContactId = null
    }
  }

  addListener(type: string, listener: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
  }

  removeListener(type: string, listener: (message: WebSocketMessage) => void) {
    const typeListeners = this.listeners.get(type)
    if (typeListeners) {
      typeListeners.delete(listener)
      if (typeListeners.size === 0) {
        this.listeners.delete(type)
      }
    }
  }

  disconnect() {
    if (this.currentContactId) {
      this.unsubscribeFromContact()
    }
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.listeners.clear()
    this.currentContactId = null
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
export const websocketService = new WebSocketService()