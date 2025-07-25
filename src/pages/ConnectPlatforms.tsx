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
import { Textarea } from "@/components/ui/textarea";
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
  Copy,
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
import { HumanAgentsService } from "@/services/humanAgentsService";
import type { HumanAgent } from "@/services/humanAgentsService";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export default function ConnectedPlatformsPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformInbox | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [PlatformInboxs, setPlatformInboxs] = useState<PlatformInbox[]>([]);
  const [loading, setLoading] = useState(false);

  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  // const [humanAgents] = useState(mockHumanAgents);
  const [humanAgents, setHumanAgents] = useState<HumanAgent[]>([]);
  const [humanAgentsLoading, setHumanAgentsLoading] = useState(false);
  const [, setHumanAgentsError] = useState<string | null>(null);
  const [agentsLoading, setAgentsLoading] = useState(false);

  const [pipelines, setPipelines] = useState<PipelineListResponse[]>([]);
  const [pipelinesLoading , setPipelinesLoading] = useState(false);
  const [, setPipelinesError] = useState<string | null>(null);

  // Mobile detail view state
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [mobileSelectedPlatform, setMobileSelectedPlatform] =
    useState<PlatformInbox | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [platformToDelete, setPlatformToDelete] = useState<PlatformInbox | null>(null);

  // Debug modal state changes
  useEffect(() => {
    console.log('showDeleteModal changed:', showDeleteModal);
    console.log('platformToDelete changed:', platformToDelete);
  }, [showDeleteModal, platformToDelete]);

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
        const mapped = (data || []).map((item: any) => {
          // Get the first active agent mapping if available
          const activeMapping = item.platform_mappings?.find((mapping: any) => mapping.is_active);
          
          // Get AI agent mapping specifically
          const aiAgentMapping = (item.platform_mappings || []).find((mapping: any) => 
            mapping.is_active && mapping.agent_type === 'AI'
          );
          
          return {
            id: item.id,
            name: item.platform_name,
            type: "whatsapp" as const,
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
            // Map agent information from platform_mappings
            aiAgent: aiAgentMapping?.agent_name || undefined,
            teams: activeMapping ? [activeMapping.agent_type] : undefined,
            // Map pipeline information
            pipeline: item.id_pipeline || undefined,
            // Store raw mapping data for reference
            platformMappings: item.platform_mappings || [],
            // Extract human agent IDs from platform_mappings (only active ones for selection)
            humanAgentsSelected: (item.platform_mappings || [])
              .filter((mapping: any) => mapping.is_active && mapping.agent_type === 'Human')
              .map((mapping: any) => mapping.id_agent),
            // Store all human agent mappings (active and inactive) for tracking
            // Filter out mappings that might reference deleted human agents
            allHumanAgentMappings: (item.platform_mappings || [])
              .filter((mapping: any) => mapping.agent_type === 'Human' && mapping.id_agent)
              .map((mapping: any) => ({ id: mapping.id, id_agent: mapping.id_agent, is_active: mapping.is_active }))
          };
        });
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
    AgentsService.getAgents()
      .then((data) => setAiAgents(data))
      .catch((err) => {
        console.error("Failed to fetch AI agents:", err);
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

  // Fetch human agents from API
  useEffect(() => {
    setHumanAgentsLoading(true);
    setHumanAgentsError(null);
    HumanAgentsService.getHumanAgents()
      .then((data: HumanAgent[]) => setHumanAgents(data))
      .catch((err) => {
        setHumanAgentsError(err.message || "Failed to fetch human agents");
        setHumanAgents([]);
      })
      .finally(() => setHumanAgentsLoading(false));
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

  // Active tab state
  const [activeTab, setActiveTab] = useState("basic");

  // Add Platform Modal state
  const [isAddPlatformModalOpen, setIsAddPlatformModalOpen] = useState(false);

  const filteredPlatforms = PlatformInboxs.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Refresh function
  const handleRefresh = () => {
    setLoading(true);
    platformsInboxService
      .getPlatformInbox()
      .then((data) => {
        // Map API response to PlatformInbox[]
        const mapped = (data || []).map((item: any) => {
          // Get the first active agent mapping if available
          const activeMapping = item.platform_mappings?.find((mapping: any) => mapping.is_active);
          
          // Get AI agent mapping specifically
          const aiAgentMapping = (item.platform_mappings || []).find((mapping: any) => 
            mapping.is_active && mapping.agent_type === 'AI'
          );
          
          return {
            id: item.id,
            name: item.platform_name,
            type: "whatsapp" as const,
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
            // Map agent information from platform_mappings
            aiAgent: aiAgentMapping?.agent_name || undefined,
            teams: activeMapping ? [activeMapping.agent_type] : undefined,
            // Map pipeline information
            pipeline: item.id_pipeline || undefined,
            // Store raw mapping data for reference
            platformMappings: item.platform_mappings || [],
            // Extract human agent IDs from platform_mappings (only active ones for selection)
            humanAgentsSelected: (item.platform_mappings || [])
              .filter((mapping: any) => mapping.is_active && mapping.agent_type === 'Human')
              .map((mapping: any) => mapping.id_agent),
            // Store all human agent mappings (active and inactive) for tracking
            // Filter out mappings that might reference deleted human agents
          allHumanAgentMappings: (item.platform_mappings || [])
            .filter((mapping: any) => mapping.agent_type === 'Human' && mapping.id_agent)
            .map((mapping: any) => ({ id: mapping.id, id_agent: mapping.id_agent, is_active: mapping.is_active }))
          };
        });
        setPlatformInboxs(mapped);
        setToast({
          show: true,
          type: "success",
          title: "Platforms Refreshed",
          description: "Platform status has been updated successfully.",
        });
      })
      .catch((err) => {
        console.error("Failed to refresh platforms from API:", err);
        setToast({
          show: true,
          type: "error",
          title: "Refresh Failed",
          description: "Failed to refresh platform data.",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleSave = async () => {
    const currentPlatform = showMobileDetail
      ? mobileSelectedPlatform
      : selectedPlatform;
    if (!currentPlatform) return;

    // Validate required fields
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

    setIsSaving(true);
    try {
      // Handle different behaviors based on active tab
      if (activeTab === "pipeline") {
        // Pipeline tab: Use update_platform_inbox API to update id_pipeline
        if (currentPlatform.pipeline) {
          console.log('Pipeline tab - updating id_pipeline via update_platform_inbox');
          await platformsInboxService.updatePlatformMapping(currentPlatform.id, currentPlatform.pipeline);
          setToast({
            show: true,
            type: "success",
            title: "Pipeline Mapping Saved Successfully",
            description: `Pipeline berhasil di-mapping ke platform ${currentPlatform.name}.`,
          });
        } else {
          setToast({
            show: true,
            type: "error",
            title: "Validation Error",
            description: "Please select a pipeline before saving.",
          });
          return;
        }
      } else if (activeTab === "basic") {
        // Basic tab: Use create_platform_mappings endpoint and set id_pipeline to null
        if (currentPlatform.aiAgent) {
          // Find the selected AI agent
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
          console.log('Basic tab - mapping AI agent via create_platform_mappings and setting id_pipeline to null');
          // Use create_platform_mappings endpoint which will update platform_inbox id_pipeline to null
          await platformsInboxService.mapAgentToPlatform(selectedAIAgent.id_agent, currentPlatform.id);
          setToast({
            show: true,
            type: "success",
            title: "AI Agent Mapping Saved Successfully",
            description: `AI Agent berhasil di-mapping ke platform ${currentPlatform.name}.`,
          });
        }
        
        // Handle multiple human agents mapping
        if (currentPlatform.humanAgentsSelected && currentPlatform.humanAgentsSelected.length > 0) {
          console.log('Basic tab - mapping multiple human agents via create_platform_mappings');
          
          // Get existing human agent mappings for this platform
          const existingHumanMappings = (currentPlatform.allHumanAgentMappings || []);
          
          // Create a mapping for each selected human agent
          for (const humanAgentId of currentPlatform.humanAgentsSelected) {
            const existingMapping = existingHumanMappings.find(mapping => mapping.id_agent === humanAgentId);
            
            if (existingMapping) {
              // Agent is already mapped, only update if not already active
              if (!existingMapping.is_active) {
                try {
                  await platformsInboxService.updatePlatformMappingStatus(existingMapping.id, true, humanAgentId);
                } catch (error: any) {
                  console.warn(`Failed to activate mapping ${existingMapping.id}:`, error.message);
                  // If activation fails, try creating a new mapping instead
                  await platformsInboxService.mapHumanAgentToPlatform(humanAgentId, currentPlatform.id);
                }
              }
              // If already active, skip - no backend call needed
            } else {
              // Agent is not mapped, create new mapping
              await platformsInboxService.mapHumanAgentToPlatform(humanAgentId, currentPlatform.id);
            }
          }
          
          // Deactivate agents that were previously selected but are now unselected
          for (const existingMapping of existingHumanMappings) {
            if (!currentPlatform.humanAgentsSelected.includes(existingMapping.id_agent) && existingMapping.is_active) {
              try {
                await platformsInboxService.updatePlatformMappingStatus(existingMapping.id, false, existingMapping.id_agent);
              } catch (error: any) {
                console.warn(`Failed to deactivate mapping ${existingMapping.id}:`, error.message);
                // Continue with other mappings even if one fails
              }
            }
          }
          
          setToast({
            show: true,
            type: "success",
            title: "Human Agents Mapping Saved Successfully",
            description: `${currentPlatform.humanAgentsSelected.length} Human Agent(s) berhasil di-mapping ke platform ${currentPlatform.name}.`,
          });
        } else {
          // No human agents selected, deactivate all existing human agent mappings
          const existingHumanMappings = (currentPlatform.allHumanAgentMappings || []);
          
          for (const existingMapping of existingHumanMappings) {
            if (existingMapping.is_active) {
              try {
                await platformsInboxService.updatePlatformMappingStatus(existingMapping.id, false, existingMapping.id_agent);
              } catch (error: any) {
                console.warn(`Failed to deactivate mapping ${existingMapping.id}:`, error.message);
                // Continue with other mappings even if one fails
              }
            }
          }
        }
        
        // Allow deselecting all agents - this is a valid operation to clear all mappings
        // The validation will be handled by the backend if needed
      } else {
        setToast({
          show: true,
          type: "error",
          title: "Validation Error",
          description: "Please select either an AI Agent or Pipeline before saving.",
        });
        return;
      }

      // Refresh data from API to ensure consistency
      const refreshedData = await platformsInboxService.getPlatformInbox();
      console.log('After mapping - Refreshed data from API:', refreshedData);
      
      // Also refresh AI agents and human agents data to ensure validation works correctly
      try {
        const refreshedAiAgents = await AgentsService.getAgents();
        setAiAgents(refreshedAiAgents);
      } catch (err) {
        console.error('Failed to refresh AI agents:', err);
      }
      
      try {
        const refreshedHumanAgents = await HumanAgentsService.getHumanAgents();
        setHumanAgents(refreshedHumanAgents);
      } catch (err) {
        console.error('Failed to refresh human agents:', err);
      }
      const mapped = (refreshedData || []).map((item: any) => {
        // Find active AI agent mapping specifically
        const activeAiMapping = item.platform_mappings?.find((mapping: any) => mapping.is_active && mapping.agent_type === 'AI');
        // Find any active mapping for teams (could be AI or Human)
        const activeMapping = item.platform_mappings?.find((mapping: any) => mapping.is_active);
        const mappedItem = {
          id: item.id,
          name: item.platform_name,
          type: "whatsapp" as const,
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
          aiAgent: activeAiMapping?.agent_name || undefined,
          teams: activeMapping ? [activeMapping.agent_type] : undefined,
          pipeline: item.id_pipeline || undefined,
          platformMappings: item.platform_mappings || [],
          // Extract human agent IDs from platform_mappings (only active ones for selection)
          humanAgentsSelected: (item.platform_mappings || [])
            .filter((mapping: any) => mapping.is_active && mapping.agent_type === 'Human')
            .map((mapping: any) => mapping.id_agent),
          // Store all human agent mappings (active and inactive) for tracking
          // Filter out mappings that might reference deleted human agents
          allHumanAgentMappings: (item.platform_mappings || [])
            .filter((mapping: any) => mapping.agent_type === 'Human' && mapping.id_agent)
            .map((mapping: any) => ({ id: mapping.id, id_agent: mapping.id_agent, is_active: mapping.is_active }))
        };
        // Log if this is the platform we just updated
        if (item.id === currentPlatform.id) {
          console.log('After mapping - Updated platform data:', mappedItem);
          console.log('Connection status changed?', {
            before: currentPlatform.isConnected,
            after: mappedItem.isConnected,
            beforeStatus: currentPlatform.status,
            afterStatus: mappedItem.status
          });
        }
        return mappedItem;
      });
      setPlatformInboxs(mapped);
      // Update selected platform with refreshed data
      const updatedPlatform = mapped.find((p: PlatformInbox) => p.id === currentPlatform.id);
      if (updatedPlatform) {
        if (showMobileDetail) {
          setMobileSelectedPlatform(updatedPlatform);
        } else {
          setSelectedPlatform(updatedPlatform);
        }
      }
    } catch (error: any) {
      setToast({
        show: true,
        type: "error",
        title: "Mapping Failed",
        description: error.message || "Failed to save mapping.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    const currentPlatform = showMobileDetail ? mobileSelectedPlatform : selectedPlatform;
    if (!currentPlatform) return;
    
    setPlatformToDelete(currentPlatform);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!platformToDelete) return;
    
    try {
      await platformsInboxService.deletePlatformInbox(platformToDelete.id);
      setPlatformInboxs((prev) =>
        prev.filter((p: PlatformInbox) => p.id !== platformToDelete.id)
      );
      const remainingPlatforms = PlatformInboxs.filter(
        (p: PlatformInbox) => p.id !== platformToDelete.id
      );
      
      // Handle platform selection after deletion
      if (showMobileDetail) {
        // If in mobile view, go back to list
        setShowMobileDetail(false);
        setMobileSelectedPlatform(null);
      } else {
        // If in desktop view, select next platform or clear selection
        if (remainingPlatforms.length > 0) {
          setSelectedPlatform(remainingPlatforms[0]);
        } else {
          setSelectedPlatform(null);
        }
      }
      
      setToast({
        show: true,
        type: "success",
        title: "Platform Deleted",
        description: `Platform ${platformToDelete.name} berhasil dihapus.`,
      });
    } catch (err: any) {
      setToast({
        show: true,
        type: "error",
        title: "Delete Failed",
        description: err.message || "Gagal menghapus platform.",
      });
    } finally {
      setShowDeleteModal(false);
      setPlatformToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPlatformToDelete(null);
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
    pipelines,
    // humanAgents,
    agentsLoading,
    pipelinesLoading,
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
    pipelines: PipelineListResponse[];
    humanAgents: HumanAgent[];
    agentsLoading: boolean;
    pipelinesLoading: boolean;
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
                      : platform.type === "webchat"
                      ? "bg-blue-100 text-blue-700"
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="basic" className="text-sm flex-1">
                Basic
              </TabsTrigger>
              <TabsTrigger value="flow" className="text-sm flex-1">
                Flow
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="text-sm flex-1">
                Pipeline
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                {/* Platform Identifier Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    {platform.type === "whatsapp" ? "WhatsApp Number" : "Platform Identifier"}
                  </Label>
                  <Input
                      value={platform.phone || platform.id || ""}
                      readOnly
                      className="bg-gray-50 text-sm"
                      placeholder={platform.type === "whatsapp" ? "No phone number available" : "No platform identifier available"}
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-left"
                      >
                        {platform.humanAgentsSelected && platform.humanAgentsSelected.length > 0
                          ? humanAgents
                              .filter((agent) => platform.humanAgentsSelected?.includes(agent.id))
                              .map((agent) => agent.name)
                              .join(", ")
                          : "Select human agents"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2">
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {humanAgents.map((agent) => (
                          <label key={agent.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={platform.humanAgentsSelected?.includes(agent.id) || false}
                              onCheckedChange={(checked) => {
                                let updated: string[] = platform.humanAgentsSelected ? [...platform.humanAgentsSelected] : [];
                                if (checked) {
                                  if (!updated.includes(agent.id)) updated.push(agent.id);
                                } else {
                                  updated = updated.filter((id) => id !== agent.id);
                                }
                                updateSelectedPlatform({ humanAgentsSelected: updated });
                              }}
                              id={`human-agent-checkbox-${agent.id}`}
                            />
                            <span className="text-sm">{agent.name}</span>
                          </label>
                        ))}
                        {humanAgents.length === 0 && !humanAgentsLoading && (
                          <span className="text-muted-foreground text-sm">No human agents available</span>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Chat Distribution Method */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            Chat Distribution Method
                          </Label>
                          <Select
                            value={platform.distributionMethod || "least-assigned"}
                            onValueChange={(value) =>
                              updateSelectedPlatform({
                                distributionMethod: value,
                              })
                            }
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Least Assigned First" />
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
            <TabsContent value="pipeline" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Pipelines
                </Label>
                <Select
                  value={platform.pipeline}
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
            pipelines={pipelines}
            humanAgents={humanAgents}
            agentsLoading={agentsLoading}
            pipelinesLoading={pipelinesLoading}
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
                          {platform.platformMappings && platform.platformMappings.length > 0 ? (
                            platform.platformMappings.map((mapping) => (
                              <Badge
                                key={mapping.id}
                                variant="outline"
                                className={`text-xs flex-shrink-0 ${
                                  mapping.agent_type === "AI"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }`}
                              >
                                {mapping.agent_type === "AI" ? (
                                  <Bot className="h-3 w-3 mr-1" />
                                ) : (
                                  <User className="h-3 w-3 mr-1" />
                                )}
                                <span className="truncate max-w-16 sm:max-w-none">
                                  {mapping.agent_name}
                                </span>
                                {!mapping.is_active && (
                                  <span className="ml-1 text-gray-400">(Inactive)</span>
                                )}
                              </Badge>
                            ))
                          ) : platform.sessionId ? (
                            <Badge
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-200 flex-shrink-0"
                            >
                              <GitBranch className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-16 sm:max-w-none">
                                Pipeline Mapped
                              </span>
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs bg-gray-50 text-gray-700 border-gray-200 flex-shrink-0"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-16 sm:max-w-none">
                                No Agent Mapped
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
                            : selectedPlatform.type === "webchat"
                            ? "bg-blue-100 text-blue-700"
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
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
                    <TabsList className="w-full flex flex-row rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <TabsTrigger
                        value="basic"
                        className="text-sm col-span-1 w-full py-2 pb-3 rounded-l-lg"
                      >
                        Basic
                      </TabsTrigger>
                      <TabsTrigger
                        value="flow"
                        className="text-sm col-span-1 w-full py-2 pb-3"
                      >
                        Flow
                      </TabsTrigger>
                      {selectedPlatform.description === 'webchat' && (
                        <TabsTrigger
                          value="webchat"
                          className="text-sm col-span-1 w-full py-2 pb-3"
                        >
                          Webchat
                        </TabsTrigger>
                      )}
                      <TabsTrigger
                        value="pipeline"
                        className="text-sm col-span-1 w-full py-2 pb-3 rounded-r-lg"
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
                        {/* Platform Identifier Field */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            {selectedPlatform.type === "whatsapp" ? "WhatsApp Number" : "Platform Identifier"}
                          </Label>
                          <Input
                            value={selectedPlatform.phone || selectedPlatform.id || ""}
                            readOnly
                            className="bg-gray-50 text-sm"
                            placeholder={selectedPlatform.type === "whatsapp" ? "No phone number available" : "No platform identifier available"}
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-between text-left"
                              >
                                {(() => {
                                  console.log('Desktop Platform:', selectedPlatform.name);
                                  console.log('Desktop Platform mappings:', selectedPlatform.platformMappings);
                                  console.log('Desktop Human agents selected IDs:', selectedPlatform.humanAgentsSelected);
                                  console.log('Desktop Available human agents:', humanAgents.map(a => ({id: a.id, name: a.name})));
                                  
                                  if (selectedPlatform.humanAgentsSelected && selectedPlatform.humanAgentsSelected.length > 0) {
                                    const selectedAgents = humanAgents
                                      .filter((agent) => selectedPlatform.humanAgentsSelected?.includes(agent.id))
                                      .map((agent) => agent.name);
                                    console.log('Desktop Matched agents:', selectedAgents);
                                    return selectedAgents.length > 0 ? selectedAgents.join(", ") : "Select human agents";
                                  }
                                  return "Select human agents";
                                })()}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-90 p-2">
                              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                                {humanAgents.map((agent) => {
                                  const isSelected = selectedPlatform.humanAgentsSelected?.includes(agent.id) || false;
                                  const existingMapping = selectedPlatform.allHumanAgentMappings?.find(
                                    (mapping: any) => mapping.id_agent === agent.id
                                  );
                                  const isMapped = !!existingMapping;
                                  const isActive = existingMapping?.is_active || false;
                                  
                                  return (
                                    <label key={agent.id} className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          let updated: string[] = selectedPlatform.humanAgentsSelected ? [...selectedPlatform.humanAgentsSelected] : [];
                                          if (checked) {
                                            if (!updated.includes(agent.id)) updated.push(agent.id);
                                          } else {
                                            updated = updated.filter((id) => id !== agent.id);
                                          }
                                          updateSelectedPlatform({ humanAgentsSelected: updated });
                                        }}
                                        id={`human-agent-checkbox-${agent.id}`}
                                      />
                                      <span className="text-sm flex items-center gap-1">
                                        {agent.name}
                                        {isMapped && (
                                          <Badge 
                                            variant={isActive ? "default" : "secondary"} 
                                            className="text-xs px-1 py-0"
                                          >
                                            {isActive ? "Active" : "Inactive"}
                                          </Badge>
                                        )}
                                      </span>
                                    </label>
                                  );
                                })}
                                {humanAgents.length === 0 && !humanAgentsLoading && (
                                  <span className="text-muted-foreground text-sm">No human agents available</span>
                                )}
                              </div>
                            </PopoverContent>
                          </Popover>
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
                            value={selectedPlatform.distributionMethod || "least-assigned"}
                            onValueChange={(value) =>
                              updateSelectedPlatform({
                                distributionMethod: value,
                              })
                            }
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue placeholder="Least Assigned First" />
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
                    {selectedPlatform.description === 'webchat' && (
                      <TabsContent
                        value="webchat"
                        className="space-y-4 sm:space-y-6"
                      >
                        <div className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Primary Color */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">
                                Primary Color
                              </Label>
                              <Input
                                type="color"
                                value="#007bff"
                                className="h-10 w-full"
                              />
                            </div>
                            
                            {/* Welcome Message */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">
                                Welcome Message
                              </Label>
                              <Input
                                placeholder="Welcome! How can we help you today?"
                                className="text-sm"
                              />
                            </div>
                            
                            {/* Input Placeholder */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">
                                Input Placeholder
                              </Label>
                              <Input
                                placeholder="Type your message..."
                                className="text-sm"
                              />
                            </div>
                            
                            {/* Widget Position */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-foreground">
                                Widget Position
                              </Label>
                              <Select defaultValue="bottom-right">
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Show Agent Avatar */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-foreground">
                                  Show Agent Avatar
                                </Label>
                                <Switch defaultChecked />
                              </div>
                            </div>
                            
                            {/* Allow File Upload */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-foreground">
                                  Allow File Upload
                                </Label>
                                <Switch defaultChecked />
                              </div>
                            </div>
                            
                            {/* Ask for Customer Info */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-foreground">
                                  Ask for Customer Info
                                </Label>
                                <Switch defaultChecked={false} />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                When enabled, the webchat will ask for customer's name and phone number before starting the conversation
                              </p>
                            </div>
                          </div>
                          
                          {/* Webchat URL */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">
                              Webchat URL
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                value={`${window.location.origin}/webchat/${selectedPlatform.phone || 'your-platform-id'}`}
                                readOnly
                                className="flex-1 text-sm bg-gray-50"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const url = `${window.location.origin}/webchat/${selectedPlatform.phone || 'your-platform-id'}`;
                                  navigator.clipboard.writeText(url);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Direct link to your webchat widget for testing
                            </p>
                          </div>
                          
                          {/* Embed Code */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">
                              Embed Code
                            </Label>
                            <div className="space-y-2">
                              <Textarea
                                value={`<!-- Webchat Widget -->
<div id="webchat-${selectedPlatform.phone || 'your-platform-id'}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/webchat-widget.js';
    script.onload = function() {
      WebchatWidget.init({
        containerId: 'webchat-${selectedPlatform.phone || 'your-platform-id'}',
        agentId: '${selectedPlatform.aiAgent || 'your-agent-id'}',
        apiUrl: '${window.location.origin}/api',
        config: {
            primaryColor: '#007bff',
            welcomeMessage: 'Welcome! How can we help you today?',
            placeholderText: 'Type your message...',
            position: 'bottom-right',
            showAgentAvatar: true,
            allowFileUpload: true,
            askForCustomerInfo: false
          }
      });
    };
    document.head.appendChild(script);
  })();
</script>`}
                                readOnly
                                rows={8}
                                className="text-xs font-mono bg-gray-50"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const embedCode = `<!-- Webchat Widget -->
<div id="webchat-${selectedPlatform.phone || 'your-platform-id'}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/webchat-widget.js';
    script.onload = function() {
      WebchatWidget.init({
        containerId: 'webchat-${selectedPlatform.phone || 'your-platform-id'}',
        agentId: '${selectedPlatform.aiAgent || 'your-agent-id'}',
        apiUrl: '${window.location.origin}/api',
        config: {
          primaryColor: '#007bff',
          welcomeMessage: 'Welcome! How can we help you today?',
          placeholderText: 'Type your message...',
          position: 'bottom-right',
          showAgentAvatar: true,
          allowFileUpload: true,
          askForCustomerInfo: false
        }
      });
    };
    document.head.appendChild(script);
  })();
</script>`;
                                  navigator.clipboard.writeText(embedCode);
                                }}
                                className="w-full"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Embed Code
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Copy and paste this code into your website's HTML to add the webchat widget
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    )}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Platform Inbox
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{platformToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
