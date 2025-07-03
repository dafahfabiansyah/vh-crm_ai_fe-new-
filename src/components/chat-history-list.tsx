"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Plus, MoreHorizontal, Circle, CheckCircle2, CheckCheck } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { ChatHistoryListProps } from "@/types"

export default function ChatHistoryList({
  chatSessions,
  selectedChatId,
  onSelectChat,
  searchQuery,
  onSearchChange,
}: ChatHistoryListProps) {
  const [assignedCount] = useState(1515)
  const [unassignedCount] = useState(201)
  const [ResolveCount] = useState(201)
  const [activeTab, setActiveTab] = useState<'assigned' | 'unassigned' | 'resolved'>('assigned')

  const filteredSessions = chatSessions.filter((session) => {
    // Filter berdasarkan search query
    const matchesSearch = 
      session.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filter berdasarkan tab yang aktif
    const matchesTab = (() => {
      switch (activeTab) {
        case 'assigned':
          return session.agent !== 'Unassigned' && session.status !== 'resolved'
        case 'unassigned':
          return session.agent === 'Unassigned' || session.status === 'pending'
        case 'resolved':
          return session.status === 'resolved'
        default:
          return true
      }
    })()
    
    return matchesSearch && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between w-32">
                All Agent
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Agents</DropdownMenuItem>
              <DropdownMenuItem>Sales Team</DropdownMenuItem>
              <DropdownMenuItem>Support Team</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'assigned' 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'hover:bg-accent/50 text-muted-foreground'
            }`}
          >
            <span>Assigned</span>
            <Badge variant="secondary" className={`${
              activeTab === 'assigned' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
            }`}>
              {assignedCount}
            </Badge>
          </button>
          
          <button
            onClick={() => setActiveTab('unassigned')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'unassigned' 
                ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                : 'hover:bg-accent/50 text-muted-foreground'
            }`}
          >
            <span>Unassigned</span>
            <Badge variant="secondary" className={`${
              activeTab === 'unassigned' ? 'bg-destructive text-destructive-foreground' : 'bg-destructive/10 text-destructive'
            }`}>
              {unassignedCount}
            </Badge>
          </button>
          
          <button
            onClick={() => setActiveTab('resolved')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'resolved' 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'hover:bg-accent/50 text-muted-foreground'
            }`}
          >
            <CheckCheck className="h-4 w-4" />
            <Badge variant="secondary" className={`${
              activeTab === 'resolved' ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {ResolveCount}
            </Badge>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab Indicator */}
        <div className="p-3 bg-accent/30 border-b border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">
              {activeTab === 'assigned' ? 'Assigned' : 
               activeTab === 'unassigned' ? 'Unassigned' : 'Resolved'}
            </span> conversations ({filteredSessions.length})
          </p>
        </div>
        
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No conversations found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or tab selection
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectChat(session.id)}
            className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
              selectedChatId === session.id ? "bg-accent border-l-4 border-l-primary" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {session.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {session.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground truncate">{session.customerName}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{session.timestamp}</span>
                </div>

                <p className="text-sm text-muted-foreground truncate mb-2">{session.lastMessage}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {session.status === "resolved" ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    ) : (
                      <Circle className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">{session.agent}</span>
                  </div>

                  <Badge variant="outline" className={`text-xs ${getStatusColor(session.status)}`}>
                    {session.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  )
}
