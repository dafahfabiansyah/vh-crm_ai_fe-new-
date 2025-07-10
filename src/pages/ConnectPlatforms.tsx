"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Save,
  Trash2,
  Phone,
  MessageSquare,
  Users,
  Bot,
  User,
  Settings,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Instagram,
  Globe,
  X,
  ArrowLeft,
  GitBranch,
} from "lucide-react";
import MainLayout from "@/main-layout";
import type { AIAgent, PlatformInbox } from "@/types";
import { Toast } from "@/components/ui/toast";
import {
  distributionMethods,
  // mockHumanAgents,
  platformIcons,
} from "@/mock/data";
import { useNavigate } from "react-router";
import { platformsInboxService } from "@/services/platfrormsInboxService";
import { AgentsService } from "@/services/agentsService";
import PipelineService from "@/services/pipelineService";
import type { PipelineListResponse } from "@/services/pipelineService";

export default function ConnectedPlatformsPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformInbox | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [PlatformInboxs, setPlatformInboxs] = useState<PlatformInbox[]>([]);
  const [loading, setLoading] = useState(false);

  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  // const [humanAgents] = useState(mockHumanAgents);
  const [humanAgents] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [, setAgentsError] = useState<string | null>(null);
  const [humanAgentsLoading] = useState(false);

  const [pipelines, setPipelines] = useState<PipelineListResponse[]>([]);
  const [pipelinesLoading , setPipelinesLoading] = useState(false);
  const [, setPipelinesError] = useState<string | null>(null);

  // Mobile detail view state
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [mobileSelectedPlatform, setMobileSelectedPlatform] =
    useState<PlatformInbox | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // If switching from mobile to desktop while in mobile detail view,
      // transfer the selected platform to desktop view
      if (!mobile && showMobileDetail && mobileSelectedPlatform) {
        setSelectedPlatform(mobileSelectedPlatform);
        setShowMobileDetail(false);
        setMobileSelectedPlatform(null);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [showMobileDetail, mobileSelectedPlatform]);

  // Fetch platforms from API
  useEffect(() => {
    setLoading(true);
    platformsInboxService
      .getPlatformInbox()
      .then((data) => {
        // Map API response to PlatformInbox[]
        const mapped = (data || []).map((item: any) => ({
          id: item.id,
          name: item.platform_name,
          type: "whatsapp",
          phone: item.platform_identifier,
          description: item.source_type,
          isActive: item.is_connected,
          deviceId: item.id,
          deviceName: item.platform_name,
          status: item.is_connected ? "Connected" : "Disconnected",
          sessionId: item.id_pipeline || "",
          timestamp: item.updated_at,
          isConnected: item.is_connected,
          isLoggedIn: item.is_connected,
        }));
        setPlatformInboxs(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch platforms from API:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch AI agents from API
  useEffect(() => {
    setAgentsLoading(true);
    setAgentsError(null);
    AgentsService.getAgents()
      .then((data) => setAiAgents(data))
      .catch((err) => {
        setAgentsError(err.message || "Failed to fetch AI agents");
        setAiAgents([]);
      })
      .finally(() => setAgentsLoading(false));
  }, []);

  // Fetch pipelines from API
  useEffect(() => {
    setPipelinesLoading(true);
    setPipelinesError(null);
    PipelineService.getPipelines()
      .then((data) => setPipelines(data))
      .catch((err) => {
        setPipelinesError(err.message || "Failed to fetch pipelines");
        setPipelines([]);
      })
      .finally(() => setPipelinesLoading(false));
  }, []);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    description: string;
  } | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Add Platform Modal state
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false);

  const filteredPlatforms = PlatformInboxs.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock refresh function
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
      setToast({
        show: true,
        type: "success",
        title: "Platforms Refreshed",
        description: "Platform status has been updated successfully.",
      });
    }, 1000);
  };

  const handleSave = async () => {
    const currentPlatform = showMobileDetail
      ? mobileSelectedPlatform
      : selectedPlatform;
    if (!currentPlatform) return;

    // Validate required fields
    if (!currentPlatform.aiAgent) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Please select an AI Agent before saving.",
      });
      return;
    }

    if (!currentPlatform.phone) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "WhatsApp number is required.",
      });
      return;
    }

    if (!currentPlatform.deviceId) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Device ID is required.",
      });
      return;
    }

    // Find the selected AI agent to get its ID
    const selectedAIAgent = aiAgents.find(
      (agent) => agent.name === currentPlatform.aiAgent
    );
    if (!selectedAIAgent) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Selected AI Agent not found.",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Lakukan mapping AI Agent ke Platform
      await platformsInboxService.mapAgentToPlatform(selectedAIAgent.id_agent, currentPlatform.id);

      setToast({
        show: true,
        type: "success",
        title: "Mapping Saved Successfully",
        description: `AI Agent berhasil di-mapping ke platform ${currentPlatform.name} .`,
      });

      // Update the platform in the list (simulasi saja, update sesuai kebutuhan)
      setPlatformInboxs((prev) =>
        prev.map((p) => (p.id === currentPlatform.id ? currentPlatform : p))
      );
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Mapping Failed",
        description: error.message || "Failed to map AI Agent to platform.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPlatform) return;
    try {
      await platformsInboxService.deletePlatformInbox(selectedPlatform.id);
      setPlatformInboxs((prev) =>
        prev.filter((p) => p.id !== selectedPlatform.id)
      );
      const remainingPlatforms = PlatformInboxs.filter(
        (p) => p.id !== selectedPlatform.id
      );
      if (remainingPlatforms.length > 0) {
        setSelectedPlatform(remainingPlatforms[0]);
      } else {
        setSelectedPlatform(null);
      }
      setToast({
        show: true,
        type: "success",
        title: "Platform Deleted",
        description: `Platform ${selectedPlatform.name} berhasil dihapus.`,
      });
    } catch (err: any) {
      setToast({
        show: true,
        type: "error",
        title: "Delete Failed",
        description: err.message || "Gagal menghapus platform.",
      });
    }
  };

  // Handle platform click - different behavior for mobile vs desktop
  const handlePlatformClick = (platform: PlatformInbox) => {
    if (isMobile) {
      // On mobile, navigate to detail view
      setMobileSelectedPlatform(platform);
      setShowMobileDetail(true);
    } else {
      // On desktop, show in sidebar
      setSelectedPlatform(platform);
    }
  };

  // Handle back from mobile detail
  const handleBackToList = () => {
    setShowMobileDetail(false);
    setMobileSelectedPlatform(null);
  };

  const updateSelectedPlatform = (updates: Partial<PlatformInbox>) => {
    if (showMobileDetail && mobileSelectedPlatform) {
      // Update mobile selected platform
      const updatedPlatform = { ...mobileSelectedPlatform, ...updates };
      setMobileSelectedPlatform(updatedPlatform);
    } else if (selectedPlatform) {
      // Update desktop selected platform
      setSelectedPlatform((prev) =>
        prev ? ({ ...prev, ...updates } as PlatformInbox) : null
      );
    }
  };

  const removeTeam = (teamToRemove: string) => {
    const currentPlatform = showMobileDetail
      ? mobileSelectedPlatform
      : selectedPlatform;
    if (!currentPlatform || !currentPlatform.teams) return;

    updateSelectedPlatform({
      teams: currentPlatform.teams.filter((team) => team !== teamToRemove),
    });
  };

  const PlatformIcon = selectedPlatform
    ? platformIcons[selectedPlatform.type] || MessageSquare
    : MessageSquare;

  // Mobile Platform Detail Component
  const MobilePlatformDetail = ({
    platform,
    onBack,
    onSave,
    onDelete,
    isSaving,
    toast,
    setToast,
    aiAgents,
    // humanAgents,
    agentsLoading,
    humanAgentsLoading,
    updateSelectedPlatform,
    removeTeam,
  }: {
    platform: PlatformInbox;
    onBack: () => void;
    onSave: () => void;
    onDelete: () => void;
    isSaving: boolean;
    toast: any;
    setToast: (toast: any) => void;
    aiAgents: AIAgent[];
    humanAgents: any[];
    agentsLoading: boolean;
    humanAgentsLoading: boolean;
    updateSelectedPlatform: (updates: Partial<PlatformInbox>) => void;
    removeTeam: (team: string) => void;
  }) => {
    const MobilePlatformIcon = platformIcons[platform.type] || MessageSquare;

    return (
      <div className="flex flex-col h-full bg-background">
        {/* Mobile Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-9 w-9 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback
                  className={`${
                    platform.type === "whatsapp"
                      ? "bg-green-100 text-green-700"
                      : platform.type === "instagram"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <MobilePlatformIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-foreground truncate leading-tight">
                  {platform.name}
                </h1>
                {platform.phone && (
                  <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{platform.phone}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm flex-1"
            >
              <Save className="h-3 w-3 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={onDelete}
              className="text-destructive border-destructive"
              size="icon"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
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

        {/* Mobile Configuration Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="text-sm flex-1">
                Basic
              </TabsTrigger>
              <TabsTrigger value="flow" className="text-sm flex-1">
                Flow
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                {/* WhatsApp Number Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    WhatsApp Number
                  </Label>
                  <Input
                    value={platform.phone || ""}
                    readOnly
                    className="bg-gray-50 text-sm"
                    placeholder="No phone number available"
                  />
                </div>

                {/* AI Agent */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    AI Agent
                  </Label>
                  <Select
                    value={platform.aiAgent}
                    onValueChange={(value) =>
                      updateSelectedPlatform({ aiAgent: value })
                    }
                    disabled={agentsLoading}
                  >
                    <SelectTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-gray-600" />
                        <SelectValue
                          placeholder={
                            agentsLoading
                              ? "Loading AI agents..."
                              : "Select AI agent"
                          }
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {aiAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.name}>
                          {agent.name}
                        </SelectItem>
                      ))}
                      {aiAgents.length === 0 && !agentsLoading && (
                        <SelectItem value="no-agents" disabled>
                          No AI agents available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teams */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Teams
                  </Label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {platform.teams?.map((team) => (
                      <Badge
                        key={team}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs"
                      >
                        <Users className="h-3 w-3" />
                        <span className="truncate">{team}</span>
                        <button
                          onClick={() => removeTeam(team)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select
                    onValueChange={(value) => {
                      const currentTeams = platform.teams || [];
                      if (!currentTeams.includes(value)) {
                        updateSelectedPlatform({
                          teams: [...currentTeams, value],
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <SelectValue placeholder="Add team..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="DISTCCTV">DISTCCTV</SelectItem>
                      <SelectItem value="Support Team">Support Team</SelectItem>
                      <SelectItem value="Sales Team">Sales Team</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem> */}
                      <SelectItem value="Operations">Belum ada team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Human Agent */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Human Agent
                  </Label>
                  <Select
                    value={platform.humanAgent}
                    onValueChange={(value) =>
                      updateSelectedPlatform({ humanAgent: value })
                    }
                    disabled={humanAgentsLoading}
                  >
                    <SelectTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <SelectValue
                          placeholder={
                            humanAgentsLoading
                              ? "Loading human agents..."
                              : "Select human agent"
                          }
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {/* {humanAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.name}>
                          {agent.name}
                        </SelectItem>
                      ))} */}
                      {/* {humanAgents.length === 0 && !humanAgentsLoading && (
                        <SelectItem value="no-human-agents" disabled>
                          No human agents available
                        </SelectItem>
                      )} */}
                      <SelectItem value="no-human-agents" disabled>
                          No human agents available
                        </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chat Distribution Method */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Chat Distribution Method
                  </Label>
                  <Select
                    value={platform.distributionMethod}
                    onValueChange={(value) =>
                      updateSelectedPlatform({
                        distributionMethod: value,
                      })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {distributionMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer Satisfaction Feature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-foreground">
                        Customer Satisfaction Feature (CSAT)
                      </Label>
                      <Star className="h-4 w-4 text-gray-600" />
                    </div>
                    <Switch
                      checked={platform.csatEnabled}
                      onCheckedChange={(checked) =>
                        updateSelectedPlatform({ csatEnabled: checked })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mengirim review link ke chat setelah di Resolve oleh agent.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="flow" className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Flow Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure conversation flows and automation rules here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Mobile Detail View */}
      {showMobileDetail && mobileSelectedPlatform && (
        <div className="lg:hidden">
          <MobilePlatformDetail
            platform={mobileSelectedPlatform}
            onBack={handleBackToList}
            onSave={handleSave}
            onDelete={handleDelete}
            isSaving={isSaving}
            toast={toast}
            setToast={setToast}
            aiAgents={aiAgents}
            humanAgents={humanAgents}
            agentsLoading={agentsLoading}
            humanAgentsLoading={humanAgentsLoading}
            updateSelectedPlatform={updateSelectedPlatform}
            removeTeam={removeTeam}
          />
        </div>
      )}

      {/* Desktop/Mobile List View */}
      <div
        className={`${
          showMobileDetail ? "hidden lg:flex" : "flex"
        } flex-col lg:flex-row h-full bg-background`}
      >
        {/* Left Sidebar - Platforms List */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-border bg-card">
          <div className="p-3 sm:p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  Inboxes
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Kelola platform yang terhubung dengan sistem Anda
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-8 w-8 sm:h-10 sm:w-10 touch-manipulation"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-8 w-8 sm:h-10 sm:w-10 touch-manipulation"
                  onClick={() => setIsAddPlatformModalOpen(true)}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </div>{" "}
          <div className="overflow-y-auto max-h-64 lg:max-h-none">
            {loading ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Clock className="h-6 w-6 text-gray-400 animate-spin" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Loading platforms...
                  </p>
                </div>
              </div>
            ) : filteredPlatforms.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-foreground mb-1">
                      Belum ada platform yang terkoneksi
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Klik tombol + untuk menambahkan platform baru
                    </p>
                    {/* Debug Info */}
                    {/* <div className="text-left bg-gray-50 p-3 rounded text-xs font-mono mb-4">
                      <div>Platforms count: {PlatformInboxs.length}</div>
                      <div>Selected: {selectedPlatform?.name || "None"}</div>
                      <div>Loading: {loading ? "true" : "false"}</div>
                    </div> */}
                    {/* Debug Button */}
                    {/* <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="text-xs"
                      >
                        {loading ? "Refreshing..." : "Refresh Platforms"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                        className="text-xs"
                      >
                        Reload Page
                      </Button>
                    </div> */}
                  </div>
                </div>
              </div>
            ) : (
              filteredPlatforms.map((platform) => {
                const Icon = platformIcons[platform.type];
                return (
                  <div
                    key={platform.id}
                    onClick={() => handlePlatformClick(platform)}
                    className={`p-3 sm:p-4 border-b border-border cursor-pointer hover:bg-accent/50 active:bg-accent/70 transition-colors touch-manipulation ${
                      selectedPlatform?.id === platform.id
                        ? "bg-accent border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarFallback
                            className={`${
                              platform.type === "whatsapp"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </AvatarFallback>
                        </Avatar>
                        {platform.isLoggedIn ? (
                          <CheckCircle className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500 bg-white rounded-full" />
                        ) : platform.isConnected ? (
                          <Clock className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 bg-white rounded-full" />
                        ) : (
                          <XCircle className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500 bg-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h3 className="font-medium text-sm sm:text-base text-foreground truncate">
                            {platform.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs border-gray-200 flex-shrink-0 ${
                              platform.isLoggedIn
                                ? "bg-green-50 text-green-700"
                                : platform.isConnected
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {platform.status}
                          </Badge>
                        </div>

                        {platform.phone && (
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-1">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{platform.phone}</span>
                          </div>
                        )}

                        {platform.description && (
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            {platform.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1 sm:gap-2 mt-2 overflow-x-auto">
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-50 text-gray-700 border-gray-200 flex-shrink-0"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-16 sm:max-w-none">
                              {platform.teams?.[0] || "No Team"}
                            </span>
                          </Badge>
                          {platform.aiAgent && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0"
                            >
                              <Bot className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-16 sm:max-w-none">
                                {platform.aiAgent.split(" ")[0]} AI
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Right Content - Platform Configuration */}
        <div className="flex-1 flex flex-col">
          {selectedPlatform ? (
            <>
              {/* Header */}
              <div className="p-3 sm:p-6 border-b border-border bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarFallback
                        className={`${
                          selectedPlatform.type === "whatsapp"
                            ? "bg-green-100 text-green-700"
                            : selectedPlatform.type === "instagram"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <PlatformIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                        {selectedPlatform.name}
                      </h1>
                      {selectedPlatform.phone && (
                        <p className="text-muted-foreground flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">
                            {selectedPlatform.phone}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm touch-manipulation"
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="text-destructive border-destructive touch-manipulation"
                      size="icon"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
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

              {/* Configuration Content */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6">
                <div className="w-full">
                  <Tabs defaultValue="basic" className="space-y-4 sm:space-y-6">
                    <TabsList className="w-full flex flex-row  rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <TabsTrigger
                        value="basic"
                        className="text-sm col-span-1 w-full py-2 pb-3 rounded-l-lg "
                      >
                        Basic
                      </TabsTrigger>
                      <TabsTrigger
                        value="flow"
                        className="text-sm col-span-1 w-full py-2 pb-3 rounded-r-lg "
                      >
                        Flow
                      </TabsTrigger>
                      <TabsTrigger
                        value="pipeline"
                        className="text-sm col-span-1 w-full py-2 pb-3 rounded-r-lg "
                      >
                        Pipeline
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="basic"
                      className="space-y-4 sm:space-y-6"
                    >
                      {/* Responsive Grid Layout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* WhatsApp Number Field */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            WhatsApp Number
                          </Label>
                          <Input
                            value={selectedPlatform.phone || ""}
                            readOnly
                            className="bg-gray-50 text-sm"
                            placeholder="No phone number available"
                          />
                        </div>
                        {/* AI Agent */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            AI Agent
                          </Label>
                          <Select
                            value={selectedPlatform.aiAgent}
                            onValueChange={(value) =>
                              updateSelectedPlatform({ aiAgent: value })
                            }
                            disabled={agentsLoading}
                          >
                            <SelectTrigger className="text-sm">
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-gray-600" />
                                <SelectValue
                                  placeholder={
                                    agentsLoading
                                      ? "Loading AI agents..."
                                      : "Select AI agent"
                                  }
                                />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {aiAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.name}>
                                  <div className="flex items-center gap-2">
                                    {agent.name}
                                  </div>
                                </SelectItem>
                              ))}
                              {aiAgents.length === 0 && !agentsLoading && (
                                <SelectItem value="no-agents" disabled>
                                  No AI agents available (Count:{" "}
                                  {aiAgents.length})
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Human Agent */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            Human Agent
                          </Label>
                          <Select
                            value={selectedPlatform.humanAgent}
                            onValueChange={(value) =>
                              updateSelectedPlatform({ humanAgent: value })
                            }
                            disabled={humanAgentsLoading}
                          >
                            <SelectTrigger className="text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-green-600" />
                                <SelectValue
                                  placeholder={
                                    humanAgentsLoading
                                      ? "Loading human agents..."
                                      : "Select human agent"
                                  }
                                />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {/* {humanAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.name}>
                                  <div className="flex items-center gap-2">
                                    {agent.name}
                                  </div>
                                </SelectItem>
                              ))} */}
                              {/* {humanAgents.length === 0 &&
                                !humanAgentsLoading && (
                                  <SelectItem value="no-human-agents" disabled>
                                    No human agents available (Count:{" "}
                                    {humanAgents.length})
                                  </SelectItem>
                                )} */}
                                <SelectItem value="no-human-agents" disabled>
                                    Belum ada human agent
                                  </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Teams */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            Teams
                          </Label>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                            {selectedPlatform.teams?.map((team) => (
                              <Badge
                                key={team}
                                variant="secondary"
                                className="flex items-center gap-1 text-xs"
                              >
                                <Users className="h-3 w-3" />
                                <span className="truncate max-w-20 sm:max-w-none">
                                  {team}
                                </span>
                                <button
                                  onClick={() => removeTeam(team)}
                                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                          <Select
                            onValueChange={(value) => {
                              const currentTeams = selectedPlatform.teams || [];
                              if (!currentTeams.includes(value)) {
                                updateSelectedPlatform({
                                  teams: [...currentTeams, value],
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="text-sm">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-600" />
                                <SelectValue placeholder="Add team..." />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {/* <SelectItem value="DISTCCTV">DISTCCTV</SelectItem>
                              <SelectItem value="Support Team">
                                Support Team
                              </SelectItem>
                              <SelectItem value="Sales Team">
                                Sales Team
                              </SelectItem>
                              <SelectItem value="Operations">
                                Operations
                              </SelectItem> */}
                              <SelectItem value="Belum ada team">Belum ada team</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Chat Distribution Method */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            Chat Distribution Method
                          </Label>
                          <Select
                            value={selectedPlatform.distributionMethod}
                            onValueChange={(value) =>
                              updateSelectedPlatform({
                                distributionMethod: value,
                              })
                            }
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {distributionMethods.map((method) => (
                                <SelectItem
                                  key={method.value}
                                  value={method.value}
                                >
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Customer Satisfaction Feature */}
                        <div className="space-y-3 sm:col-span-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium text-foreground">
                                Customer Satisfaction Feature (CSAT)
                              </Label>
                              <Star className="h-4 w-4 text-gray-600" />
                            </div>
                            <Switch
                              checked={selectedPlatform.csatEnabled}
                              onCheckedChange={(checked) =>
                                updateSelectedPlatform({ csatEnabled: checked })
                              }
                            />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Mengirim review link ke chat setelah di Resolve oleh
                            agent.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent
                      value="flow"
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="text-center py-8 sm:py-12">
                        <Settings className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                          Flow Configuration
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Configure conversation flows and automation rules
                          here.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="pipeline" className="space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">
                          Pipelines
                        </Label>
                        <Select
                          value={selectedPlatform.pipeline}
                          onValueChange={(value) => updateSelectedPlatform({ pipeline: value })}
                          disabled={pipelinesLoading}
                        >
                          <SelectTrigger className="text-sm">
                            <div className="flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-gray-600" />
                              <SelectValue
                                placeholder={pipelinesLoading ? "Loading Pipelines..." : "Select Pipeline"}
                              />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {pipelines.map((pipeline) => (
                              <SelectItem key={pipeline.id} value={pipeline.id}>
                                <div className="flex items-center gap-2">{pipeline.name}</div>
                              </SelectItem>
                            ))}
                            {pipelines.length === 0 && !pipelinesLoading && (
                              <SelectItem value="no-pipelines" disabled>
                                No pipelines available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center p-6">
              <div className="text-center">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  No Inbox Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select an inbox from the list to view and manage its settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Platform Modal - Using shadcn Dialog */}
      <Dialog
        open={isAddPlatformModalOpen}
        onOpenChange={setIsAddPlatformModalOpen}
      >
        <DialogContent className="w-[95vw] max-w-md mx-auto p-0 gap-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Connect Platform
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Choose a platform to connect to your inbox
            </p>

            <div className="space-y-3">
              {/* WhatsApp Option */}
              <button
                onClick={() => {
                  navigate("/connect/whatsapp");
                  setIsAddPlatformModalOpen(false);
                }}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 sm:gap-4 touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                    WhatsApp Business
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Connect your WhatsApp Business account
                  </p>
                </div>
              </button>

              {/* Instagram Option */}
              <button
                onClick={() => {
                  navigate("/connect/instagram");
                  setIsAddPlatformModalOpen(false);
                }}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 sm:gap-4 touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-pink-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                    Instagram
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Connect your Instagram business account
                  </p>
                </div>
              </button>

              {/* Web Chat Option */}
              <button
                onClick={() => {
                  navigate("/connect/webchat");
                  setIsAddPlatformModalOpen(false);
                }}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 sm:gap-4 touch-manipulation"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm sm:text-base truncate">
                    Web Chat
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    Add live chat widget to your website
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsAddPlatformModalOpen(false)}
                className="w-full text-sm h-10 touch-manipulation"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
