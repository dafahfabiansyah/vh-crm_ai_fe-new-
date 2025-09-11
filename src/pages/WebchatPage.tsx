"use client";
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MoreHorizontal, User, RotateCw, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface IntegrationExecution {
  integration_name: string
  success: boolean
  response_body: string | object | null
  error_message?: string
  parsed_response?: any
}

interface Message {
  id: string
  content: string
  sender: "user" | "ai" | "system"
  timestamp: string
  tokens_used: number
  integrationExecutions?: IntegrationExecution[]
}

interface AIAgentChatPreviewProps {
  agentId?: string
  agentName?: string
  welcomeMessage?: string
  className?: string
}

// Dummy data
const DUMMY_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    content: "Hello! I'm your AI assistant. How can I help you today?",
    sender: "ai",
    timestamp: new Date().toISOString(),
    tokens_used: 25
  }
];

const DUMMY_RESPONSES = [
  "That's a great question! Let me help you with that.",
  "I understand what you're looking for. Here's my response to your query.",
  "Thanks for asking! Based on what you've shared, I'd recommend the following approach.",
  "Interesting point! Here's how I would tackle this problem.",
  "I can definitely help you with that. Let me break this down for you."
];

const DUMMY_INTEGRATIONS: IntegrationExecution[] = [
  {
    integration_name: "Weather API",
    success: true,
    response_body: JSON.stringify({
      temperature: "22°C",
      condition: "Sunny",
      humidity: "65%"
    }),
    parsed_response: {
      temperature: "22°C",
      condition: "Sunny",
      humidity: "65%"
    }
  },
  {
    integration_name: "Database Query",
    success: true,
    response_body: JSON.stringify({
      results: 5,
      status: "completed"
    }),
    parsed_response: {
      results: 5,
      status: "completed"
    }
  }
];

export default function WebchatPage({ 
  agentId = "demo-agent", 
  agentName = "AI Assistant", 
  welcomeMessage,
  className 
}: AIAgentChatPreviewProps) {
  const [message, setMessage] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState("demo-session-123")
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES)
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (message.trim() && !isSending) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        content: message,
        sender: "user",
        timestamp: new Date().toISOString(),
        tokens_used: 0,
      }
      
      setMessages((prev) => [...prev, userMessage])
      const currentMessage = message
      setMessage("")
      setIsSending(true)
      setHasUserSentMessage(true)

      // Simulate API delay
      setTimeout(() => {
        // Randomly decide if we should show integration results
        const showIntegrations = Math.random() > 0.7;
        
        // if (showIntegrations) {
        //   // Add integration results message
        //   const integrationMessage: Message = {
        //     id: `integration-${Date.now()}`,
        //     content: "Integration Results",
        //     sender: "ai",
        //     timestamp: new Date().toISOString(),
        //     tokens_used: 0,
        //     integrationExecutions: DUMMY_INTEGRATIONS
        //   }
        //   setMessages((prev) => [...prev, integrationMessage])
        // }

        // Add AI response
        const randomResponse = DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)]
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: randomResponse,
          sender: "ai",
          timestamp: new Date().toISOString(),
          tokens_used: Math.floor(Math.random() * 100) + 20 // Random tokens between 20-120
        }
        
        setMessages((prev) => [...prev, aiResponse])
        setIsSending(false)
      }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    
    // Clear existing messages and reset to welcome message
    setMessages(DUMMY_MESSAGES)
    
    // Reset user message state
    setHasUserSentMessage(false)
    
    // Generate new session ID for fresh conversation
    setSessionId(`demo-session-${Date.now()}`)
    
    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
      <Card className={`flex flex-col w-full max-w-2xl ${className}`} style={{ height: '600px' }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">{agentName}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RotateCw className={`h-4 w-4 transition-transform duration-1000 ${
              isRefreshing ? 'animate-spin' : ''
            }`} />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{agentName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div
            className="flex-1 space-y-4 overflow-y-auto"
            style={{ minHeight: '300px' }}
            ref={chatContainerRef}
          >
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.sender === "system" ? (
                  <div className="flex justify-center">
                    <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm text-center max-w-md">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm break-words ${
                        msg.sender === "user" ? "bg-primary text-primary-foreground" : 
                        msg.id.startsWith("integration-") ? " bg-muted text-foreground" : 
                        "bg-muted text-foreground"
                      }`}
                    >
                      {/* For integration results message */}
                      {msg.id.startsWith("integration-") && msg.integrationExecutions ? (
                        <>
                          <div className="font-medium mb-2">Integration Results</div>
                          <div className="space-y-2">
                            {msg.integrationExecutions.map((integration, index) => (
                              <div key={index} className="text-xs">
                                <div className={`flex items-center ${integration.success ? 'text-green-600' : 'text-red-600'}`}>
                                  <div className={`w-2 h-2 rounded-full mr-1 ${integration.success ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                  <span className="font-medium">{integration.integration_name}</span>
                                  <span className="ml-1">- {integration.success ? 'Success' : 'Failed'}</span>
                                </div>
                                {integration.success && integration.response_body && (
                                  <div className="ml-3 mt-1 bg-white p-1 rounded text-gray-800 overflow-x-auto">
                                    {integration.parsed_response ? (
                                      <pre className="whitespace-pre-wrap">{JSON.stringify(integration.parsed_response, null, 2)}</pre>
                                    ) : (
                                      <pre className="whitespace-pre-wrap">
                                        {typeof integration.response_body === 'object' 
                                          ? JSON.stringify(integration.response_body, null, 2)
                                          : integration.response_body
                                        }
                                      </pre>
                                    )}
                                  </div>
                                )}
                                {!integration.success && integration.error_message && (
                                  <div className="ml-3 mt-1 bg-red-50 p-1 rounded text-red-800">
                                    {integration.error_message}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="mb-1 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      )}
                      {/* Display token usage for all message types */}
                      {/* {msg.tokens_used > 0 && (
                        <div className="text-xs opacity-70 mt-2">
                          {Math.ceil(msg.tokens_used / 1500)} tokens used
                        </div>
                      )} */}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Show typing indicator when sending */}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground max-w-[80%] p-3 rounded-lg text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="animate-pulse">AI is typing</div>
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}