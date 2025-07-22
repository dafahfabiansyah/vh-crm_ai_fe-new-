"use client";
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MoreHorizontal, User, RotateCw, Loader2 } from "lucide-react";
import { ChatService } from "@/services/chatService";
import { Textarea } from "./ui/textarea";

interface Message {
  id: string
  content: string
  sender: "user" | "ai" | "system"
  timestamp: string
  tokens_used : number
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
        
        // Add AI response to messages
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content: response.response,
          sender: "ai",
          timestamp: new Date().toISOString(),
          tokens_used: response.token_usage_summary?.total_tokens || response.tokens_used
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
                      msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="mb-1 whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {msg.tokens_used > 0 && (
                      <div className="text-xs opacity-70 mt-2">
                        {Math.round(msg.tokens_used / 400)} tokens used
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
