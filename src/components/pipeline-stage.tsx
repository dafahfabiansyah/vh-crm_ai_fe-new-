import { useState, useEffect, useRef } from "react";
import { LeadCard } from "./lead-card";
import { Badge } from "./ui/badge";
import { useDrop } from "react-dnd";
import type { Lead, PipelineStage } from "@/types";
import { Trash, Pencil, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { AgentsService } from "@/services/agentsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Bot } from "lucide-react";

const ITEM_TYPE = "LEAD";

// Pipeline Stage Component with Drop functionality
export const PipelineStageColumn: React.FC<{
  stage: PipelineStage;
  onDropLead: (leadId: string, targetStageId: string) => void;
  onUpdateLead: (leadId: string, newName: string) => void;
  onUpdateStage: (
    stageId: string,
    newName: string,
    newDescription?: string,
    id_agent?: string
  ) => void;
  onDeleteStage: (stageId: string) => void;
  onLeadClick: (lead: Lead) => void;
}> = ({
  stage,
  onDropLead,
  onUpdateLead,
  onUpdateStage,
  onDeleteStage,
  onLeadClick,
}) => {

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [agentName, setAgentName] = useState<string>("");
  // State untuk edit dialog
  const [editStageName, setEditStageName] = useState(stage.name);
  const [editStageDescription, setEditStageDescription] = useState(
    stage.description || ""
  );
  const [, setEditStageOrder] = useState<number>(
    stage.stage_order ?? 0
  );
  const [editAgents, setEditAgents] = useState<any[]>([]);
  const [editSelectedAgent, setEditSelectedAgent] = useState<string>(stage.agent_id || stage.id_agent || "");
  const [editAgentsLoading, setEditAgentsLoading] = useState(false);
  const [editAgentsError, setEditAgentsError] = useState<string | null>(null);
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter agents berdasarkan search query
  const filteredAgents = editAgents.filter((agent) =>
    agent.name?.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.user?.name?.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchAgentName = async () => {
      const agentId = stage.agent_id || stage.id_agent;
      console.log("🔍 Agent ID:", agentId);
      if (agentId) {
        try {
          const response = await AgentsService.getAgentDetails();
          console.log("📊 Agent Details Response:", response);

          // Handle paginated response structure
          const details = Array.isArray(response)
            ? response
            : (response as any)?.items || [];
          // console.log("📋 Details array:", details);

          if (Array.isArray(details) && details.length > 0) {
            // Filter berdasarkan agent ID yang kita butuhkan
            const agent = details.find((agent) => agent.id === agentId);
            // console.log("🎯 Found Agent:", agent);
            if (agent) {
              const name = agent.name || agent.user?.name || "";
              // console.log("👤 Setting Agent Name:", name);
              setAgentName(name);
              return;
            }
          }
        } catch (error) {
          console.error("❌ Error fetching agent details:", error);
        }
      }
    };
    fetchAgentName();
  }, [stage.id_agent, stage.agent_id]);

  useEffect(() => {
    if (!showEditDialog) return;
    setEditAgentsLoading(true);
    setEditAgentsError(null);
    setEditAgents([]);
    setAgentSearchQuery(""); // Reset search query ketika dialog dibuka
    setIsDropdownOpen(false); // Reset dropdown state
    AgentsService.getAgentDetails()
      .then((response) => {
        const items = Array.isArray(response)
          ? response
          : (response as any)?.items || [];
        setEditAgents(items);
      })
      .catch((err) => setEditAgentsError(err.message || "Gagal memuat data agent"))
      .finally(() => setEditAgentsLoading(false));
  }, [showEditDialog]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get selected agent name for display
  const getSelectedAgentName = () => {
    if (!editSelectedAgent) return "Pilih agent";
    const selectedAgent = editAgents.find(agent => agent.id === editSelectedAgent);
    return selectedAgent ? selectedAgent.name : "Pilih agent";
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; sourceStage: string }) => {
      if (item.sourceStage !== stage.id) {
        onDropLead(item.id, stage.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop as any}
      className={`w-[260px] min-w-[260px] max-w-[260px] h-full flex flex-col ${
        isOver && canDrop ? "bg-blue-50 border-blue-200" : ""
      }`}
    >
      <div className="">
        <div className="bg-white border border-gray-200 rounded-lg p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4 w-full">
            <div className="flex items-center gap-2 w-full min-w-0">
              <div
                className={`w-3 h-3 rounded-full bg-${stage.color}-500 flex-shrink-0`}
              />
              <div className="flex flex-col gap-1 min-w-0">
                <h3
                  className="font-medium text-gray-900 truncate"
                  title={stage.name}
                  style={{ minWidth: 0 }}
                >
                  {stage.name}
                </h3>
                {agentName && (
                  <div
                    className="flex items-center gap-1 text-xs text-gray-500"
                    title={`Handled by ${agentName}`}
                  >
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[80px]">{agentName}</span>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {stage.count}
              </Badge>
              <Button
                type="button"
                title="Edit stage"
                onClick={() => {
                  setEditStageName(stage.name);
                  setEditStageDescription(stage.description || "");
                  setEditStageOrder(stage.stage_order ?? 0);
                  setEditSelectedAgent(stage.agent_id || stage.id_agent || "");
                  setShowEditDialog(true);
                }}
                size="icon"
                className="ml-1 bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 p-0 flex-shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              title="Hapus stage"
              onClick={() => onDeleteStage(stage.id)}
              size="icon"
              className="ml-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 p-0 flex-shrink-0"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Stage</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdateStage(
                    stage.id,
                    editStageName.trim(),
                    editStageDescription.trim(),
                    editSelectedAgent
                  );
                  setShowEditDialog(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Stage
                  </label>
                  <input
                    type="text"
                    value={editStageName}
                    onChange={(e) => setEditStageName(e.target.value)}
                    className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deskripsi
                  </label>
                  <input
                    type="text"
                    value={editStageDescription}
                    onChange={(e) => setEditStageDescription(e.target.value)}
                    className="w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stage-agent">Pilih Agent</Label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      disabled={editAgentsLoading || editAgents.length === 0}
                      className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between"
                    >
                      <span className={editSelectedAgent ? "text-gray-900" : "text-gray-500"}>
                        {editAgentsLoading ? "Memuat agent..." : getSelectedAgentName()}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
                        <div className="p-2 border-b">
                          <Input
                            placeholder="Cari agent..."
                            value={agentSearchQuery}
                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                            className="w-full"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredAgents.length === 0 && agentSearchQuery ? (
                            <div className="p-3 text-sm text-gray-500 text-center">
                              Tidak ada agent yang ditemukan
                            </div>
                          ) : (
                            filteredAgents.map((agent: any) => (
                              <button
                                key={agent.id}
                                type="button"
                                onClick={() => {
                                  setEditSelectedAgent(agent.id);
                                  setIsDropdownOpen(false);
                                  setAgentSearchQuery("");
                                }}
                                className="w-full p-3 text-left hover:bg-gray-50 focus:bg-gray-50 flex items-center gap-2"
                              >
                                {agent.agent_type === "AI" ? (
                                  <Bot className="h-4 w-4 text-green-600" />
                                ) : (
                                  <User className="h-4 w-4 text-blue-600" />
                                )}
                                <span className="flex-1">{agent.name}</span>
                                <span className="text-xs text-gray-500">
                                  {agent.agent_type === "AI" ? "AI" : "Human"}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {editAgentsError && (
                    <div className="text-red-600 text-xs mt-1">{editAgentsError}</div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Batal
                    </Button>
                  </DialogClose>
                  <Button type="submit" variant="default">
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {!isOver && canDrop && (
            <div className="text-xs text-gray-500 mb-2 ml-1 truncate max-w-full">
              {stage.description}
            </div>
          )}
          <div className="space-y-3 min-h-[200px]">
            {stage.leads.map((lead, index) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                index={index}
                stageId={stage.id}
                onUpdateLead={onUpdateLead}
                onLeadClick={onLeadClick}
              />
            ))}
            {isOver && canDrop && (
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center text-blue-600 bg-blue-50">
                Drop lead here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
