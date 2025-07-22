"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Info, Send, Paperclip, Smile, CheckCheck, Menu, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import type { ChatConversationProps } from "@/types"
import { useChatLogs } from "@/hooks"
import { ContactsService } from "@/services/contactsService"


export default function ChatConversation({ selectedContactId, selectedContact, onToggleMobileMenu, showBackButton, onToggleInfo, showInfo, onSwitchToAssignedTab }: ChatConversationProps) {
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isTakenOver, setIsTakenOver] = useState(false)
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<number[]>([])

  // Check if conversation is already assigned
  const isAssigned = selectedContact?.lead_status === 'assigned'
  const showMessageInput = isTakenOver || isAssigned
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageRefs = useRef<(HTMLDivElement | null)[]>([])

  // Fetch chat logs for the selected contact
  const { chatLogs, loading, error } = useChatLogs(selectedContactId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Format timestamp to display time difference
  const formatTimestamp = (timestamp: string): string => {
    // Convert UTC timestamp to UTC+7 (WIB - Western Indonesia Time)
    const date = new Date(timestamp)
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    const wibTime = new Date(utcTime + (7 * 3600000)) // UTC+7

    const now = new Date()
    const nowUtc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const nowWib = new Date(nowUtc + (7 * 3600000))

    const diffInMinutes = Math.floor((nowWib.getTime() - wibTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const diffInHours = Math.floor(diffInMinutes / 60)
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440)
      return `${diffInDays}d ago`
    }
  }

  // Fungsi utilitas untuk memecah setiap 50 karakter
  function breakEvery50Chars(text: string): string {
    const result = [];
    let i = 0;
    while (i < text.length) {
      result.push(text.slice(i, i + 50));
      i += 50;
    }
    return result.join('\n');
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatLogs])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([])
      setCurrentSearchIndex(-1)
      return
    }

    const results: number[] = []
    chatLogs.forEach((chatLog, index) => {
      if (chatLog.message.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push(index)
      }
    })
    
    setSearchResults(results)
    if (results.length > 0) {
      setCurrentSearchIndex(0)
      scrollToMessage(results[0])
    } else {
      setCurrentSearchIndex(-1)
    }
  }, [searchQuery, chatLogs])

  const scrollToMessage = (messageIndex: number) => {
    const messageElement = messageRefs.current[messageIndex]
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      })
      // Add highlight effect
      messageElement.style.backgroundColor = '#fef3c7'
      setTimeout(() => {
        messageElement.style.backgroundColor = ''
      }, 2000)
    }
  }

  const navigateSearch = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return
    
    let newIndex
    if (direction === 'next') {
      newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0
    } else {
      newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1
    }
    
    setCurrentSearchIndex(newIndex)
    scrollToMessage(searchResults[newIndex])
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <mark key={index} className="bg-yellow-200 text-yellow-900">{part}</mark> : 
        part
    )
  }

  const handleTakeOver = async () => {
    if (!selectedContactId) return

    setIsLoading(true)
    try {
      await ContactsService.takeoverConversation(selectedContactId)
      setIsTakenOver(true)
      console.log("Chat taken over by agent")
      
      // Switch to assigned tab when chat is taken over
      if (onSwitchToAssignedTab) {
        onSwitchToAssignedTab()
      }
    } catch (error: any) {
      console.error("Failed to takeover conversation:", error)
      alert(error.message || "Failed to takeover conversation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!selectedContactId) return

    setIsLoading(true)
    try {
      await ContactsService.resolveConversation(selectedContactId)
      // Reset takeover state, but assigned contacts will still show message input based on lead_status
      setIsTakenOver(false)
      console.log("Conversation resolved")
    } catch (error: any) {
      console.error("Failed to resolve conversation:", error)
      alert(error.message || "Failed to resolve conversation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return

    setIsSending(true)
    try {
      await ContactsService.sendMessage(
        selectedContact.platform_inbox_id as string,
        selectedContact.contact_identifier,
        newMessage
      )
      setNewMessage("")
      console.log("Message sent:", newMessage)
      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 100)
    } catch (error: any) {
      console.error("Failed to send message:", error)
      alert(error.message || "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!selectedContact) {
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
                  {selectedContact.push_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-foreground truncate text-sm">{selectedContact.push_name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{selectedContact.contact_identifier}</span>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {selectedContact.lead_status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Resolve Button - Show when taken over or assigned */}
              {showMessageInput && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResolve}
                  disabled={isLoading}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline ml-1">Resolve</span>
                </Button>
              )}

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
                {selectedContact.push_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-foreground truncate">{selectedContact.push_name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedContact.contact_identifier}</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {selectedContact.lead_status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Resolve Button - Show when taken over or assigned */}
            {showMessageInput && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResolve}
                disabled={isLoading}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span className="ml-1">Resolve</span>
              </Button>
            )}

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
                className="pl-10 pr-20 w-80"
              />
              {searchResults.length > 0 && (
                <div className="absolute right-2 top-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => navigateSearch('prev')}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => navigateSearch('next')}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              )}
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
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-4 sm:pb-6 scroll-smooth scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading messages</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : chatLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          chatLogs.map((chatLog, index) => (
            <div 
              key={chatLog.id} 
              ref={(el) => {
                messageRefs.current[index] = el
              }}
              className={`flex ${chatLog.from_me ? "justify-end" : "justify-start"} mb-4 transition-colors duration-500`}
            >
              <div className={`flex flex-col ${chatLog.from_me ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[60%]`}>
                <div className={`${
                  chatLog.from_me
                    ? "bg-primary text-primary-foreground rounded-l-xl rounded-tr-xl rounded-br-md"
                    : "bg-muted text-foreground rounded-r-xl rounded-tl-xl rounded-bl-md"
                  } px-3 py-2 shadow-sm`}>
                  <p className="text-sm leading-relaxed break-words">
                    {breakEvery50Chars(chatLog.message).split('\n').map((line, idx, arr) => (
                      <span key={idx}>
                        {searchQuery ? highlightText(line, searchQuery) : line}
                        {idx !== arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
                <div className={`flex items-center gap-1 mt-1 px-2 text-xs text-muted-foreground ${chatLog.from_me ? "flex-row-reverse" : "flex-row"}`}>
                  <span>{formatTimestamp(chatLog.sent_at)}</span>
                  {chatLog.from_me && (
                    <CheckCheck className="h-3 w-3 text-primary/70" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* System Messages */}
        {/* <div className="flex justify-center">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground mb-4">
            SPV DISTCCTV self assigned to this conversation
          </div>
        </div>

        <div className="flex justify-center">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground mb-4">
            This conversation resolved by SPV DISTCCTV
          </div>
        </div> */}

        {/* Invisible div to scroll to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom - Takeover Chat Button or Message Input */}
      <div className="sticky bottom-0 z-10 p-3 sm:p-4 border-t border-border bg-card">
        {!showMessageInput ? (
          <Button
            onClick={handleTakeOver}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Taking over...
              </>
            ) : (
              <>
                👥 Takeover Chat
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-start gap-2">
            <div className="flex-1 relative">
              <textarea
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                className="w-full min-h-[40px] max-h-[120px] resize-none rounded-md border border-input bg-background px-3 py-2 pr-20 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '40px',
                  maxHeight: '120px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isSending}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={isSending}>
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
