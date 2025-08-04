"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FilterChatModal, { type FilterData } from "@/components/filter-chat-modal";
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
  Check,
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
import StartChatModal from "@/components/start-chat-modal";

interface ChatHistoryListProps {
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab?: "assigned" | "unassigned" | "resolved";
  onTabChange?: (tab: "assigned" | "unassigned" | "resolved") => void;
  onStartChatSuccess?: (message: string) => void;
  onStartChatError?: (error: string) => void;
}

export default function ChatHistoryList({
  selectedContactId,
  onSelectContact,
  searchQuery,
  onSearchChange,
  activeTab: controlledActiveTab,
  onTabChange,
  onStartChatSuccess,
  onStartChatError,
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
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isStartChatModalOpen, setIsStartChatModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filter states
  const [filterData, setFilterData] = useState<FilterData>({
    dateFrom: "",
    dateTo: "",
    agent: "",
    aiAgent: "",
    status: "",
    inbox: "",
  });

  // Date picker states - removed as they're now handled in FilterChatModal

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
    // Reset agent filter when tab changes for better UX
    setSelectedAgent("all");
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

    // Filter berdasarkan agent yang dipilih
    const matchesAgent = (() => {
      if (!selectedAgent || selectedAgent === "all") {
        return true;
      }

      // Get agent name from contact
      const agentName = contact.agent_name || contact.assigned_agent_name || "";

      // Check if it matches AI agent
      const matchesAiAgent = aiAgents.some(
        (agent) =>
          `ai-${agent.id}` === selectedAgent && agent.name === agentName
      );

      // Check if it matches human agent
      const matchesHumanAgent = humanAgents.some(
        (agent) =>
          `human-${agent.id}` === selectedAgent &&
          (agent.name === agentName || agent.user?.name === agentName)
      );

      return matchesAiAgent || matchesHumanAgent;
    })();

    // Filter berdasarkan date range
    const matchesDateRange = (() => {
      if (!filterData.dateFrom && !filterData.dateTo) {
        return true;
      }

      const contactDate = new Date(contact.last_message_at);
      const fromDate = filterData.dateFrom
        ? new Date(filterData.dateFrom)
        : null;
      const toDate = filterData.dateTo ? new Date(filterData.dateTo) : null;

      if (fromDate && contactDate < fromDate) return false;
      if (toDate && contactDate > toDate) return false;

      return true;
    })();

    // Filter berdasarkan human agent dari modal filter
    const matchesFilterAgent = (() => {
      if (!filterData.agent || filterData.agent === "#") return true;

      const agentName = contact.agent_name || contact.assigned_agent_name || "";
      // Check if this agent exists in humanAgents list and matches filter
      const isHumanAgent = humanAgents.some(
        (agent) => agent.name === agentName || agent.user?.name === agentName
      );
      return (
        isHumanAgent &&
        agentName.toLowerCase().includes(filterData.agent.toLowerCase())
      );
    })();

    // Filter berdasarkan AI agent dari modal filter
    const matchesFilterAiAgent = (() => {
      if (!filterData.aiAgent || filterData.aiAgent === "#") return true;

      const agentName = contact.agent_name || contact.assigned_agent_name || "";
      // Check if this agent exists in aiAgents list and matches filter
      const isAiAgent = aiAgents.some((agent) => agent.name === agentName);
      return (
        isAiAgent &&
        agentName.toLowerCase().includes(filterData.aiAgent.toLowerCase())
      );
    })();

    // Filter berdasarkan status dari modal filter
    const matchesFilterStatus = (() => {
      if (!filterData.status || filterData.status === "#") return true;
      return contact.lead_status === filterData.status;
    })();

    // Filter berdasarkan inbox/platform
    const matchesFilterInbox = (() => {
      if (!filterData.inbox || filterData.inbox === "#") return true;
      const platformName = contact.platform_name || "";
      return platformName
        .toLowerCase()
        .includes(filterData.inbox.toLowerCase());
    })();

    return (
      matchesSearch &&
      matchesTab &&
      matchesAgent &&
      matchesDateRange &&
      matchesFilterAgent &&
      matchesFilterAiAgent &&
      matchesFilterStatus &&
      matchesFilterInbox
    );
  });

  const handleStartChatClick = () => {
    setIsStartChatModalOpen(true);
  };

  const handleStartChatSuccess = (message: string) => {
    setIsStartChatModalOpen(false);
    onStartChatSuccess?.(message);
  };

  const handleStartChatError = (error: string) => {
    onStartChatError?.(error);
  };

  const handleFilterClick = () => {
    setIsFilterModalOpen(true);
  };

  const handleApplyFilter = () => {
    setIsFilterModalOpen(false);
  };

  const handleResetFilter = () => {
    setFilterData({
      dateFrom: "",
      dateTo: "",
      agent: "",
      aiAgent: "",
      status: "",
      inbox: "",
    });
  };

  const handleFilterDataChange = (newFilterData: FilterData) => {
    setFilterData(newFilterData);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return !!(
      filterData.dateFrom ||
      filterData.dateTo ||
      filterData.agent ||
      filterData.aiAgent ||
      filterData.status ||
      filterData.inbox
    );
  };

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
                <span className="truncate text-xs sm:text-sm">
                  {agentsLoading
                    ? "Loading..."
                    : selectedAgent && selectedAgent !== "all"
                    ? (() => {
                        // Find selected agent name
                        const aiAgent = aiAgents.find(
                          (agent) => `ai-${agent.id}` === selectedAgent
                        );
                        if (aiAgent) {
                          const name = aiAgent.name;
                          return name.length > 10
                            ? `${name.substring(0, 8)}...`
                            : name;
                        }

                        const humanAgent = humanAgents.find(
                          (agent) => `human-${agent.id}` === selectedAgent
                        );
                        if (humanAgent) {
                          const name =
                            humanAgent.name ||
                            humanAgent.user?.name ||
                            "Unknown";
                          return name.length > 10
                            ? `${name.substring(0, 8)}...`
                            : name;
                        }

                        return "All Agents";
                      })()
                    : "All Agents"}
                </span>
                <MoreHorizontal className="h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => setSelectedAgent("all")}
                className="flex items-center justify-between"
              >
                <span>All Agents</span>
                {(!selectedAgent || selectedAgent === "all") && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
              {aiAgents.map((agent) => (
                <DropdownMenuItem
                  key={`ai-${agent.id}`}
                  onClick={() => setSelectedAgent(`ai-${agent.id}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="h-3 w-3 text-blue-500" />
                    <span>{agent.name}</span>
                  </div>
                  {selectedAgent === `ai-${agent.id}` && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
              {humanAgents.map((agent) => (
                <DropdownMenuItem
                  key={`human-${agent.id}`}
                  onClick={() => setSelectedAgent(`human-${agent.id}`)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-green-500" />
                    <span>{agent.name || agent.user?.name || "Unknown"}</span>
                  </div>
                  {selectedAgent === `human-${agent.id}` && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`h-8 w-8 sm:h-10 sm:w-10 hover:bg-primary/10 hover:text-primary transition-colors relative ${
                hasActiveFilters()
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : ""
              }`}
              onClick={handleFilterClick}
              title="Filter Percakapan"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              {hasActiveFilters() && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">
                    {
                      [
                        filterData.dateFrom,
                        filterData.dateTo,
                        filterData.agent,
                        filterData.aiAgent,
                        filterData.status,
                        filterData.inbox,
                      ].filter(Boolean).length
                    }
                  </span>
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={handleStartChatClick}
              title="Mulai Chat Baru"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
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

      {/* Start Chat Modal */}
      <StartChatModal
        isOpen={isStartChatModalOpen}
        onOpenChange={setIsStartChatModalOpen}
        onSuccess={handleStartChatSuccess}
        onError={handleStartChatError}
      />

      <FilterChatModal
        isOpen={isFilterModalOpen}
        onOpenChange={setIsFilterModalOpen}
        filterData={filterData}
        onFilterChange={handleFilterDataChange}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        humanAgents={humanAgents}
        aiAgents={aiAgents}
        contacts={contacts}
      />
    </div>
  );
}
