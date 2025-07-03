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

  const filteredSessions = chatSessions.filter(
    (session) =>
      session.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

        {/* Stats */}
        <div className="flex gap-4 text-sm overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Assigned</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {assignedCount}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Unassigned</span>
            <Badge variant="secondary" className="bg-destructive/10 text-destructive">
              {unassignedCount}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* <span className="text-muted-foreground">Resolve</span> */}
            <CheckCheck className="text-muted-foreground" />
            <Badge variant="secondary" className="bg-emerald-500 text-white">
              {ResolveCount}
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSessions.map((session) => (
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
        ))}
      </div>
    </div>
  )
}
