"use client";
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MoreHorizontal, User, RotateCw, Loader2 } from "lucide-react";
import { ChatService } from "@/services/chatService";
import { Textarea } from "./ui/textarea";

interface IntegrationExecution {
  integration_name: string
  success: boolean
  response_body: string | null
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
  agentId: string
  agentName: string
  welcomeMessage?: string
  className?: string
}

export default function AIAgentChatPreview({ agentId, agentName, welcomeMessage, className }: AIAgentChatPreviewProps) {
  const [message, setMessage] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sessionId, setSessionId] = useState(() => ChatService.generateSessionId())
  const [messages, setMessages] = useState<Message[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Add welcome message when it changes
  useEffect(() => {
    if (welcomeMessage && welcomeMessage.trim()) {
      // const welcomeMsg: Message = {
      //   id: "welcome-1",
      //   content: welcomeMessage,
      //   sender: "ai",
      //   timestamp: new Date().toISOString(),
      // }

      setMessages((prev) => {
        // Remove existing welcome message if any
        const filtered = prev.filter((msg) => !msg.id.startsWith("welcome-"))
        return [...filtered]
        // return [...filtered, welcomeMsg]
      })
    }
  }, [welcomeMessage])

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

      try {
        // Call the real API
        const response = await ChatService.sendMessage(agentId, currentMessage, sessionId)
        
        // Process integration executions if available
        let processedIntegrations: IntegrationExecution[] | undefined = undefined
        
        if (response.integration_executions && response.integration_executions.length > 0) {
          processedIntegrations = response.integration_executions.map(integration => {
            // Try to parse the response_body if it's a JSON string
            let parsedResponse = undefined
            if (integration.response_body) {
              try {
                parsedResponse = JSON.parse(integration.response_body)
              } catch (e) {
                // If parsing fails, leave it as is
                console.log('Failed to parse integration response:', e)
              }
            }
            
            return {
              ...integration,
              parsed_response: parsedResponse
            }
          })
          
          // Add integration results as a separate message first
          const integrationMessage: Message = {
            id: `integration-${Date.now()}`,
            content: "Integration Results",
            sender: "ai",
            timestamp: new Date().toISOString(),
            tokens_used: 0,
            integrationExecutions: processedIntegrations
          }
          
          setMessages((prev) => [...prev, integrationMessage])
        }
        
        // Add AI response to messages as a separate message
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: response.response,
          sender: "ai",
          timestamp: new Date().toISOString(),
          tokens_used: response.token_usage_summary?.total_tokens || response.tokens_used
          // No integrationExecutions here as they're in a separate message now
        }
        
        console.log("AI Response:", aiResponse)
        setMessages((prev) => [...prev, aiResponse])
      } catch (error: any) {
        console.error('Error sending message:', error)
        // Add error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          content: "Sorry, I'm having trouble responding right now. Please try again.",
          sender: "ai",
          timestamp: new Date().toISOString(),
          tokens_used: 0,
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsSending(false)
      }
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
    
    // Generate new session ID for fresh conversation
    setSessionId(ChatService.generateSessionId())
  }

  return (
    <Card className={`flex flex-col ${className}`} style={{ height: 'fit-content', minHeight: '500px' }}>
       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Chat Preview</CardTitle>
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
          style={{ minHeight: '300px', maxHeight: '60vh' }}
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
                                    <pre className="whitespace-pre-wrap">{integration.response_body}</pre>
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
                    {msg.tokens_used > 0 && (
                      <div className="text-xs opacity-70 mt-2">
                        {Math.ceil(msg.tokens_used / 1500)} tokens used
                        {/* {Math.round(msg.tokens_used / 1500)} tokens used */}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
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
  )
}
