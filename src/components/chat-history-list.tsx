"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  CheckCheck,
  Loader2,
  User,
  Bot,
  MessageCircle,
  Instagram,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContacts } from "@/hooks";
import type { Contact } from "@/services";
import { AgentsService } from "@/services/agentsService";
import { HumanAgentsService } from "@/services/humanAgentsService";
import type { AIAgent } from "@/types";
import type { HumanAgent } from "@/services/humanAgentsService";

interface ChatHistoryListProps {
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab?: "assigned" | "unassigned" | "resolved";
  onTabChange?: (tab: "assigned" | "unassigned" | "resolved") => void;
}

export default function ChatHistoryList({
  selectedContactId,
  onSelectContact,
  searchQuery,
  onSearchChange,
  activeTab: controlledActiveTab,
  onTabChange,
}: ChatHistoryListProps) {
  const {
    contacts,
    loading,
    error,
    assignedCount,
    unassignedCount,
    resolvedCount,
  } = useContacts();
  const [internalActiveTab, setInternalActiveTab] = useState<
    "assigned" | "unassigned" | "resolved"
  >("assigned");
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [humanAgents, setHumanAgents] = useState<HumanAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);

  // Fetch agents data
  useEffect(() => {
    const fetchAgents = async () => {
      setAgentsLoading(true);
      try {
        const [aiAgentsData, humanAgentsData] = await Promise.all([
          AgentsService.getAgents(),
          HumanAgentsService.getHumanAgents(),
        ]);
        setAiAgents(aiAgentsData);
        setHumanAgents(humanAgentsData);
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tab: "assigned" | "unassigned" | "resolved") => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const filteredContacts = contacts.filter((contact: Contact) => {
    // Filter berdasarkan search query
    const matchesSearch =
      contact.push_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.last_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contact_identifier
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Filter berdasarkan tab yang aktif
    const matchesTab = (() => {
      switch (activeTab) {
        case "assigned":
          return contact.lead_status === "assigned";
        case "unassigned":
          return contact.lead_status === "unassigned";
        case "resolved":
          return contact.lead_status === "resolved";
        default:
          return true;
      }
    })();

    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "unassigned":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case "WhatsApp":
        return <MessageCircle className="h-3 w-3 text-green-600" />;
      case "Instagram":
        return <Instagram className="h-3 w-3 text-pink-600" />;
      case "Website":
        return <Globe className="h-3 w-3 text-blue-600" />;
      default:
        return <MessageCircle className="h-3 w-3 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    // Convert UTC timestamp to UTC+7 (WIB - Western Indonesia Time)
    const date = new Date(timestamp);
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const wibTime = new Date(utcTime + 7 * 3600000); // UTC+7

    const now = new Date();
    const nowUtc = now.getTime() + now.getTimezoneOffset() * 60000;
    const nowWib = new Date(nowUtc + 7 * 3600000);

    const diffInMinutes = Math.floor(
      (nowWib.getTime() - wibTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} Menit yang lalu`;
    } else if (diffInMinutes < 1440) {
      // Less than 24 hours
      const diffInHours = Math.floor(diffInMinutes / 60);
      return `${diffInHours} Jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInMinutes / 1440);
      return `${diffInDays} Hari yang lalu`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="justify-between w-24 sm:w-32"
                disabled={agentsLoading}
              >
                <span className="truncate">
                  {agentsLoading ? "Loading..." : "All Agents"}
                </span>
                <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Agents</DropdownMenuItem>
              {aiAgents.map((agent) => (
                <DropdownMenuItem key={`ai-${agent.id}`}>
                  {/* <Bot className="h-3 w-3 text-primary" /> : */}
                  {agent.name}
                </DropdownMenuItem>
              ))}
              {humanAgents.map((agent) => (
                <DropdownMenuItem key={`human-${agent.id}`}>
                  {/* <UsersRound className="h-3 w-3 text-primary" /> : */}
                  {agent.name || agent.user?.name || "Unknown"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari percakapan..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 text-sm overflow-x-auto scrollbar-thin pb-2 min-w-0">
          <div className="flex gap-1 sm:gap-2 flex-nowrap">
            <button
              onClick={() => handleTabChange("assigned")}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors flex-shrink-0 text-xs sm:text-sm ${
                activeTab === "assigned"
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "hover:bg-accent/50 text-muted-foreground"
              }`}
            >
              <span>Assigned</span>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  activeTab === "assigned"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {assignedCount}
              </Badge>
            </button>

            <button
              onClick={() => handleTabChange("unassigned")}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors flex-shrink-0 text-xs sm:text-sm ${
                activeTab === "unassigned"
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "hover:bg-accent/50 text-muted-foreground"
              }`}
            >
              <span>Unassigned</span>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  activeTab === "unassigned"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-destructive text-primary-foreground"
                }`}
              >
                {unassignedCount}
              </Badge>
            </button>

            <button
              onClick={() => handleTabChange("resolved")}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-colors flex-shrink-0 text-xs sm:text-sm ${
                activeTab === "resolved"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "hover:bg-accent/50 text-muted-foreground"
              }`}
            >
              <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4" />
              <Badge
                variant="secondary"
                className={`text-xs ${
                  activeTab === "resolved"
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-500 text-white"
                }`}
              >
                {resolvedCount}
              </Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab Indicator */}
        {/* <div className="p-3 bg-accent/30 border-b border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">
              {activeTab === 'assigned' ? 'Assigned' : 
               activeTab === 'unassigned' ? 'Unassigned' : 'Resolved'}
            </span> conversations ({filteredSessions.length})
          </p>
        </div> */}

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-destructive mb-2">Error loading contacts</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="p-8 text-center capitalize">
            <p className="text-muted-foreground">tidak ada percakapan</p>
            <p className="text-sm text-muted-foreground mt-1">
              cek tab lain atau mulai percakapan baru
            </p>
          </div>
        ) : (
          filteredContacts.map((contact: Contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-3 sm:p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                selectedContactId === contact.id
                  ? "bg-accent border-l-4 border-l-primary"
                  : ""
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                      {contact.push_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.unread_messages > 0 && (
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 h-2 w-2 sm:h-3 sm:w-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
                      {contact.push_name}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTimestamp(contact.last_message_at)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground truncate mb-1">
                    {contact.last_message}
                  </p>

                  <div className="flex items-center gap-1 mb-2">
                    {getSourceTypeIcon(contact.source_type || "")}
                    <p className="text-xs text-muted-foreground truncate">
                      {contact.platform_name || "-"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {contact.lead_status === "resolved" ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : contact.lead_status === "assigned" ? (
                        <>
                          <User className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-muted-foreground truncate">
                            {contact.agent_name ||
                              contact.assigned_agent_name ||
                              "-"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Bot className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-muted-foreground truncate">
                            {contact.agent_name ||
                              contact.assigned_agent_name ||
                              "-"}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {contact.unread_messages > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-red-100 text-red-800"
                        >
                          {contact.unread_messages}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(
                          contact.lead_status
                        )}`}
                      >
                        {contact.lead_status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
