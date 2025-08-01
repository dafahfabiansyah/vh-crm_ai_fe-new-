"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Send, MessageCircle, Loader2, User, Bot } from 'lucide-react'
import WebchatService, { type WebchatRequest } from "@/services/webchatservice"
import { useWebSocket } from "@/hooks/useWebSocket"
import { type ChatlogUpdateMessage } from "@/services/websocketService"
// import { ChatLogsService } from "@/services/chatLogsService"

interface WebchatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
}

interface WebchatWidgetProps {
  agentId: string
  containerId?: string
  platformId?: string
  isOpen?: boolean
  onToggle?: () => void
  className?: string
  askForCustomerInfo?: boolean
  authToken?: string
}

export function WebchatWidget({ agentId, containerId, platformId, isOpen = false, onToggle, className, askForCustomerInfo = false, authToken }: WebchatWidgetProps) {
  const [messages, setMessages] = useState<WebchatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [contactId, setContactId] = useState<string | undefined>()
  const [userName, setUserName] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [leadName, setLeadName] = useState<string | null>(null)
  const [dynamicConfig, setDynamicConfig] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Helper function to get dynamic color classes
  const getDynamicColorClasses = () => {
    if (!dynamicConfig?.primaryColor) {
      return {
        bg: 'bg-green-600',
        bgHover: 'hover:bg-green-700',
        bgLight: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        textDark: 'text-green-800'
      }
    }
    
    // Convert hex color to Tailwind-like classes (simplified approach)
    const color = dynamicConfig.primaryColor
    return {
      bg: `bg-[${color}]`,
      bgHover: `hover:bg-[${color}]/90`,
      bgLight: `bg-[${color}]/10`,
      border: `border-[${color}]/30`,
      text: `text-[${color}]`,
      textDark: `text-[${color}]/90`
    }
  }

  const colorClasses = getDynamicColorClasses()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle real-time chatlog updates via WebSocket
  const handleChatlogUpdate = (message: ChatlogUpdateMessage) => {
    const messageData = message.data
    
    // Only update if the message is for the current contact
    if (!contactId || messageData.contact_id !== contactId) {
      return
    }

    // Transform WebSocket message data to WebchatMessage format
    const newMessage: WebchatMessage = {
      id: messageData.id,
      content: messageData.message,
      sender: messageData.from_me ? "ai" : "user", // from_me=false means customer/user side
      timestamp: messageData.sent_at
    }

    setMessages(prevMessages => {
      // Check if this message already exists (avoid duplicates)
      const existingIndex = prevMessages.findIndex(msg => msg.id === newMessage.id)
      
      if (existingIndex >= 0) {
        // Update existing message
        const updatedMessages = [...prevMessages]
        updatedMessages[existingIndex] = newMessage
        return updatedMessages
      } else {
        // Add new message
        return [...prevMessages, newMessage]
      }
    })
  }

  // Initialize WebSocket connection
  const { subscribeToContact, unsubscribeFromContact } = useWebSocket({
    onChatlogUpdate: handleChatlogUpdate,
    onConnect: () => console.log('WebSocket connected for webchat'),
    onError: (error) => console.error('WebSocket error in webchat:', error)
  })

  // Initialize webchat session from cookies on component mount
  useEffect(() => {
    const initializeSession = async () => {
      // Check if we have existing contact/lead in cookies
      try {
        const existingContactId = WebchatService.getExistingContactId() || null
        const existingLeadName = WebchatService.getOrCreateLeadName() || null
        const sessionInfo = WebchatService.getSessionInfo()
        
        // Initialize sessionId from cookies if available
        if (sessionInfo.sessionId) {
          console.log('🔄 Initializing with existing sessionId from cookies:', sessionInfo.sessionId)
          setSessionId(sessionInfo.sessionId)
        } else {
          console.log('🆕 No existing sessionId found in cookies')
        }
        
        if (existingContactId && existingLeadName) {
          setContactId(existingContactId)
          setLeadName(existingLeadName)
          setHasStartedChat(true)
          // Load chat history for existing session
          await loadChatHistory()
        }
      } catch (error) {
        console.warn('Error initializing webchat session:', error)
      }
    }
    
    initializeSession()
  }, [])

  // Load chat history and subscribe to WebSocket when contact is established
  useEffect(() => {
    const loadHistory = async () => {
      if (contactId && hasStartedChat) {
        await loadChatHistory()
        // Subscribe to WebSocket updates for this contact
        subscribeToContact(contactId)
      }
    }
    loadHistory()
    
    // Cleanup: unsubscribe when contact changes or component unmounts
    return () => {
      if (contactId) {
        unsubscribeFromContact()
      }
    }
  }, [contactId, hasStartedChat, subscribeToContact, unsubscribeFromContact])

  // Listen for dynamic configuration updates
  useEffect(() => {
    // Load initial configuration from localStorage
    const loadStoredConfig = () => {
      try {
        const storedConfig = localStorage.getItem('webchat_config')
        if (storedConfig) {
          setDynamicConfig(JSON.parse(storedConfig))
        }
      } catch (error) {
        console.warn('Error loading stored webchat config:', error)
      }
    }

    // Load initial config
    loadStoredConfig()

    // Listen for configuration updates
    const handleConfigUpdate = (event: CustomEvent) => {
      setDynamicConfig(event.detail)
    }

    window.addEventListener('webchatConfigUpdated', handleConfigUpdate as EventListener)

    return () => {
      window.removeEventListener('webchatConfigUpdated', handleConfigUpdate as EventListener)
    }
  }, [])

  const loadChatHistory = async () => {
    if (!contactId || !authToken) return
    
    try {
      // Use the ChatLogsService to get chat history by contact ID
      const { ChatLogsService } = await import('@/services')
      const response = await ChatLogsService.getChatLogsByContactId(contactId)
      const formattedMessages: WebchatMessage[] = response.chatlogs.map((log: any) => ({
         id: log.id,
         content: log.message,
         sender: log.from_me ? "ai" : "user", // from_me=false means customer/user side
         timestamp: log.sent_at
       }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading chat history:', error)
      // Fallback to empty messages if chat history fails
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const messageToSend = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      console.log('=== WEBCHAT WIDGET DEBUG START ===');
      console.log('WebchatWidget: containerId prop:', containerId);
      console.log('WebchatWidget: platformId prop:', platformId);
      console.log('WebchatWidget: agentId prop:', agentId);
      console.log('=== WEBCHAT WIDGET DEBUG END ===');
      
      const request: WebchatRequest = {
        message: messageToSend,
        name: userName || undefined,
        agentId: agentId,
        sessionId: sessionId,
        containerId: containerId,
        platformId: platformId,
        phone: userPhone || undefined
      }

      const response = await WebchatService.processWebchatMessage(request, authToken)
      
      if (response.success) {
        if (response.sessionId) {
          setSessionId(response.sessionId)
        }
        if (response.contactId) {
          setContactId(response.contactId)
        }
        
        // The AI response will be received via WebSocket automatically
        // No need to reload chat history as WebSocket will handle real-time updates
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      // Error handling - WebSocket will handle message display
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = async () => {
    if (askForCustomerInfo && (!userName.trim() || !userPhone.trim())) {
      alert('Please enter your name and phone number to start the chat')
      return
    }
    
    setIsInitializing(true)
    setHasStartedChat(true)
    
    // Send initial greeting message
    const greetingMessage = askForCustomerInfo ? `Hello! My name is ${userName}.` : "Hello! I'd like to start a chat."
    
    try {
      console.log('=== WEBCHAT WIDGET START CHAT DEBUG START ===');
      console.log('WebchatWidget (start chat): containerId prop:', containerId);
      console.log('WebchatWidget (start chat): platformId prop:', platformId);
      console.log('WebchatWidget (start chat): agentId prop:', agentId);
      console.log('WebchatWidget (start chat): sessionId state:', sessionId);
      console.log('=== WEBCHAT WIDGET START CHAT DEBUG END ===');
      
      const request: WebchatRequest = {
        message: greetingMessage,
        name: askForCustomerInfo ? userName : undefined,
        agentId: agentId,
        sessionId: sessionId, // Include existing sessionId if available
        containerId: containerId,
        platformId: platformId,
        phone: askForCustomerInfo ? userPhone : undefined
      }

      const response = await WebchatService.processWebchatMessage(request, authToken)
      
      if (response.success) {
        if (response.sessionId) {
          setSessionId(response.sessionId)
        }
        if (response.contactId) {
          setContactId(response.contactId)
        }
        
        // Load initial chat history and subscribe to WebSocket updates
        if (response.contactId) {
          setTimeout(async () => {
            await loadChatHistory()
            subscribeToContact(response.contactId!)
          }, 1500) // Longer delay for initial setup
        }
      }
    } catch (error: any) {
      console.error('Error starting chat:', error)
      // Error handling - WebSocket will handle message display
    } finally {
      setIsInitializing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (hasStartedChat) {
        handleSendMessage()
      } else {
        handleStartChat()
      }
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full shadow-lg bg-green-600 hover:bg-green-700 ${className}`}
        size="icon"
      >
        <MessageCircle className="h-8 w-8" />
      </Button>
    )
  }

  return (
    <Card className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[700px] shadow-xl ${colorClasses.border} ${className}`}>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${colorClasses.bgLight} border-b ${colorClasses.border}`}>
          <CardTitle className={`text-xl font-semibold ${colorClasses.textDark}`}>Chat Support</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[620px] p-6">
        {!hasStartedChat ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 ${colorClasses.bgLight} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <MessageCircle className={`h-10 w-10 ${colorClasses.text}`} />
              </div>
              <h3 className={`text-2xl font-semibold ${colorClasses.textDark}`}>Welcome to Our Live Chat</h3>
              <p className={`text-base ${colorClasses.text}`}>
                {dynamicConfig?.welcomeMessage || 'Live chat widget for website visitors'}
              </p>
              <p className="text-sm text-muted-foreground">
                {askForCustomerInfo 
                  ? "Please enter your name and phone number to start chatting with our AI assistant."
                  : "Click the button below to start chatting with our AI assistant."
                }
              </p>
            </div>
            
            <div className="w-full space-y-3">
              {askForCustomerInfo && (
                <>
                  <Input
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isInitializing}
                  />
                  <Input
                    placeholder="Enter your phone number..."
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isInitializing}
                  />
                </>
              )}
              <Button 
                onClick={handleStartChat} 
                className={`w-full ${colorClasses.bg} ${colorClasses.bgHover} text-white py-3 text-lg`}
                disabled={(askForCustomerInfo && (!userName.trim() || !userPhone.trim())) || isInitializing}
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting Chat...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Start Chat
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[480px] min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.sender === "user"
                        ? "bg-green-600 text-white"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-2 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            

          </>
        )}
      </CardContent>
    </Card>
  )
}

// Static init method for embedding the widget
WebchatWidget.init = function(config: {
  containerId: string;
  agentId: string;
  apiUrl?: string;
  config?: {
    primaryColor?: string;
    welcomeMessage?: string;
    placeholderText?: string;
    position?: string;
    showAgentAvatar?: boolean;
    allowFileUpload?: boolean;
    askForCustomerInfo?: boolean;
  };
}) {
  // This would be implemented for standalone widget embedding
  // For now, this is a placeholder for the embed code functionality
  console.log('WebchatWidget.init called with config:', config);
  
  // Extract platform ID from container ID (simple implementation)
  const platformId = config.containerId || 'webchat';
  
  // In a real implementation, this would render the React component
  // into the specified container with the extracted platformId
  console.log('Extracted platform ID:', platformId);
};

export default WebchatWidget