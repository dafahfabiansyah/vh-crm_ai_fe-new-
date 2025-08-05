"use client";
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Calendar, MessageSquare, Sparkles, Loader2, ChevronDown } from "lucide-react"
import type { ChatInformationProps } from "@/types"
import { PipelineService } from "@/services/pipelineService"
import { ChatLogsService } from "@/services/chatLogsService"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { AuthService } from "../services/authService"
import { HumanAgentsService } from "../services/humanAgentsService"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ChatInformation({ chatInfo }: ChatInformationProps) {
  const [contactData, setContactData] = useState(chatInfo)
  const [leadNotes, setLeadNotes] = useState<string[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState<string>('Simpulkan keluhan customer ini')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [humanAgents, setHumanAgents] = useState<any[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [agentSearchQuery, setAgentSearchQuery] = useState('')

  useEffect(() => {
    setContactData(chatInfo)
  }, [chatInfo])

  // Ambil role user sekali saja saat komponen mount
  useEffect(() => {
    setUserRole(AuthService.getRoleFromToken());
  }, []);

  // Fetch human agents when component mounts and user is Manager
  useEffect(() => {
    if (userRole?.toLowerCase() === "manager") {
      fetchHumanAgents();
    }
  }, [userRole]);

  const fetchHumanAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const agents = await HumanAgentsService.getHumanAgents();
      // Filter only human agents with agent_type "Human"
      const humanOnlyAgents = agents.filter(agent => agent.agent_type === "Human");
      setHumanAgents(humanOnlyAgents);
    } catch (error) {
      console.error("Failed to fetch human agents:", error);
      setHumanAgents([]);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleAssignAgent = async (agentId: string, agentName: string) => {
    // TODO: Implement the actual assign agent API call
    console.log("Assigning agent:", agentId, agentName, "to contact:", contactData.id);
    // You can add the API call here to assign the agent to the contact
  };

  // Filter agents based on search query
  const filteredAgents = humanAgents.filter(agent => {
    const agentName = (agent.name || agent.user?.name || "").toLowerCase();
    const agentEmail = (agent.user_email || agent.user?.email || "").toLowerCase();
    const searchTerm = agentSearchQuery.toLowerCase();
    
    return agentName.includes(searchTerm) || agentEmail.includes(searchTerm);
  });

  useEffect(() => {
    if (!contactData?.id) {
      setLeadNotes([])
      setNotesError(null)
      return
    }

    setIsLoadingNotes(true)
    setNotesError(null)

    PipelineService.getLeads({ id_contact: contactData.id })
      .then((leads: any[]) => {
        if (leads && leads.length > 0) {
          const lead = leads[0]
          if (lead.notes) {
            const notesArray = lead.notes.split('\n').filter((note: string) => note.trim() !== '')
            setLeadNotes(notesArray.length > 0 ? notesArray : [])
          } else {
            setLeadNotes([])
          }
        } else {
          setLeadNotes([])
        }
      })
      .catch((err: any) => {
        setNotesError(err.message || "Failed to fetch lead notes")
        setLeadNotes([])
      })
      .finally(() => setIsLoadingNotes(false))
  }, [contactData?.id])

  const handleGenerateAISummary = async () => {
    if (!contactData?.id || isLoadingSummary) return

    setIsLoadingSummary(true)
    setSummaryError(null)

    try {
      const result = await ChatLogsService.summarizeChat(contactData.id, customPrompt)
      setAiSummary(result.summary)
    } catch (error: any) {
      setSummaryError(error.message || "Failed to generate AI summary")
    } finally {
      setIsLoadingSummary(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-semibold text-foreground">Info</h2>
        </div>

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

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Handled By</Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="text-sm text-foreground">{contactData.assigned_agent_name || "-"}</span>
            {userRole?.toLowerCase() === "manager" && (
              <DropdownMenu onOpenChange={(open) => {
                if (!open) {
                  setAgentSearchQuery(''); // Reset search when dropdown closes
                }
              }}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-primary border-primary hover:bg-primary/10 w-50"
                    disabled={isLoadingAgents}
                  >
                    <User className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">
                      {isLoadingAgents ? "Loading..." : "Assign Agent"}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-50">
                  {/* Search Input */}
                  <div className="p-2 border-b" onClick={(e) => e.stopPropagation()}>
                    <Input
                      placeholder="Cari agent..."
                      value={agentSearchQuery}
                      onChange={(e) => setAgentSearchQuery(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        // Prevent dropdown from closing when typing
                        e.stopPropagation();
                      }}
                    />
                  </div>
                  
                  {isLoadingAgents ? (
                    <DropdownMenuItem disabled>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading agents...
                    </DropdownMenuItem>
                  ) : filteredAgents.length === 0 ? (
                    <DropdownMenuItem disabled>
                      {agentSearchQuery ? "No agents found" : "No human agents available"}
                    </DropdownMenuItem>
                  ) : (
                    filteredAgents.map((agent) => (
                      <DropdownMenuItem
                        key={agent.id}
                        onClick={() => handleAssignAgent(agent.id, agent.name || agent.user?.name)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(agent.name || agent.user?.name || "NA")
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {agent.name || agent.user?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {agent.user_email || agent.user?.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">AI Notes</Label>
          {isLoadingNotes ? (
            <div className="text-sm text-muted-foreground">Loading notes...</div>
          ) : notesError ? (
            <div className="text-sm text-red-500">{notesError}</div>
          ) : leadNotes.length > 0 ? (
            <div className="max-h-32 overflow-y-auto space-y-2">
              {leadNotes.map((note: string, index: number) => (
                <div key={index} className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  {note}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No notes available.</div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">AI Summary</Label>
          {summaryError && (
            <Alert variant="destructive" className="mb-2">
              <AlertDescription>{summaryError}</AlertDescription>
            </Alert>
          )}
          {aiSummary && !isLoadingSummary && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {aiSummary}
              </div>
              <Button
                variant="outline"
                className="w-full text-primary border-primary hover:bg-primary/10"
                onClick={() => {
                  const blob = new Blob([aiSummary], { type: 'text/plain' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'ai-summary.txt';
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }}
              >
                <Calendar className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Download Summary</span>
              </Button>
            </div>
          )}
          <div className="space-y-2">
            <Input
              placeholder="Custom summary prompt..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="text-sm"
            />
            <Button 
              variant="outline" 
              className="w-full text-primary border-primary hover:bg-primary/10"
              onClick={handleGenerateAISummary}
              disabled={isLoadingSummary || !contactData?.id || !customPrompt.trim()}
            >
              {isLoadingSummary ? (
                <>
                  <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Generating Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Generate AI Summary</span>
                </>
              )}
            </Button>
          </div>
        </div>

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
