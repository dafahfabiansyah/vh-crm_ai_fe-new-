"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, MoreHorizontal, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai" | "system"
  timestamp: string
}

interface AIAgentChatPreviewProps {
  agentName: string
  welcomeMessage?: string
  className?: string
}

export default function AIAgentChatPreview({ agentName, welcomeMessage, className }: AIAgentChatPreviewProps) {
  const [isTestingMode, setIsTestingMode] = useState(true)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      content:
        "AI starts fresh with no memory of previous conversations.\n\nRefresh the page to start a completely new session.",
      sender: "system",
      timestamp: new Date().toISOString(),
    },
  ])

  // Add welcome message when it changes
  useEffect(() => {
    if (welcomeMessage && welcomeMessage.trim()) {
      const welcomeMsg: Message = {
        id: "welcome-1",
        content: welcomeMessage,
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => {
        // Remove existing welcome message if any
        const filtered = prev.filter((msg) => !msg.id.startsWith("welcome-"))
        return [...filtered, welcomeMsg]
      })
    }
  }, [welcomeMessage])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: `user-${Date.now()}`,
        content: message,
        sender: "user",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMessage])
      setMessage("")

      // Simulate AI response with typing delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          content:
            "Thank you for your message! I'm here to help you with any questions or concerns you might have. How can I assist you today?",
          sender: "ai",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiResponse])
      }, 1500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleTestingMode = () => {
    setIsTestingMode(!isTestingMode)
  }
  return (
    <Card className={`flex flex-col ${className}`} style={{ height: 'fit-content', minHeight: '500px' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Chat Preview</CardTitle>
        <Button
          variant={isTestingMode ? "default" : "outline"}
          size="sm"
          onClick={toggleTestingMode}
          className={isTestingMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
        >
          Testing Mode
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
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Fresh Session (No Memory)
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto" style={{ minHeight: '300px', maxHeight: '60vh' }}>
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
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Delay Info */}
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-medium">Message Delay:</span> 1 seconds + natural typing speed
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
