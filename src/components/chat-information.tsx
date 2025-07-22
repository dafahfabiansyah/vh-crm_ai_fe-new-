"use client";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User,  Calendar, MessageSquare } from "lucide-react"
import type { ChatInformationProps } from "@/types"

export default function ChatInformation({ chatInfo }: ChatInformationProps) {
  // const [isAdditionalDataOpen, setIsAdditionalDataOpen] = useState(false)
  // const [newLabel, setNewLabel] = useState("")
  // const [notes, setNotes] = useState(chatInfo.notes || "")
  const [contactData, setContactData] = useState(chatInfo)

  useEffect(() => {
    // Update contactData when chatInfo changes
    setContactData(chatInfo)
  }, [chatInfo])

  // const handleAddLabel = () => {
  //   if (newLabel.trim()) {
  //     // Handle adding label
  //     console.log("Adding label:", newLabel)
  //     setNewLabel("")
  //   }
  // }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-semibold text-foreground">Info</h2>
          {/* <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary/10">
            Create Ticket
          </Button> */}
        </div>

        {/* Customer Info */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-sm sm:text-lg">
                {contactData.push_name
                  ? contactData.push_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                  : "NA"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground text-sm sm:text-base truncate">{contactData.push_name || "Unknown"}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{contactData.contact_identifier || "No ID"}</p>
            </div>
          </div>

          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
            {contactData.assigned_agent_name || "-"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
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
        {/* <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Labels</Label>
          {(!contactData.labels || contactData.labels.length === 0) ? (
            <p className="text-sm text-muted-foreground">No labels yet</p>
          ) : (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {contactData.labels.map((label, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                  {label}
                  <X className="h-3 w-3 cursor-pointer" />
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleAddLabel}
              size="sm"
              variant="outline"
              className="text-primary border-primary hover:bg-primary/10 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Add Label</span>
            </Button>
          </div>
        </div> */}

        {/* Handled By */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Handled By</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-sm text-foreground">{contactData.assigned_agent_name || "-"}</span>
            <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10 w-full sm:w-auto">
              <User className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Assign Agent</span>
            </Button>
          </div>
        </div>

        {/* Collaborators */}
        {/* <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Collaborators</Label>
          {(!contactData.collaborators || contactData.collaborators.length === 0) ? (
            <p className="text-sm text-muted-foreground">No collaborators yet</p>
          ) : (
            <div className="space-y-2">
              {contactData.collaborators.map((collaborator, index) => (
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
            <UserPlus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Add Collaborator</span>
          </Button>
        </div> */}

        {/* Notes */}
        {/* <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Notes</Label>
          <Textarea
            placeholder="Add notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div> */}

        {/* AI Summary */}
        {/* <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">AI Summary</Label>
          <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10">
            <Sparkles className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Generate AI Summary</span>
          </Button>
        </div> */}

        {/* Additional Data */}
        {/* <Collapsible open={isAdditionalDataOpen} onOpenChange={setIsAdditionalDataOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-sm font-medium text-foreground">Additional Data</span>
              {isAdditionalDataOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Add new additional info" className="flex-1 text-sm" />
              <Button size="sm" variant="outline" className="text-primary border-primary hover:bg-primary/10 w-full sm:w-auto">
                <span className="hidden sm:inline">Add New Additional Info</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible> */}

        {/* Conversation Details */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Conversation Details</Label>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Last Message</span>
              </div>
              <span className="text-foreground">
                {contactData.last_message
                  ? contactData.last_message.length > 30
                    ? contactData.last_message.slice(0, 30) + "..."
                    : contactData.last_message
                  : "No messages"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Assigned Agent</span>
              </div>
              <span className="text-foreground">{contactData.assigned_agent_name || "-"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Lead Status</span>
              </div>
              <span className="text-foreground capitalize">{contactData.lead_status}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Unread Messages</span>
              </div>
              <span className="text-foreground">{contactData.unread_messages}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last Message At</span>
              </div>
              <span className="text-foreground">{contactData.last_message_at ? new Date(contactData.last_message_at).toLocaleString() : "N/A"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created At</span>
              </div>
              <span className="text-foreground">{contactData.created_at ? new Date(contactData.created_at).toLocaleString() : "N/A"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Updated At</span>
              </div>
              <span className="text-foreground">{contactData.updated_at ? new Date(contactData.updated_at).toLocaleString() : "N/A"}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>Platform</span>
              </div>
              <span className="text-foreground">{contactData.platform_name || "-"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
