"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Info, MoreHorizontal, Send, Paperclip, Smile, CheckCheck} from 'lucide-react'
import type { ChatConversationProps } from "@/types"


export default function ChatConversation({ messages, selectedChat }: ChatConversationProps) {
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a conversation to start chatting
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedChat.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{selectedChat.customerName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">628217328523</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {selectedChat.agent}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Info className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {message.isSystem ? (
              <div className="flex justify-center">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className={`flex ${message.sender === "agent" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${
                  message.sender === "agent" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                } rounded-lg p-3 space-y-1`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between text-xs opacity-70">
                    <span>{message.timestamp}</span>
                    {message.sender === "agent" && (
                      <div className="flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" />
                        <span>SPV DISTCCTV</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* System Messages */}
        <div className="flex justify-center">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
            SPV DISTCCTV self assigned to this conversation
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
            This conversation resolved by SPV DISTCCTV
          </div>
        </div>
      </div>

      {/* Takeover Chat Button */}
      <div className="p-4 border-t border-border">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          👥 Takeover Chat
        </Button>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-20"
              multiple
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
