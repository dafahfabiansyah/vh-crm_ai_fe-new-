"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, MessageCircle, X, Loader2, User, Bot } from 'lucide-react'
import { WebchatService, type WebchatRequest } from "@/services/webchatService"
// import { ChatLogsService } from "@/services/chatLogsService"

interface WebchatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: string
}

interface WebchatWidgetProps {
  agentId: string
  isOpen?: boolean
  onToggle?: () => void
  className?: string
  askForCustomerInfo?: boolean
}

export function WebchatWidget({ agentId, isOpen = false, onToggle, className, askForCustomerInfo = false }: WebchatWidgetProps) {
  const [messages, setMessages] = useState<WebchatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [contactId, setContactId] = useState<string | undefined>()
  const [userName, setUserName] = useState("")
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history when contact is established
  useEffect(() => {
    if (contactId && hasStartedChat) {
      loadChatHistory()
    }
  }, [contactId, hasStartedChat])

  const loadChatHistory = async () => {
    if (!contactId) return
    
    try {
      const chatLogs = await WebchatService.getChatHistory(contactId)
      const formattedMessages: WebchatMessage[] = chatLogs.map((log: any) => ({
        id: log.id,
        content: log.message,
        sender: log.from_me ? "ai" : "user",
        timestamp: log.sent_at
      }))
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: WebchatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const request: WebchatRequest = {
        message: inputMessage,
        name: userName || undefined,
        agentId: agentId,
        sessionId: sessionId
      }

      const response = await WebchatService.processWebchatMessage(request)
      
      if (response.success) {
        if (response.sessionId) {
          setSessionId(response.sessionId)
        }
        if (response.contactId) {
          setContactId(response.contactId)
        }
        
        // The AI response will be logged automatically by the service
        // We need to reload chat history to get the latest messages
        if (response.contactId) {
          setTimeout(() => {
            loadChatHistory()
          }, 1000) // Small delay to ensure backend processing is complete
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      
      // Add error message to chat
      const errorMessage: WebchatMessage = {
        id: `error-${Date.now()}`,
        content: "Sorry, I'm having trouble processing your message. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = async () => {
    if (askForCustomerInfo && !userName.trim()) {
      alert('Please enter your name to start the chat')
      return
    }
    
    setIsInitializing(true)
    setHasStartedChat(true)
    
    // Send initial greeting message
    const greetingMessage = askForCustomerInfo ? `Hello! My name is ${userName}.` : "Hello! I'd like to start a chat."
    
    const userMessage: WebchatMessage = {
      id: `user-${Date.now()}`,
      content: greetingMessage,
      sender: "user",
      timestamp: new Date().toISOString()
    }

    setMessages([userMessage])
    
    try {
      const request: WebchatRequest = {
        message: greetingMessage,
        name: askForCustomerInfo ? userName : undefined,
        agentId: agentId
      }

      const response = await WebchatService.processWebchatMessage(request)
      
      if (response.success) {
        if (response.sessionId) {
          setSessionId(response.sessionId)
        }
        if (response.contactId) {
          setContactId(response.contactId)
        }
        
        // Load chat history to get welcome message and any AI responses
        if (response.contactId) {
          setTimeout(() => {
            loadChatHistory()
          }, 1500) // Longer delay for initial setup
        }
      }
    } catch (error: any) {
      console.error('Error starting chat:', error)
      
      const errorMessage: WebchatMessage = {
        id: `error-${Date.now()}`,
        content: "Sorry, I'm having trouble starting the chat. Please try again.",
        sender: "ai",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
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
    <Card className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[700px] shadow-xl border-green-200 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50 border-b border-green-200">
        <CardTitle className="text-xl font-semibold text-green-800">Chat Support</CardTitle>
        <Button variant="ghost" size="icon" onClick={onToggle} className="hover:bg-green-100">
          <X className="h-5 w-5 text-green-600" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex flex-col h-[620px] p-6">
        {!hasStartedChat ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-green-800">Welcome to Our Live Chat</h3>
              <p className="text-base text-green-600">
                Live chat widget for website visitors
              </p>
              <p className="text-sm text-muted-foreground">
                {askForCustomerInfo 
                  ? "Please enter your name to start chatting with our AI assistant."
                  : "Click the button below to start chatting with our AI assistant."
                }
              </p>
            </div>
            
            <div className="w-full space-y-3">
              {askForCustomerInfo && (
                <Input
                  placeholder="Enter your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isInitializing}
                />
              )}
              <Button 
                onClick={handleStartChat} 
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                disabled={(askForCustomerInfo && !userName.trim()) || isInitializing}
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
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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
            
            {sessionId && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Session: {sessionId.slice(-8)}
                </Badge>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default WebchatWidget