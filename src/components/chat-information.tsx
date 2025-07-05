"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Plus, X, ChevronDown, ChevronUp, User, UserPlus, Calendar, Clock, Sparkles } from "lucide-react"
import type { ChatInformationProps } from "@/types"

export default function ChatInformation({ chatInfo }: ChatInformationProps) {
  const [isAdditionalDataOpen, setIsAdditionalDataOpen] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [notes, setNotes] = useState(chatInfo.notes)

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      // Handle adding label
      console.log("Adding label:", newLabel)
      setNewLabel("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Info</h2>
          {/* <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
            Create Ticket
          </Button> */}
        </div>

        {/* Customer Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {chatInfo.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{chatInfo.customerName}</h3>
              <p className="text-sm text-muted-foreground">{chatInfo.customerId}</p>
            </div>
          </div>

          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {chatInfo.agent}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Pipeline Status */}
        {/* <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Select Pipeline Status</Label>
          <Select defaultValue={chatInfo.status}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* Labels */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Labels</Label>
          {chatInfo.labels.length === 0 ? (
            <p className="text-sm text-muted-foreground">No labels yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {chatInfo.labels.map((label, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {label}
                  <X className="h-3 w-3 cursor-pointer" />
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Add label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleAddLabel}
              size="sm"
              variant="outline"
              className="text-primary border-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
              Add Label
            </Button>
          </div>
        </div>

        {/* Handled By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Handled By</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">{chatInfo.handledBy}</span>
            <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10">
              <User className="h-4 w-4 mr-1" />
              Assign Agent
            </Button>
          </div>
        </div>

        {/* Collaborators */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Collaborators</Label>
          {chatInfo.collaborators.length === 0 ? (
            <p className="text-sm text-muted-foreground">No collaborators yet</p>
          ) : (
            <div className="space-y-2">
              {chatInfo.collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {collaborator
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{collaborator}</span>
                </div>
              ))}
            </div>
          )}
          <Button size="sm" variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
            <UserPlus className="h-4 w-4 mr-1" />
            Add Collaborator
          </Button>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Notes</Label>
          <Textarea
            placeholder="Add notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* AI Summary */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">AI Summary</Label>
          <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate AI Summary
          </Button>
        </div>

        {/* Additional Data */}
        <Collapsible open={isAdditionalDataOpen} onOpenChange={setIsAdditionalDataOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium text-foreground">Additional Data</span>
              {isAdditionalDataOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input placeholder="Add new additional info" className="flex-1" />
              <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10">
                Add New Additional Info
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Conversation Details */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Conversation Details</Label>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assigned By</span>
              </div>
              <span className="text-foreground">{chatInfo.assignedBy}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Handled By</span>
              </div>
              <span className="text-foreground">{chatInfo.handledBy}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Resolved By</span>
              </div>
              <span className="text-foreground">{chatInfo.resolvedBy}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>AI Handoff At</span>
              </div>
              <span className="text-foreground">{chatInfo.aiHandoffAt}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Assigned At</span>
              </div>
              <span className="text-foreground">{chatInfo.assignedAt}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created At</span>
              </div>
              <span className="text-foreground">{chatInfo.createdAt}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Resolved At</span>
              </div>
              <span className="text-foreground">{chatInfo.resolvedAt}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Open Until</span>
              </div>
              <span className="text-foreground">{chatInfo.openUntil}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
