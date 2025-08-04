"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Filter,
  CheckCircle2,
  User,
  Bot,
  MessageCircle,
  CalendarIcon,
} from "lucide-react";
import type { Contact } from "@/services";
import type { AIAgent } from "@/types";
import type { HumanAgent } from "@/services/humanAgentsService";

interface FilterData {
  dateFrom: string;
  dateTo: string;
  agent: string;
  aiAgent: string;
  status: string;
  inbox: string;
}

interface FilterChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterData: FilterData;
  onFilterChange: (filterData: FilterData) => void;
  contacts: Contact[];
  aiAgents: AIAgent[];
  humanAgents: HumanAgent[];
  onApply: () => void;
  onReset: () => void;
}

export default function FilterChatModal({
  isOpen,
  onOpenChange,
  filterData,
  onFilterChange,
  contacts,
  aiAgents,
  humanAgents,
  onApply,
  onReset,
}: FilterChatModalProps) {
  // Date picker states
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  // Get unique platform names for inbox filter
  const getUniqueInboxes = () => {
    const inboxes = contacts
      .map((contact) => contact.platform_name)
      .filter(Boolean)
      .filter(
        (value, index, self) => self.indexOf(value) === index
      ) as string[];
    return inboxes;
  };

  // Get unique human agent names for agent filter
  const getUniqueHumanAgents = () => {
    const humanAgentNames = humanAgents
      .map((agent) => agent.name || agent.user?.name)
      .filter(Boolean) as string[];

    // Also get agent names from contacts that match human agents
    const contactAgentNames = contacts
      .map((contact) => contact.agent_name || contact.assigned_agent_name)
      .filter(Boolean)
      .filter((agentName) =>
        humanAgents.some(
          (agent) => agent.name === agentName || agent.user?.name === agentName
        )
      ) as string[];

    const allHumanAgents = [...humanAgentNames, ...contactAgentNames];
    return [...new Set(allHumanAgents)]; // Remove duplicates
  };

  // Get unique AI agent names for AI agent filter
  const getUniqueAiAgents = () => {
    const aiAgentNames = aiAgents
      .map((agent) => agent.name)
      .filter(Boolean) as string[];

    // Also get agent names from contacts that match AI agents
    const contactAgentNames = contacts
      .map((contact) => contact.agent_name || contact.assigned_agent_name)
      .filter(Boolean)
      .filter((agentName) =>
        aiAgents.some((agent) => agent.name === agentName)
      ) as string[];

    const allAiAgents = [...aiAgentNames, ...contactAgentNames];
    return [...new Set(allAiAgents)]; // Remove duplicates
  };

  const updateFilterData = (updates: Partial<FilterData>) => {
    onFilterChange({ ...filterData, ...updates });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-primary text-lg">
            <Filter className="h-5 w-5" />
            Filter Percakapan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range - Full width */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Rentang Tanggal
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Dari</Label>
                <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterData.dateFrom
                        ? new Date(filterData.dateFrom).toLocaleDateString(
                            "id-ID"
                          )
                        : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        filterData.dateFrom
                          ? new Date(filterData.dateFrom)
                          : undefined
                      }
                      onSelect={(date) => {
                        updateFilterData({
                          dateFrom: date ? date.toISOString().split("T")[0] : "",
                        });
                        setDateFromOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Sampai
                </Label>
                <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterData.dateTo
                        ? new Date(filterData.dateTo).toLocaleDateString(
                            "id-ID"
                          )
                        : "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        filterData.dateTo
                          ? new Date(filterData.dateTo)
                          : undefined
                      }
                      onSelect={(date) => {
                        updateFilterData({
                          dateTo: date ? date.toISOString().split("T")[0] : "",
                        });
                        setDateToOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* 2x2 Grid for other filters */}
          <div className="space-y-3">
            {/* Row 1: Agent, AI Agent (2 columns) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Agent (Human) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Agent
                </Label>
                <Select
                  value={filterData.agent}
                  onValueChange={(value) => updateFilterData({ agent: value })}
                >
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Semua Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#">Semua Agent</SelectItem>
                    {getUniqueHumanAgents().map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AI Agent */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Agent
                </Label>
                <Select
                  value={filterData.aiAgent}
                  onValueChange={(value) => updateFilterData({ aiAgent: value })}
                >
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Semua AI Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#">Semua AI Agent</SelectItem>
                    {getUniqueAiAgents().map((agent) => (
                      <SelectItem key={agent} value={agent}>
                        {agent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Inbox, Status (2 columns) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Inbox
                </Label>
                <Select
                  value={filterData.inbox}
                  onValueChange={(value) => updateFilterData({ inbox: value })}
                >
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Semua Inbox" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#">Semua Inbox</SelectItem>
                    {getUniqueInboxes().map((inbox) => (
                      <SelectItem key={inbox} value={inbox}>
                        {inbox}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Status
                </Label>
                <Select
                  value={filterData.status}
                  onValueChange={(value) => updateFilterData({ status: value })}
                >
                  <SelectTrigger className="text-sm w-full">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="#">Semua Status</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="flex-1 sm:flex-none"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="flex-1 bg-primary text-white"
          >
            Terapkan Filter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { FilterData };
