import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import ExistingKnowledgeList from "@/components/existing-knowledge-list";
import type { AIAgent } from "@/types";

interface AIKnowledgeTabProps {
  aiAgents: AIAgent[];
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  isLoadingAgents: boolean;
  addToAIError: string;
}

const AIKnowledgeTab: React.FC<AIKnowledgeTabProps> = ({
  aiAgents,
  selectedAgentId,
  setSelectedAgentId,
  isLoadingAgents,
  addToAIError,
}) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b">
        <CardTitle>AI Knowledge Management</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Review and manage the knowledge base of your AI agents
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="max-w-md mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Select AI Agent
          </Label>
          {isLoadingAgents ? (
            <div className="text-gray-500 text-sm">Loading agents...</div>
          ) : addToAIError ? (
            <div className="text-red-500 text-sm">{addToAIError}</div>
          ) : (
            <Select
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
              disabled={isLoadingAgents || aiAgents.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    aiAgents.length === 0
                      ? "No AI agent found"
                      : "Select AI agent"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {aiAgents.length === 0 ? (
                  <SelectItem value="no-agents" disabled>
                    No AI agent found
                  </SelectItem>
                ) : (
                  aiAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedAgentId ? (
          <div className="border rounded-lg">
            <ExistingKnowledgeList agentId={selectedAgentId} />
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select an AI Agent
            </h3>
            <p className="text-gray-500">
              Choose an AI agent to view and manage its knowledge base
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIKnowledgeTab;
