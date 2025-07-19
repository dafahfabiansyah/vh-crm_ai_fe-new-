"use client";
import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MainLayout from "@/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Users,
  Trash,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { Lead, PipelineStage } from "@/types";
import { PipelineStageColumn } from "@/components/pipeline-stage";
import PipelineService, {
  type PipelineListResponse,
} from "@/services/pipelineService";

import ChatConversation from "@/components/chat-conversation";
import { Dialog, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ContactsService } from "@/services/contactsService";

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
  const [selectedAgent, setSelectedAgent] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  const [isSubmittingStage, setIsSubmittingStage] = useState(false);
  const [addStageError, setAddStageError] = useState<string | null>(null);
  const [, setAiAgents] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);

  const handleLeadClick = (lead: any) => {
    setSelectedContactId(lead.id_contact);
    // Cari contact yang id-nya sama dengan lead.id_contact
    const contact = contacts.find((c: any) => c.id === lead.id_contact);
    if (contact) {
      setSelectedContact(contact);
    } else {
      setSelectedContact({
        push_name: lead.name || 'Unknown',
        contact_identifier: '-', // fallback
        lead_status: lead.status || 'unassigned',
      });
      alert('Contact untuk lead ini tidak ditemukan!');
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
    async (stageId: string, newName: string, newDescription?: string) => {
      setPipelineData((prev) => {
        const newData = [...prev];
        const stageIndex = newData.findIndex((stage) => stage.id === stageId);
        if (stageIndex >= 0) {
          newData[stageIndex] = {
            ...newData[stageIndex],
            name: newName,
            description: newDescription ?? newData[stageIndex].description,
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
          });
        } catch (err) {
          // TODO: tampilkan error jika perlu
        }
      }
    },
    [pipelineData]
  );

  const handleDeletePipeline = async () => {
    if (!pipelineId || !pipelineInfo) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete pipeline "${pipelineInfo.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      await PipelineService.deletePipeline(pipelineId);

      // Redirect to dashboard after successful deletion
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error deleting pipeline:", error);
      alert(error.message || "Failed to delete pipeline. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      await PipelineService.deleteStage(stageId);
      // Refresh stages
      if (pipelineId) {
        const stages = await PipelineService.getStages({
          id_pipeline: pipelineId,
        });
        const mappedStages = stages.map((stage: any, idx: number) => ({
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
          leads: [],
          count: 0,
          value: 0,
          stage_order: stage.stage_order ?? idx,
        }));
        setPipelineData(mappedStages);
      }
    } catch (err) {
      alert("Gagal menghapus stage");
    }
  };

  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0);
  const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0);

  // Refactor: extract fetchPipelineData so it can be called from anywhere
  const fetchPipelineData = useCallback(async () => {
    if (!pipelineId) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Fetch pipeline info by ID
      const pipeline = await PipelineService.getPipelineById(pipelineId);
      setPipelineInfo(pipeline);

      // Fetch stages dari backend
      const stages = await PipelineService.getStages({ id_pipeline: pipelineId });

      // Untuk setiap stage, fetch leads-nya
      const stageLeadsPromises = stages.map(async (stage: any, idx: number) => {
        const leads = await PipelineService.getLeadsByStageId(stage.id);
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
          leads: leads,
          count: leads.length,
          value: leads.reduce((sum: number, l: any) => sum + (l.potential_value || 0), 0),
          stage_order: stage.stage_order ?? idx,
          agent_id: stage.id_agent || undefined,
        };
      });
      const mappedStages = await Promise.all(stageLeadsPromises);
      setPipelineData(mappedStages);
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

  const handleOpenAddStage = () => {
    setStageName("");
    setStageDescription("");
    setSelectedAgent("");
    setAddStageError(null);
    setIsAddStageOpen(true);
  };

  const handleSubmitAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stageName.trim() || !stageDescription.trim() || !selectedAgent || !pipelineId) {
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
      setStageName("");
      setStageDescription("");
      setSelectedAgent("");
      setAddStageError(null);
      fetchPipelineData(); // Refresh data pipeline setelah tambah stage
    } catch (err: any) {
      setAddStageError(err.message || "Gagal menambah stage");
    } finally {
      setIsSubmittingStage(false);
    }
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <MainLayout>
        <div className="p-6 max-w-full overflow-x-hidden">
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
            <div className="space-y-6">
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
              {pipelineData.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pipeline Stages
                  </h2>
                  
                  {/* Container dengan fixed width dan scroll */}
                  <div className="relative">
                    <div 
                      className="overflow-x-auto overflow-y-hidden pb-4"
                      style={{ maxWidth: 'calc(100vw - 3rem)' }}
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
                </div>
              )}
            </div>
          )}
  
          {/* Drawer and Dialog components remain the same */}
          <Drawer open={!!selectedContactId} onOpenChange={(open) => {
            if (!open) {
              setSelectedContactId(null);
              setSelectedContact(null);
            }
          }} direction="right">
            <DrawerContent className="!w-[60vw] !max-w-[99vw] p-0">
              <div className="flex">
                {/* Kiri: Data Lead */}
                <div className="w-1/3 min-w-[220px] max-w-sm border-r p-6 flex flex-col justify-between">
                  {selectedContact && (
                    <div>
                      <h2 className="font-bold text-xl mb-2">{selectedContact.push_name}</h2>
                      <div className="mb-2 text-sm text-muted-foreground">Status: {selectedContact.lead_status}</div>
                      <div className="mb-2 text-sm text-muted-foreground">Moved by: {selectedContact.moved_by}</div>
                      {/* Tambahkan info lain sesuai kebutuhan */}
                      {/* <div className="mb-2 text-xs text-gray-500">ID: {selectedContactId}</div> */}
                    </div>
                  )}
                </div>
                {/* Kanan: ChatConversation */}
                <div className="flex-1 min-w-[500px] max-w-full h-[100vh] overflow-y-auto">
                  {selectedContactId && (
                    // <ChatConversation
                    //   selectedContactId={selectedContactId}
                    //   selectedContact={selectedContact}
                    //   showBackButton={false}
                    // />
                    <ChatConversation
                    selectedContactId={selectedContactId}
                    selectedContact={selectedContact}
                    onToggleInfo={() => { }} // No-op for desktop since info is always visible
                    showInfo={false} // Don't show active state on desktop
                    // onSwitchToAssignedTab={handleSwitchToAssignedTab}
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
                <h2 className="text-lg font-bold mb-4">Tambah Stage Baru</h2>
                <div className="space-y-2">
                  <Label htmlFor="stage-name">Nama Stage</Label>
                  <Input id="stage-name" value={stageName} onChange={e => setStageName(e.target.value)} required disabled={isSubmittingStage} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage-desc">Deskripsi</Label>
                  <Input id="stage-desc" value={stageDescription} onChange={e => setStageDescription(e.target.value)} required disabled={isSubmittingStage} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage-agent">Pilih Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent} disabled={isSubmittingStage || agents.length === 0}>
                    <SelectTrigger className="w-full" id="stage-agent">
                      <SelectValue placeholder={agents.length === 0 ? "Memuat agent..." : "Pilih agent"} />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {(agent.name || agent.identifier)} ({agent.agent_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {addStageError && <div className="text-red-600 text-sm">{addStageError}</div>}
                <DialogFooter>
                  <Button type="submit" disabled={isSubmittingStage}>
                    {isSubmittingStage ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmittingStage}>Batal</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </DndProvider>
  );
};

export default PipelinePage;
