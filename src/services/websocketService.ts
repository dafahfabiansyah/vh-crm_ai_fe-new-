export interface ContactUpdateMessage {
  type: 'contact_update'
  data: {
    contact_id: string
    last_message: string
    last_message_at: string
    lead_status: 'unassigned' | 'assigned' | 'resolved'
    agent_name?: string
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

export interface PingMessage {
  type: 'ping'
}

export interface PongMessage {
  type: 'pong'
}

export type WebSocketMessage = ContactUpdateMessage | ChatlogUpdateMessage | PongMessage
export type ClientMessage = SubscribeMessage | UnsubscribeMessage | PingMessage

export class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()
  private currentContactId: string | null = null
  private subscriptionRetryAttempts = 0
  private maxSubscriptionRetries = 3
  private subscriptionVerifyInterval: NodeJS.Timeout | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null
  private lastPingTime: number = 0
  private pingTimeout: NodeJS.Timeout | null = null

  constructor() {
    this.url = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/v1/ws'
    
    // Check if WebSocket server is available in development
    if (import.meta.env.DEV) {
      console.log('WebSocket URL configured:', this.url)
      console.log('Note: WebSocket server may not be available in development mode')
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Attempting to connect to WebSocket:', this.url)
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully')
          this.reconnectAttempts = 0
          this.listeners.get('connect')?.forEach(callback => callback({ type: 'connect' } as any))
          
          // Start health monitoring
          this.startHealthCheck()
          
          // Re-subscribe to contact if we were previously subscribed
          if (this.currentContactId) {
            console.log('Re-subscribing to contact after reconnection:', this.currentContactId)
            const message: SubscribeMessage = {
              type: 'subscribe_contact',
              contact_id: this.currentContactId
            }
            this.ws?.send(JSON.stringify(message))
            this.startSubscriptionVerification()
          }
          
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            console.log('Raw WebSocket message received:', event.data)
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          this.listeners.get('disconnect')?.forEach(callback => callback({ type: 'disconnect' } as any))
          
          // Only attempt reconnection if it wasn't a manual disconnect
          if (event.code !== 1000) {
            this.handleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket connection error:', error)
          this.listeners.get('error')?.forEach(callback => callback({ type: 'error', error } as any))
          
          // Don't reject immediately, let reconnection logic handle it
          if (this.reconnectAttempts === 0) {
            reject(error)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleMessage(message: WebSocketMessage) {
    // Handle pong responses
    if (message.type === 'pong') {
      this.handlePong()
      return
    }

    // Debug logging for message handling
    console.log('WebSocket message received:', message.type, message)
    
    const typeListeners = this.listeners.get(message.type)
    if (typeListeners) {
      console.log(`Notifying ${typeListeners.size} listeners for type: ${message.type}`)
      typeListeners.forEach(listener => listener(message))
    } else {
      console.log(`No listeners found for message type: ${message.type}`)
    }

    // Also notify 'all' listeners
    const allListeners = this.listeners.get('all')
    if (allListeners) {
      console.log(`Notifying ${allListeners.size} 'all' listeners`)
      allListeners.forEach(listener => listener(message))
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      console.log(`Attempting to reconnect in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error)
          // Only continue reconnecting if we haven't reached max attempts
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.handleReconnect()
          } else {
            console.error('Max reconnection attempts reached. WebSocket service unavailable.')
            this.listeners.get('error')?.forEach(callback => 
              callback({ type: 'error', error: new Error('WebSocket service unavailable') } as any)
            )
          }
        })
      }, delay)
    } else {
      console.error('Max reconnection attempts reached. WebSocket service unavailable.')
      this.listeners.get('error')?.forEach(callback => 
        callback({ type: 'error', error: new Error('WebSocket service unavailable') } as any)
      )
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
      this.subscriptionRetryAttempts = 0
      console.log('Subscribed to contact:', contactId)
      
      // Start subscription verification
      this.startSubscriptionVerification()
    } else {
      console.warn('WebSocket not connected, cannot subscribe to contact')
      // Store the contact ID for later subscription when connection is available
      this.currentContactId = contactId
      
      // Only retry if we haven't exceeded reconnection attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.retrySubscription(contactId)
      } else {
        console.warn('WebSocket service unavailable, subscription will be attempted when connection is restored')
      }
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
    
    // Clear subscription verification
    this.stopSubscriptionVerification()
  }

  private startSubscriptionVerification() {
    this.stopSubscriptionVerification()
    
    // Verify subscription every 30 seconds
    this.subscriptionVerifyInterval = setInterval(() => {
      if (this.currentContactId && this.ws?.readyState === WebSocket.OPEN) {
        console.log('Verifying subscription for contact:', this.currentContactId)
        // Re-send subscription to ensure it's still active
        const message: SubscribeMessage = {
          type: 'subscribe_contact',
          contact_id: this.currentContactId
        }
        this.ws.send(JSON.stringify(message))
      }
    }, 30000)
  }

  private stopSubscriptionVerification() {
    if (this.subscriptionVerifyInterval) {
      clearInterval(this.subscriptionVerifyInterval)
      this.subscriptionVerifyInterval = null
    }
  }

  private retrySubscription(contactId: string) {
    if (this.subscriptionRetryAttempts < this.maxSubscriptionRetries) {
      this.subscriptionRetryAttempts++
      console.log(`Retrying subscription to contact ${contactId} (${this.subscriptionRetryAttempts}/${this.maxSubscriptionRetries})`)
      
      setTimeout(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.subscribeToContact(contactId)
        } else {
          this.retrySubscription(contactId)
        }
      }, 1000 * this.subscriptionRetryAttempts)
    } else {
       console.error('Max subscription retry attempts reached for contact:', contactId)
     }
   }

  private startHealthCheck() {
    this.stopHealthCheck()
    
    // Send ping every 45 seconds to keep connection alive
    this.healthCheckInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendPing()
      }
    }, 45000)
  }

  private stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
      this.pingTimeout = null
    }
  }

  private sendPing() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.lastPingTime = Date.now()
      this.ws.send(JSON.stringify({ type: 'ping' }))
      
      // Set timeout for pong response
      this.pingTimeout = setTimeout(() => {
        console.warn('Ping timeout - connection may be stale')
        // Force reconnection if ping times out
        this.ws?.close()
      }, 10000) // 10 second timeout
    }
  }

  private handlePong() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout)
      this.pingTimeout = null
    }
    const latency = Date.now() - this.lastPingTime
    console.log(`WebSocket ping latency: ${latency}ms`)
  }

  addListener(type: string, callback: (message: WebSocketMessage) => void) {
     if (!this.listeners.has(type)) {
       this.listeners.set(type, new Set())
     }
     this.listeners.get(type)!.add(callback)
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
    
    // Stop health monitoring
    this.stopHealthCheck()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.listeners.clear()
    this.currentContactId = null
    this.reconnectAttempts = 0
    this.subscriptionRetryAttempts = 0
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Test function to simulate receiving a chatlog update (for debugging)
  simulateChatlogUpdate(contactId: string, message: string) {
    if (import.meta.env.DEV) {
      const testMessage: ChatlogUpdateMessage = {
        type: 'chatlog_update',
        data: {
          id: `test-${Date.now()}`,
          contact_id: contactId,
          message: message,
          type: 'text',
          from_me: false,
          sent_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      }
      console.log('Simulating chatlog update:', testMessage)
      this.handleMessage(testMessage)
    }
  }
}

// Singleton instance
export const websocketService = new WebSocketService()

// Expose for debugging in development
if (import.meta.env.DEV) {
  (window as any).websocketService = websocketService
}