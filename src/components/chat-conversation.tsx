"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Info, Send, Paperclip, Smile, CheckCheck, Menu, ArrowLeft } from 'lucide-react'
import type { ChatConversationProps } from "@/types"


export default function ChatConversation({ messages, selectedChat, onToggleMobileMenu, showBackButton, onToggleInfo, showInfo }: ChatConversationProps) {
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTakenOver, setIsTakenOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleTakeOver = () => {
    setIsTakenOver(true)
    console.log("Chat taken over by agent")
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      console.log("Sending message:", newMessage)
      setNewMessage("")
      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 100)
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
      {/* Header - Sticky Top */}
      <div className="sticky top-0 z-10 p-3 sm:p-4 border-b border-border bg-card">
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden">
          {/* Top Row - Back Button + Customer Info + Info Button */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back Button - Mobile Only */}
              {showBackButton && (
                <Button 
                  variant="outline" 
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => {
                    console.log('Back button clicked')
                    onToggleMobileMenu?.()
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedChat.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground truncate text-sm">{selectedChat.customerName}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">628217328523</span>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {selectedChat.agent}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mobile Menu Button - Only show when no back button */}
              {!showBackButton && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    console.log('Mobile menu button clicked')
                    onToggleMobileMenu?.()
                  }}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
                  {/* Info Button - Hidden on desktop since info sidebar is always visible */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={onToggleInfo}
              className={`lg:hidden ${showInfo ? "bg-primary/10 border-primary text-primary" : ""}`}
            >
              <Info className="h-4 w-4" />
            </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Single Row */}
        <div className="hidden lg:flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Back Button - Mobile Only */}
            {showBackButton && (
              <Button 
                variant="outline" 
                size="icon"
                className="lg:hidden"
                onClick={() => {
                  console.log('Back button clicked')
                  onToggleMobileMenu?.()
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedChat.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground truncate">{selectedChat.customerName}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">628217328523</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {selectedChat.agent}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Menu Button - Only show when no back button */}
            {!showBackButton && (
              <Button 
                variant="outline" 
                size="icon"
                className="lg:hidden"
                onClick={() => {
                  console.log('Mobile menu button clicked')
                  onToggleMobileMenu?.()
                }}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            {/* Search - Hidden on mobile */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari Percakapan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* Info Button - Hidden on desktop since info sidebar is always visible */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={onToggleInfo}
              className={`lg:hidden ${showInfo ? "bg-primary/10 border-primary text-primary" : ""}`}
            >
              <Info className="h-4 w-4" />
            </Button>
            
            {/* More Options */}
            {/* <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button> */}
          </div>
        </div>
      </div>

      {/* Messages - Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-4 sm:pb-6 space-y-4 scroll-smooth scrollbar-thin">
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
                <div className={`flex flex-col ${message.sender === "agent" ? "items-end" : "items-start"} space-y-1`}>
                  <div className={`max-w-[70%] ${
                    message.sender === "agent" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-foreground"
                  } rounded-lg p-3`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`flex items-center gap-2 text-xs text-muted-foreground ${message.sender === "agent" ? "justify-end" : "justify-start"}`}>
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
        
        {/* Invisible div to scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom - Takeover Chat Button or Message Input */}
      <div className="sticky bottom-0 z-10 p-3 sm:p-4 border-t border-border bg-card">
        {!isTakenOver ? (
          <Button 
            onClick={handleTakeOver}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            👥 Takeover Chat
          </Button>
        ) : (
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
        )}
      </div>
    </div>
  )
}
