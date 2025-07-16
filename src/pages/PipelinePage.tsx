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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  Users,
  Phone,
  MoreHorizontal,
  Clock,
  User,
  MessageCircle,
  Mail,
  MapPin,
  Trash,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import type { Lead, PipelineStage } from "@/types";
import { PipelineStageColumn } from "@/components/pipeline-stage";
import PipelineService, {
  type PipelineListResponse,
} from "@/services/pipelineService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const PipelinePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pipelineId = searchParams.get("id");

  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
  const [, setAiAgents] = useState<any[]>([]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleDropLead = useCallback(
    async (leadId: string, targetStageId: string) => {
      setPipelineData((prev) => {
        const newData = [...prev];

        // Find source stage and lead
        let leadToMove: Lead | undefined;
        // let leadIndexInSource = -1;
        // let sourceStageIdx = -1;

        for (let i = 0; i < newData.length; i++) {
          const stage = newData[i];
          const idx = stage.leads.findIndex((lead) => lead.id === leadId);
          if (idx >= 0) {
            leadToMove = stage.leads[idx];
            // leadIndexInSource = idx;
            // sourceStageIdx = i;
            stage.leads.splice(idx, 1);
            stage.count--;
            break;
          }
        }

        // Add to target stage
        if (leadToMove) {
          // Update moved_by/source to 'human' di state lokal
          const updatedLead = { ...leadToMove, source: 'human' };
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
        await PipelineService.moveLeadCard(leadId, { id_stage: targetStageId, moved_by: 'Human' });
      } catch (err) {
        // TODO: tampilkan error jika perlu
        console.error('Failed to move lead card:', err);
      }
    },
    []
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

  const handleUpdateStage = useCallback(async (stageId: string, newName: string, newDescription?: string) => {
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
          description:  stage.description ?? "",
          stage_order: stage.stage_order ?? 0,
        });
      } catch (err) {
        // TODO: tampilkan error jika perlu
      }
    }
  }, [pipelineData]);

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
        const stages = await PipelineService.getStages({ id_pipeline: pipelineId });
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

  // Fetch pipeline data when component mounts or pipeline ID changes
  useEffect(() => {
    const fetchPipelineData = async () => {
      if (!pipelineId) {
        console.log("No pipeline ID provided");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch pipeline info by ID
        const pipeline = await PipelineService.getPipelineById(
          pipelineId
        );
        setPipelineInfo(pipeline);

        // Fetch stages dari backend
        const stages = await PipelineService.getStages({ id_pipeline: pipelineId });
        // Fetch leads dari backend
        const leads = await PipelineService.getLeads({ id_pipeline: pipelineId });
        // Kelompokkan leads berdasarkan id_stage, mapping ke interface Lead
        const leadsByStage: Record<string, any[]> = {};
        const unassignedLeads: any[] = [];
        leads.forEach((lead: any) => {
          // Mapping ke interface Lead
          const mappedLead = {
            id: lead.id,
            name: lead.name,
            phone: "",
            value: lead.potential_value || 0,
            source: lead.moved_by || "unknown",
            daysAgo: 0,
            status: lead.status || "unknown",
            email: "",
            company: "",
            location: "",
            notes: lead.notes || "",
            createdAt: lead.created_at,
            lastActivity: lead.updated_at,
            timeline: [],
          };
          if (!lead.id_stage) {
            unassignedLeads.push(mappedLead);
            return;
          }
          if (!leadsByStage[lead.id_stage]) leadsByStage[lead.id_stage] = [];
          leadsByStage[lead.id_stage].push(mappedLead);
        });
        // Mapping ke struktur PipelineStage
        const mappedStages = stages.map((stage: any, idx: number) => {
          let stageLeads = leadsByStage[stage.id] || [];
          // Masukkan unassigned ke stage pertama
          if (idx === 0) {
            stageLeads = [...unassignedLeads, ...stageLeads];
          }
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
        setPipelineData(mappedStages);
      } catch (error: any) {
        console.error("Error fetching pipeline:", error);
        setError(error.message || "Failed to load pipeline");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipelineData();
  }, [pipelineId]);

  // Fetch agents for select
  useEffect(() => {
    if (!isAddStageOpen) return;
    setAddStageError(null);
    setIsSubmittingStage(false);
    setAgents([]);
    setSelectedAgent("");
    import("@/services/axios").then((axiosInstanceModule) => {
      const axiosInstance = axiosInstanceModule.default;
      axiosInstance.get("/v1/agents?offset=0&limit=100")
        .then((response) => {
          const items = response.data.items || [];
          const aiAgents = items.filter((agent: any) => agent.agent_type === "AI");
          setAgents(aiAgents);
        })
        .catch((err) => setAddStageError(err.message || "Gagal memuat data agent"));
    });
  }, [isAddStageOpen]);

  // Fetch AI agents saat mount
  useEffect(() => {
    import("@/services/humanAgentsService").then(({ HumanAgentsService }) => {
      HumanAgentsService.getHumanAgents()
        .then((allAgents) => {
          const aiAgents = allAgents.filter(agent => agent.agent_type === "AI");
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
      // TODO: refresh pipelineData jika sudah ada API-nya
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
                    {/* <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Import Dari WhatsApp
                    </Button> */}
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
                        {/* <p className="text-xs text-gray-500">
                          • Belum ada data perbandingan
                        </p> */}
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
                        {/* <p className="text-xs text-blue-600">
                          • {totalLeads} lead baru hari ini
                        </p> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pipeline Stages */}
              {pipelineData.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Pipeline Stages
                    </h2>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-6 overflow-x-auto pb-4">
                    {pipelineData.map((stage) => (
                      <PipelineStageColumn
                        
                        key={stage.id}
                        stage={stage}
                        onDropLead={handleDropLead}
                        onUpdateLead={handleUpdateLead}
                        onUpdateStage={handleUpdateStage}
                        onDeleteStage={handleDeleteStage}
                        onLeadClick={handleLeadClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Lead Detail Drawer */}
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerContent className="max-h-[90vh]">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {selectedLead?.name || "Lead Detail"}
                    </DrawerTitle>
                    <DrawerDescription>
                      Detailed information and timeline for this lead
                    </DrawerDescription>
                  </DrawerHeader>

                  {selectedLead && (
                    <div className="px-6 pb-6 space-y-6 overflow-y-auto">
                      {/* Lead Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">
                            Contact Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="text-sm">
                                {selectedLead.phone}
                              </span>
                            </div>
                            {selectedLead.email && (
                              <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">
                                  {selectedLead.email}
                                </span>
                              </div>
                            )}
                            {selectedLead.location && (
                              <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span className="text-sm">
                                  {selectedLead.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-semibold text-gray-900">
                            Business Information
                          </h3>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600">Company</p>
                              <p className="text-sm font-medium">
                                {selectedLead.company || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Source</p>
                              <p className="text-sm font-medium">
                                {selectedLead.source}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Potential Value
                              </p>
                              <p className="text-sm font-medium">
                                Rp {selectedLead.value.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {selectedLead.notes && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900">Notes</h3>
                          <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                            {selectedLead.notes}
                          </p>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          Timeline
                        </h3>
                        <div className="space-y-4">
                          {selectedLead.timeline.map((event) => (
                            <div key={event.id} className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                {event.type === "created" && (
                                  <User className="h-4 w-4 text-blue-600" />
                                )}
                                {event.type === "contacted" && (
                                  <MessageCircle className="h-4 w-4 text-green-600" />
                                )}
                                {event.type === "call" && (
                                  <Phone className="h-4 w-4 text-orange-600" />
                                )}
                                {event.type === "email" && (
                                  <Mail className="h-4 w-4 text-purple-600" />
                                )}
                                {event.type === "note" && (
                                  <Clock className="h-4 w-4 text-gray-600" />
                                )}
                                {event.type === "moved" && (
                                  <Users className="h-4 w-4 text-indigo-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {event.title}
                                  </h4>
                                  <span className="text-xs text-gray-500">
                                    {new Date(event.timestamp).toLocaleString(
                                      "id-ID",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {event.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  by {event.user}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <DrawerFooter>
                    <div className="flex gap-2">
                      <Button className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                    <DrawerClose asChild>
                      <Button variant="outline">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <Dialog open={isAddStageOpen} onOpenChange={setIsAddStageOpen}>
                <DialogContent>
                  <form onSubmit={handleSubmitAddStage} className="space-y-4">
                    <DialogHeader>
                      <DialogTitle>Tambah Stage Baru</DialogTitle>
                      <DialogDescription>Isi detail stage yang ingin ditambahkan ke pipeline ini.</DialogDescription>
                    </DialogHeader>
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
            </>
          )}
        </div>
      </MainLayout>
    </DndProvider>
  );
};

export default PipelinePage;
