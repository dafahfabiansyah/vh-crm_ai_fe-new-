"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Info, CheckCheck, Menu, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import type { ChatConversationProps } from "@/types"
import { useChatLogs } from "@/hooks"
import { ContactsService } from "@/services/contactsService"
import { useToast } from "@/hooks"
import MediaUploader from "./media-uploader"

export default function ChatConversation({ selectedContactId, selectedContact, onToggleMobileMenu, showBackButton, onToggleInfo, showInfo, onSwitchToAssignedTab }: ChatConversationProps) {
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [localLeadStatus, setLocalLeadStatus] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const currentStatus = localLeadStatus || selectedContact?.lead_status
  const isAssigned = currentStatus === 'assigned'
  const isResolved = currentStatus === 'resolved'
  const showMessageInput = isAssigned
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

  // Fungsi untuk parsing WhatsApp style (bold, italic, strikethrough, monospace)
  function parseWhatsAppStyle(text: string): React.ReactNode[] {
    let elements: React.ReactNode[] = [];
    let regex = /(`[^`]+`|\*[^*]+\*|_[^_]+_|~[^~]+~)/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }
      const matchText = match[0];
      if (matchText.startsWith('`')) {
        elements.push(<code key={match.index}>{matchText.slice(1, -1)}</code>);
      } else if (matchText.startsWith('*')) {
        elements.push(<b key={match.index}>{matchText.slice(1, -1)}</b>);
      } else if (matchText.startsWith('_')) {
        elements.push(<i key={match.index}>{matchText.slice(1, -1)}</i>);
      } else if (matchText.startsWith('~')) {
        elements.push(<s key={match.index}>{matchText.slice(1, -1)}</s>);
      }
      lastIndex = match.index + matchText.length;
    }
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    return elements;
  }

  // Fungsi utilitas untuk memecah kata super panjang saja
  function breakLongWords(text: string, maxLen = 50): string {
    return text.split(' ').map(word => {
      if (word.length > maxLen) {
        const parts = [];
        for (let i = 0; i < word.length; i += maxLen) {
          parts.push(word.slice(i, i + maxLen));
        }
        return parts.join(' ');
      }
      return word;
    }).join(' ');
  }

  function renderMessageWithLineBreaks(text: string) {
    const lines = text.split('\n');
    return lines.map((line, idx) => (
      <React.Fragment key={idx}>
        {parseWhatsAppStyle(breakLongWords(line))}
        {idx !== lines.length - 1 && <br />}
      </React.Fragment>
    ));
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatLogs])

  // Reset local status when contact changes
  useEffect(() => {
    setLocalLeadStatus(null)
  }, [selectedContactId])

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
      console.log("Chat taken over by agent")
      
      // Update local status immediately for responsive UI
      setLocalLeadStatus('assigned')

      // Switch to assigned tab when chat is taken over
      if (onSwitchToAssignedTab) {
        onSwitchToAssignedTab()
      }
    } catch (error: any) {
      console.error("Failed to takeover conversation:", error)
      showError(error.message || "Failed to takeover conversation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTakeOverFromResolved = async () => {
    if (!selectedContactId) return

    setIsLoading(true)
    try {
      await ContactsService.takeoverConversation(selectedContactId)
      console.log("Chat taken over from resolved by agent")
      
      // Update local status immediately for responsive UI
      setLocalLeadStatus('assigned')

      // Switch to assigned tab when chat is taken over from resolved
      if (onSwitchToAssignedTab) {
        onSwitchToAssignedTab()
      }
    } catch (error: any) {
      console.error("Failed to takeover conversation from resolved:", error)
      showError(error.message || "Failed to takeover conversation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!selectedContactId) return

    setIsLoading(true)
    try {
      await ContactsService.resolveConversation(selectedContactId)
      console.log("Conversation resolved")
      
      // Update local status immediately for responsive UI
      setLocalLeadStatus('resolved')
    } catch (error: any) {
      console.error("Failed to resolve conversation:", error)
      showError(error.message || "Failed to resolve conversation")
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
      showError(error.message || "Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleSendFiles = async (files: File[]) => {
    if (files.length === 0 || !selectedContact) return

    setIsSending(true)
    try {
      // Here you would implement the actual file upload to your backend
      // For now, we'll just simulate sending
      console.log("Sending files:", files.map(f => f.name))
      success(`${files.length} file(s) sent successfully`)
      
      // Scroll to bottom after sending files
      setTimeout(() => scrollToBottom(), 100)
    } catch (error: any) {
      console.error("Failed to send files:", error)
      showError(error.message || "Failed to send files")
    } finally {
      setIsSending(false)
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
                    {currentStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Takeover Button - Show when resolved */}
              {isResolved && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTakeOverFromResolved}
                  disabled={isLoading}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>👥</>
                  )}
                  <span className="hidden sm:inline ml-1">Takeover</span>
                </Button>
              )}

              {/* Resolve Button - Show when assigned (not resolved) */}
              {isAssigned && (
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
                  {currentStatus}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">


            {/* Resolve Button - Show when assigned (not resolved) */}
            {isAssigned && (
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
              <div className={`flex flex-col ${chatLog.from_me ? "items-end" : "items-start"} max-w-[350px]`}>
                <div className={`${chatLog.from_me
                    ? "bg-primary text-primary-foreground rounded-l-xl rounded-tr-xl rounded-br-md"
                    : "bg-muted text-foreground rounded-r-xl rounded-tl-xl rounded-bl-md"
                  } px-3 py-2 shadow-sm`}>
                  <p className="text-sm leading-relaxed break-words">
                    {searchQuery
                      ? highlightText(breakLongWords(chatLog.message), searchQuery)
                      : renderMessageWithLineBreaks(chatLog.message)}
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
            onClick={isResolved ? handleTakeOverFromResolved : handleTakeOver}
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
                👥 {isResolved ? 'Takeover Chat' : 'Takeover Chat'}
              </>
            )}
          </Button>
        ) : (
          <MediaUploader
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending}
            onSendMessage={handleSendMessage}
            onSendFiles={handleSendFiles}
          />
        )}
      </div>
    </div>
  )
}
