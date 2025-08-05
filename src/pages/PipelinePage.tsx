"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MainLayout from "@/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Users,
  Trash,
  Bot,
  User,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { Lead, PipelineStage } from "@/types";
import { PipelineStageColumn } from "@/components/pipeline-stage";
import PipelineService, {
  type PipelineListResponse,
} from "@/services/pipelineService";

import ChatConversation from "@/components/chat-conversation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ContactsService } from "@/services/contactsService";
import type {
  LeadTransferHistoryItem,
  LeadTransferHistoryResponse,
} from "@/types/interface";
import { HumanAgentsService } from "@/services/humanAgentsService";
import { Toast } from "@/components/ui/toast";

const PipelinePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pipelineId = searchParams.get("id");

  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelineInfo, setPipelineInfo] = useState<PipelineListResponse | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddStageOpen, setIsAddStageOpen] = useState(false);
  const [stageName, setStageName] = useState("");
  const [stageDescription, setStageDescription] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [agents, setAgents] = useState<any[]>([]);
  const [isSubmittingStage, setIsSubmittingStage] = useState(false);
  const [addStageError, setAddStageError] = useState<string | null>(null);
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>("");
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const agentDropdownRef = useRef<HTMLDivElement>(null);

  // Filter agents berdasarkan search query
  const filteredAgents = agents.filter((agent) =>
    agent.name?.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.user?.name?.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

  // Get selected agent name for display
  const getSelectedAgentName = () => {
    if (!selectedAgent) return "Pilih agent";
    const selectedAgentObj = agents.find(agent => agent.id === selectedAgent);
    return selectedAgentObj ? selectedAgentObj.name : "Pilih agent";
  };
  const [, setAiAgents] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null
  );
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [leadTransferHistory, setLeadTransferHistory] = useState<
    LeadTransferHistoryItem[]
  >([]);
  const [agentNames, setAgentNames] = useState<{ [id: string]: string }>({});
  const [humanAgentNames, setHumanAgentNames] = useState<{
    [id: string]: string;
  }>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadNotes, setLeadNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: "pipeline" | "stage" | null;
    targetId?: string;
  }>({ open: false, type: null });
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    description: string;
  } | null>(null);

  const handleLeadClick = (lead: any) => {
    setSelectedContactId(lead.id_contact);
    setSelectedLeadId(lead.id); // <-- simpan lead id
    // Cari contact yang id-nya sama dengan lead.id_contact
    const contact = contacts.find((c: any) => c.id === lead.id_contact);
    if (contact) {
      setSelectedContact(contact);
    } else {
      setSelectedContact({
        push_name: lead.name || "Unknown",
        contact_identifier: "-", // fallback
        lead_status: lead.status || "unassigned",
      });
      setToast({
        show: true,
        type: "error",
        title: "Contact Not Found",
        description: "Contact untuk lead ini tidak ditemukan!",
      });
    }
  };

  useEffect(() => {
    // console.log('selectedContactId:', selectedContactId, 'selectedContact:', selectedContact);
  }, [selectedContactId, selectedContact]);

  useEffect(() => {
    // Fetch all contacts once
    ContactsService.getContacts().then((res: any) => setContacts(res.items));
  }, []);

  const handleDropLead = useCallback(
    async (leadId: string, targetStageId: string) => {
      setPipelineData((prev) => {
        const newData = [...prev];

        // Find source stage and lead
        let leadToMove: Lead | undefined;
        for (let i = 0; i < newData.length; i++) {
          const stage = newData[i];
          const idx = stage.leads.findIndex((lead) => lead.id === leadId);
          if (idx >= 0) {
            leadToMove = stage.leads[idx];
            stage.leads.splice(idx, 1);
            stage.count--;
            break;
          }
        }

        // Add to target stage
        if (leadToMove) {
          // Update moved_by/source to 'human' di state lokal
          const updatedLead = { ...leadToMove, source: "human" };
          const targetStage = newData.find(
            (stage) => stage.id === targetStageId
          );
          if (targetStage) {
            targetStage.leads.push(updatedLead);
            targetStage.count++;
          }
        }

        return newData;
      });
      // PATCH ke backend
      try {
        // Cari agent_id dari stage tujuan
        const targetStage = pipelineData.find(
          (stage) => stage.id === targetStageId
        );
        const assigned_to = targetStage?.agent_id || null;
        await PipelineService.moveLeadCard(leadId, {
          id_stage: targetStageId,
          moved_by: "Human",
          assigned_to: assigned_to,
        });
      } catch (err) {
        // TODO: tampilkan error jika perlu
        console.error("Failed to move lead card:", err);
      }
    },
    [pipelineData]
  );

  const handleUpdateLead = useCallback((leadId: string, newName: string) => {
    setPipelineData((prev) => {
      const newData = [...prev];

      // Find and update the lead
      for (const stage of newData) {
        const leadIndex = stage.leads.findIndex((lead) => lead.id === leadId);
        if (leadIndex >= 0) {
          stage.leads[leadIndex] = {
            ...stage.leads[leadIndex],
            name: newName,
          };
          break;
        }
      }

      return newData;
    });
  }, []);

  const handleUpdateStage = useCallback(
    async (
      stageId: string,
      newName: string,
      newDescription?: string,
      id_agent?: string
    ) => {
      setPipelineData((prev) => {
        const newData = [...prev];
        const stageIndex = newData.findIndex((stage) => stage.id === stageId);
        if (stageIndex >= 0) {
          newData[stageIndex] = {
            ...newData[stageIndex],
            name: newName,
            description: newDescription ?? newData[stageIndex].description,
            ...(id_agent ? { agent_id: id_agent, id_agent } : {}),
          };
        }
        return newData;
      });
      // Update ke backend
      const stage = pipelineData.find((s) => s.id === stageId);
      if (stage) {
        try {
          await PipelineService.updateStage(stageId, {
            name: newName,
            description: stage.description ?? "",
            stage_order: stage.stage_order ?? 0,
            ...(id_agent ? { id_agent } : {}),
          });
        } catch (err) {
          // TODO: tampilkan error jika perlu
          console.error("Failed to update stage:", err);
        }
      }
    },
    [pipelineData]
  );

  const handleDeletePipeline = () => {
    if (!pipelineId || !pipelineInfo) return;
    setDeleteDialog({ open: true, type: "pipeline", targetId: pipelineId });
  };

  const confirmDeletePipeline = async () => {
    if (!pipelineId) return;
    setIsDeleting(true);
    try {
      await PipelineService.deletePipeline(pipelineId);
      setToast({
        show: true,
        type: "success",
        title: "Pipeline Deleted",
        description: `Pipeline berhasil dihapus.`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Delete Failed",
        description:
          error.message || "Failed to delete pipeline. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, type: null });
    }
  };

  const handleDeleteStage = (stageId: string) => {
    setDeleteDialog({ open: true, type: "stage", targetId: stageId });
  };

  const confirmDeleteStage = async () => {
    if (!deleteDialog.targetId) return;
    try {
      await PipelineService.deleteStage(deleteDialog.targetId);
      setToast({
        show: true,
        type: "success",
        title: "Stage Deleted",
        description: `Stage berhasil dihapus.`,
      });

      // Update state lokal terlebih dahulu untuk menghindari delay
      setPipelineData((prev) =>
        prev.filter((stage) => stage.id !== deleteDialog.targetId)
      );
    } catch (err: any) {
      setToast({
        show: true,
        type: "error",
        title: "Delete Failed",
        description: err.message || "Gagal menghapus stage",
      });
    } finally {
      setDeleteDialog({ open: false, type: null });
    }
  };

  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0);
  const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0);

  // Refactor: extract fetchPipelineData so it can be called from anywhere
  const fetchPipelineData = useCallback(async () => {
    if (!pipelineId) {
      console.log("No pipeline ID provided");
      console.log("No pipeline ID provided");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch pipeline info by ID
      const pipeline = await PipelineService.getPipelineById(pipelineId);
      setPipelineInfo(pipeline);

      // Fetch stages dari backend (sudah filter by id_pipeline, tapi filter manual juga)
      let stages = await PipelineService.getStages({ id_pipeline: pipelineId });
      stages = stages.filter((stage: any) => stage.id_pipeline === pipelineId);

      // Jika tidak ada stages, set array kosong dan return
      if (stages.length === 0) {
        setPipelineData([]);
        return;
      }

      // Fetch leads per stage, filter manual juga
      const leadsByStage = {} as Record<string, any[]>;
      const stageLeadsResults = await Promise.all(
        stages.map((stage: any) =>
          PipelineService.getLeadsByStageId
            ? PipelineService.getLeadsByStageId(stage.id).then(
                (leads: any[]) => {
                  // Filter leads yang id_pipeline-nya sama
                  const filteredLeads = (leads || []).filter(
                    (lead: any) => lead.id_pipeline === pipelineId
                  );
                  return { stageId: stage.id, leads: filteredLeads };
                }
              )
            : PipelineService.getLeads({ id_stage: stage.id }).then(
                (leads: any[]) => {
                  // Filter leads yang id_pipeline-nya sama
                  const filteredLeads = (leads || []).filter(
                    (lead: any) => lead.id_pipeline === pipelineId
                  );
                  return { stageId: stage.id, leads: filteredLeads };
                }
              )
        )
      );
      stageLeadsResults.forEach(
        ({ stageId, leads }: { stageId: string; leads: any[] }) => {
          leadsByStage[stageId] = leads.map((lead: any) => ({
            id: lead.id,
            name: lead.name,
            phone: lead.phone || "",
            value: lead.potential_value || 0,
            source: lead.moved_by || "unknown",
            moved_by: lead.moved_by || "unknown",
            daysAgo: 0,
            status: lead.status || "unknown",
            email: lead.email || "",
            company: lead.company || "",
            location: lead.location || "",
            notes: lead.notes || "",
            createdAt: lead.created_at,
            lastActivity: lead.updated_at,
            timeline: lead.timeline || [],
            id_contact: lead.id_contact,
          }));
        }
      );
      // Mapping ke struktur PipelineStage
      const mappedStagesFinal = stages.map((stage: any, idx: number) => {
        const stageLeads = leadsByStage[stage.id] || [];
        return {
          id: stage.id,
          name: stage.name,
          description: stage.description,
          color: [
            "bg-blue-100 text-blue-800",
            "bg-yellow-100 text-yellow-800",
            "bg-orange-100 text-orange-800",
            "bg-green-100 text-green-800",
            "bg-purple-100 text-purple-800",
            "bg-red-100 text-red-800",
          ][idx % 6],
          leads: stageLeads,
          count: stageLeads.length,
          value: stageLeads.reduce((sum, l) => sum + (l.value || 0), 0),
          stage_order: stage.stage_order ?? idx,
          agent_id: stage.id_agent || undefined,
        };
      });
      setPipelineData(mappedStagesFinal);
    } catch (error: any) {
      console.error("Error fetching pipeline:", error);
      setError(error.message || "Failed to load pipeline");
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId]);

  // Fetch pipeline data when component mounts or pipeline ID changes
  useEffect(() => {
    fetchPipelineData();
    // Reset state jika pipelineId berubah
    setPipelineData([]);
    setSelectedLead(null);
  }, [pipelineId, fetchPipelineData]);

  // Fetch agents for select
  useEffect(() => {
    if (!isAddStageOpen) return;
    setAddStageError(null);
    setIsSubmittingStage(false);
    setAgents([]);
    setSelectedAgent("");
    setAgentSearchQuery(""); // Reset search query
    setIsAgentDropdownOpen(false); // Reset dropdown state
    import("@/services/axios").then((axiosInstanceModule) => {
      const axiosInstance = axiosInstanceModule.default;
      axiosInstance
        .get("/v1/agents/details")
        .then((response) => {
          const items = response.data?.items || response.data || [];
          // Pastikan items adalah array
          const agentsArray = Array.isArray(items) ? items : [];
          // Tampilkan SEMUA agent_type, tidak perlu filter
          setAgents(agentsArray);
        })
        .catch((err) =>
          setAddStageError(err.message || "Gagal memuat data agent")
        );
    });
  }, [isAddStageOpen]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setIsAgentDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch AI agents saat mount
  useEffect(() => {
    import("@/services/humanAgentsService").then(({ HumanAgentsService }) => {
      HumanAgentsService.getHumanAgents()
        .then((allAgents) => {
          const aiAgents = allAgents.filter(
            (agent) => agent.agent_type === "AI"
          );
          setAiAgents(aiAgents);
        })
        .catch(() => setAiAgents([]));
    });
  }, []);

  // Fetch all human agents for mapping id to name
  useEffect(() => {
    import("@/services/axios").then((axiosInstanceModule) => {
      const axiosInstance = axiosInstanceModule.default;
      axiosInstance
        .get("/v1/agents/human")
        .then((response) => {
          const items = response.data?.items || [];
          const mapping: { [id: string]: string } = {};
          items.forEach((agent: any) => {
            mapping[agent.id] =
              agent.user?.name || agent.identifier || agent.id;
          });
          setHumanAgentNames(mapping);
        })
        .catch(() => setHumanAgentNames({}));
    });
  }, []);

  useEffect(() => {
    if (!selectedLeadId) {
      setLeadTransferHistory([]);
      setHistoryError(null);
      setLeadNotes([]);
      setNotesError(null);
      return;
    }
    setIsLoadingHistory(true);
    setHistoryError(null);
    PipelineService.getLeadTransferHistoryByLeadId(selectedLeadId)
      .then((res: LeadTransferHistoryResponse) => {
        setLeadTransferHistory(res.items || []);
      })
      .catch((err: any) => {
        setHistoryError(err.message || "Gagal memuat riwayat transfer lead");
        setLeadTransferHistory([]);
      })
      .finally(() => setIsLoadingHistory(false));

    // Get lead notes from the selected lead data
    setIsLoadingNotes(true);
    setNotesError(null);

    // Find the selected lead and get its notes
    let selectedLead = null;
    if (pipelineData.length > 0) {
      for (const stage of pipelineData) {
        const lead = stage.leads.find((l) => l.id === selectedLeadId);
        if (lead) {
          selectedLead = lead;
          break;
        }
      }
    }

    if (selectedLead && selectedLead.notes) {
      // Split notes by newlines to create separate note entries
      const notesArray = selectedLead.notes
        .split("\n")
        .filter((note) => note.trim() !== "");
      setLeadNotes(notesArray.length > 0 ? notesArray : []);
    } else {
      setLeadNotes([]);
    }
    setIsLoadingNotes(false);
  }, [selectedLeadId, pipelineData]);

  const fetchAgentName = async (agentId: string) => {
    if (!agentId || agentNames[agentId]) return;
    try {
      const agent = await HumanAgentsService.getHumanAgent(agentId);
      setAgentNames((prev) => ({
        ...prev,
        [agentId]: agent.name || agent.identifier || agentId,
      }));
    } catch {
      setAgentNames((prev) => ({ ...prev, [agentId]: agentId }));
    }
  };

  function LeadTransferTimeline({
    history,
  }: {
    history: LeadTransferHistoryItem[];
  }) {
    return (
      <div className="max-h-100 overflow-y-auto pr-2">
        <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2">
          {history
            .slice()
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((item) => {
              if (
                item.moved_by_agent_id &&
                !agentNames[item.moved_by_agent_id]
              ) {
                fetchAgentName(item.moved_by_agent_id);
              }
              return (
                <li className="mb-6 ml-4" key={item.id}>
                  <div className="absolute w-3 h-3 bg-emerald-200 border-2 border-emerald-500 rounded-full -left-1.5 mt-1.5"></div>
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {item.from_stage_name} ➔ {item.to_stage_name}
                  </div>
                  <div className="text-xs text-gray-700 mb-1">
                    Pipeline: {item.from_pipeline_name} ➔{" "}
                    {item.to_pipeline_name}
                  </div>
                  <div className="text-xs text-gray-700 mb-1">
                    Agent: {item.from_agent_name} ➔ {item.to_agent_name}
                  </div>
                  <div className="text-xs text-gray-700">
                    Dipindahkan oleh: {item.moved_by}{" "}
                    {item.moved_by_agent_id
                      ? `(${
                          humanAgentNames[item.moved_by_agent_id] || "Memuat..."
                        })`
                      : ""}
                  </div>
                </li>
              );
            })}
        </ol>
      </div>
    );
  }

  const handleOpenAddStage = () => {
    setStageName("");
    setStageDescription("");
    setSelectedAgent("");
    setAddStageError(null);
    setAgentSearchQuery("");
    setIsAgentDropdownOpen(false);
    setIsAddStageOpen(true);
  };

  const handleSubmitAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !stageName.trim() ||
      !stageDescription.trim() ||
      !selectedAgent ||
      !pipelineId
    ) {
      setAddStageError("Semua field wajib diisi.");
      return;
    }
    setIsSubmittingStage(true);
    setAddStageError(null);
    try {
      await PipelineService.createStage({
        name: stageName.trim(),
        description: stageDescription.trim(),
        id_agent: selectedAgent,
        id_pipeline: pipelineId,
      });
      setIsAddStageOpen(false);
      await fetchPipelineData(); // Refresh data pipeline setelah tambah stage
    } catch (err: any) {
      setAddStageError(err.message || "Gagal menambah stage");
    } finally {
      setIsSubmittingStage(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout>
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pipeline...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* No Pipeline ID */}
          {!pipelineId && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No pipeline selected</p>
              <Button asChild>
                <Link to="/pipeline/create">Create New Pipeline</Link>
              </Button>
            </div>
          )}

          {/* Main Content - Only show when we have pipeline ID and not loading */}
          {pipelineId && !isLoading && !error && (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Back To Dashboard
                      </span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button size="sm" onClick={handleOpenAddStage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Stage Baru
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeletePipeline}
                      disabled={isDeleting}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete Pipeline"}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {pipelineInfo?.name || "Pipeline"}
                  </h1>
                  <Badge variant="outline" className="text-blue-600">
                    AI Auto-Response Aktif
                  </Badge>
                </div>
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Nilai Pipeline
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          Rp {totalValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Lead Aktif</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {totalLeads} Lead
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Pipeline Stages - FIXED VERSION */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pipeline Stages
                </h2>
                {pipelineData.length > 0 ? (
                  /* Container dengan fixed width dan scroll */
                  <div className="relative">
                    <div
                      className="overflow-x-auto overflow-y-hidden pb-4"
                      style={{ maxWidth: "calc(100vw - 3rem)" }}
                    >
                      <div className="flex gap-6 w-max min-w-full">
                        {pipelineData.map((stage) => (
                          <div key={stage.id} className="flex-shrink-0">
                            <PipelineStageColumn
                              stage={stage}
                              onDropLead={handleDropLead}
                              onUpdateLead={handleUpdateLead}
                              onUpdateStage={handleUpdateStage}
                              onDeleteStage={handleDeleteStage}
                              onLeadClick={handleLeadClick}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty state ketika tidak ada stage */
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada stage
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Pipeline ini belum memiliki stage. Buat stage pertama
                        untuk mulai mengelola lead.
                      </p>
                      <Button onClick={handleOpenAddStage}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Stage Pertama
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {/* Drawer and Dialog components remain the same */}
              <Drawer
                open={!!selectedContactId}
                onOpenChange={(open) => {
                  if (!open) {
                    setSelectedContactId(null);
                    setSelectedContact(null);
                    setSelectedLeadId(null); // reset lead id juga
                  }
                }}
                direction="right"
              >
                <DrawerContent className="!w-[60vw] !max-w-[99vw] p-0">
                  <div className="flex">
                    {/* Kiri: Data Lead */}
                    <div className="w-1/3 min-w-[220px] max-w-sm border-r p-6 flex flex-col justify-between">
                      {selectedContact && (
                        <div>
                          <h2 className="font-bold text-xl mb-2">
                            {selectedContact.push_name}
                          </h2>
                          <div className="mb-2 text-sm text-muted-foreground">
                            Status: {selectedContact.lead_status}
                          </div>
                          {/* Timeline Lead Transfer History */}
                          <div className="mt-6">
                            <h3 className="font-semibold text-base mb-2">
                              Riwayat Transfer Lead
                            </h3>
                            {isLoadingHistory ? (
                              <div className="text-xs text-gray-400">
                                Memuat riwayat...
                              </div>
                            ) : historyError ? (
                              <div className="text-xs text-red-500">
                                {historyError}
                              </div>
                            ) : leadTransferHistory.length === 0 ? (
                              <div className="text-xs text-gray-400">
                                Belum ada riwayat transfer.
                              </div>
                            ) : (
                              <LeadTransferTimeline
                                history={leadTransferHistory}
                              />
                            )}
                          </div>

                          {/* Lead Notes Section */}
                          <div className="mt-6">
                            <h3 className="font-semibold text-base mb-2">
                              Notes
                            </h3>
                            {isLoadingNotes ? (
                              <div className="text-xs text-gray-400">
                                Memuat notes...
                              </div>
                            ) : notesError ? (
                              <div className="text-xs text-red-500">
                                {notesError}
                              </div>
                            ) : leadNotes.length === 0 ? (
                              <div className="text-xs text-gray-400">
                                Belum ada notes.
                              </div>
                            ) : (
                              <div className="max-h-32 overflow-y-auto space-y-2">
                                {leadNotes.map((note: any, index: number) => (
                                  <div
                                    key={index}
                                    className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg"
                                  >
                                    {note.content || note.text || note}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {selectedContact && selectedContact.notes && (
                            <div className="space-y-2 mt-4">
                              <h3 className="font-semibold text-gray-900">
                                Contact Notes
                              </h3>
                              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                                {selectedContact.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* ChatConversation */}
                    <div className="flex-1 min-w-[500px] max-w-full h-[100vh] overflow-y-auto">
                      {selectedContactId && (
                        <ChatConversation
                          selectedContactId={selectedContactId}
                          selectedContact={selectedContact}
                          onToggleInfo={() => {}}
                          showInfo={false}
                        />
                      )}
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
              {/* Dialog untuk tambah stage baru */}
              <Dialog open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
                <DialogContent>
                  <form onSubmit={handleSubmitAddStage} className="space-y-4">
                    <h2 className="text-lg font-bold mb-4">
                      Tambah Stage Baru
                    </h2>
                    <div className="space-y-2">
                      <Label htmlFor="stage-name">Nama Stage</Label>
                      <Input
                        id="stage-name"
                        value={stageName}
                        onChange={(e) => setStageName(e.target.value)}
                        required
                        disabled={isSubmittingStage}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stage-desc">Deskripsi</Label>
                      <Input
                        id="stage-desc"
                        value={stageDescription}
                        onChange={(e) => setStageDescription(e.target.value)}
                        required
                        disabled={isSubmittingStage}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stage-agent">Pilih Agent</Label>
                      <div className="relative" ref={agentDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                          disabled={isSubmittingStage || agents.length === 0}
                          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-between"
                        >
                          <span className={selectedAgent ? "text-gray-900" : "text-gray-500"}>
                            {agents.length === 0 ? "Memuat agent..." : getSelectedAgentName()}
                          </span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${isAgentDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isAgentDropdownOpen && (
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
                                      setSelectedAgent(agent.id);
                                      setIsAgentDropdownOpen(false);
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
                    </div>
                    {addStageError && (
                      <div className="text-red-600 text-sm">
                        {addStageError}
                      </div>
                    )}
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmittingStage}>
                        {isSubmittingStage ? "Menyimpan..." : "Simpan"}
                      </Button>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isSubmittingStage}
                        >
                          Batal
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        {/* Toast Notification */}
        {toast?.show && (
          <div className="mb-4">
            <Toast
              type={toast.type}
              title={toast.title}
              description={toast.description}
              onClose={() => setToast(null)}
            />
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent>
            <div className="space-y-4">
              <h2 className="text-lg font-bold">
                {deleteDialog.type === "pipeline"
                  ? "Hapus Pipeline?"
                  : "Hapus Stage?"}
              </h2>
              <p>
                {deleteDialog.type === "pipeline"
                  ? `Apakah Anda yakin ingin menghapus pipeline "${pipelineInfo?.name}"? Tindakan ini tidak dapat dibatalkan.`
                  : "Apakah Anda yakin ingin menghapus stage ini? Tindakan ini tidak dapat dibatalkan."}
              </p>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={
                    deleteDialog.type === "pipeline"
                      ? confirmDeletePipeline
                      : confirmDeleteStage
                  }
                  disabled={isDeleting}
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
    </DndProvider>
  );
};

export default PipelinePage;
