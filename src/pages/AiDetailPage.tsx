"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Bot,
  Settings,
  Database,
  Link,
  RefreshCw,
  FileText,
  ChevronDown,
  MessageCircle,
  Webhook,
  Truck,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/contexts/ToastContext";
import AIAgentChatPreview from "@/components/ai-agent-chat";
import { BehaviorEditor } from "@/components/behavior-editor";
import MainLayout from "@/main-layout";
import { AgentsService } from "@/services/agentsService";
import KnowledgeTab from "@/components/knowledge-tab";
import ExistingKnowledgeList from "@/components/existing-knowledge-list";
import type { AIAgentData, AIAgentDetailPageProps } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCustomIntegrations } from "@/services/customIntegrationService";
import axios from "@/services/axios";
import type { CustomIntegrationDetail } from "./CustomIntegrationDetail";

export default function AIAgentDetailPage({ agentId }: AIAgentDetailPageProps) {
  const navigate = useNavigate();
  const params = useParams();
  const actualAgentId = agentId || params.id;

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdditionalSettingsOpen, setIsAdditionalSettingsOpen] =
    useState(false);

  // Agent data from API
  const [agentData, setAgentData] = useState<AIAgentData | null>(null);

  // Load agent data on component mount
  useEffect(() => {
    const loadAgentData = async () => {
      if (!actualAgentId) {
        setError("Agent ID is required");
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        setError(null);

        // Fetch agent basic info and settings in parallel
        const [agentResponse, settingsResponse] = await Promise.all([
          AgentsService.getAgent(actualAgentId),
          AgentsService.getAgentSettings(actualAgentId),
        ]);

        // Combine the data
        const combinedData: AIAgentData = {
          // Basic agent info
          id: agentResponse.id,
          name: agentResponse.name,
          description: agentResponse.description,
          id_settings: agentResponse.id_settings,
          created_at: agentResponse.created_at,
          updated_at: agentResponse.updated_at,
          // Settings
          behaviour: settingsResponse.behaviour,
          welcomeMessage: settingsResponse.welcome_message,
          transferConditions: settingsResponse.transfer_condition,
          model: settingsResponse.model,
          aiHistoryLimit: settingsResponse.history_limit,
          aiContextLimit: settingsResponse.context_limit,
          messageAwait: settingsResponse.message_await,
          aiMessageLimit: settingsResponse.message_limit,
          rajaongkir_enabled: settingsResponse.rajaongkir_enabled,
          rajaongkir_origin_district:
            settingsResponse.rajaongkir_origin_district,
          rajaongkir_couriers: settingsResponse.rajaongkir_couriers,
          // UI state (default values)
          isActive: true,
          stopAIAfterHandoff: true,
          timezone: "(GMT+07:00) Asia/Jakarta",
          selectedLabels: [],
        };

        setAgentData(combinedData);
      } catch (err: any) {
        console.error("Error loading agent data:", err);
        setError(err.message || "Failed to load agent data");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAgentData();
  }, [actualAgentId]);

  const [customIntegrations, setCustomIntegrations] = useState<CustomIntegrationDetail[]>([]);
  const [customIntegrationsLoading, setCustomIntegrationsLoading] =
    useState(false);
  const [, setCustomIntegrationsError] = useState<string | null>(null);
  const [activatedIntegrations, setActivatedIntegrations] = useState<any[]>([]);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activateIntegration, setActivateIntegration] = useState<any>(null);
  const [editIntegration, setEditIntegration] = useState<any>(null);
  const [activateLoading, setActivateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [triggerCondition, setTriggerCondition] = useState("");
  const [cooldownMinutes, setCooldownMinutes] = useState(0);
  const [executionOrder, setExecutionOrder] = useState(1);
  const [dependsOnIntegration, setDependsOnIntegration] = useState<string | null>(null);
  const [requireSucess, setRequireSucess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<any>(null);
  const { success } = useToast();

  useEffect(() => {
    setCustomIntegrationsLoading(true);
    setCustomIntegrationsError(null);
    getCustomIntegrations()
      .then((res) => {
        setCustomIntegrations(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        setCustomIntegrationsError(
          err.message || "Failed to load custom integrations"
        );
      })
      .finally(() => setCustomIntegrationsLoading(false));
  }, []);

  // Fetch activated integrations for this agent
  useEffect(() => {
    if (!actualAgentId) return;

    axios.get(`/v1/ai-agents/${actualAgentId}/integrations`)
      .then(async res => {
        const activatedIntegrations = Array.isArray(res.data) ? res.data : [];
        
        // Enhance activated integrations with custom fields from integration definitions
        const enhancedIntegrations = await Promise.all(
          activatedIntegrations.map(async (activated) => {
            try {
              // Find the corresponding custom integration to get field definitions
              const customIntegration = customIntegrations.find(ci => ci.id === activated.id_integration);
              if (customIntegration && customIntegration.fields) {
                // Convert fields array to a more usable format for the behavior editor
                const fieldsObject = customIntegration.fields.reduce((acc, field) => {
                  acc[field.field_name] = {
                    type: field.field_type,
                    required: field.is_required,
                    description: field.description,
                    enum_values: field.enum_values,
                    default_value: field.default_value
                  };
                  return acc;
                }, {} as any);
                
                return {
                  ...activated,
                  custom_integration_fields: fieldsObject
                };
              }
              return activated;
            } catch (error) {
              console.error('Error enhancing integration:', activated.id_integration, error);
              return activated;
            }
          })
        );
        
        setActivatedIntegrations(enhancedIntegrations);
      })
      .catch(err => {
        console.error('Failed to load activated integrations:', err);
      });
  }, [actualAgentId, customIntegrations]);

  const handleInputChange = (
    field: keyof AIAgentData,
    value: string | boolean | number | string[]
  ) => {
    if (!agentData) return;
    setAgentData((prev) => (prev ? { ...prev, [field]: value } : null));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!agentData || !actualAgentId) return;

    setIsLoading(true);
    try {
      // Update agent basic info
      await AgentsService.updateAgent(actualAgentId, {
        name: agentData.name,
        description: agentData.description,
      });

      // Update agent settings using the settings ID
      // Ensure rajaongkir_couriers is always an array
      let couriers: string[] = [];
      if (Array.isArray(agentData.rajaongkir_couriers)) {
        couriers = agentData.rajaongkir_couriers.filter(Boolean);
      } else if (typeof agentData.rajaongkir_couriers === "string") {
        try {
          couriers = String(agentData.rajaongkir_couriers)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        } catch {
          couriers = String(agentData.rajaongkir_couriers)
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
        }
      }
      await AgentsService.updateAgentSettings(agentData.id_settings, {
        behaviour: agentData.behaviour,
        welcome_message: agentData.welcomeMessage,
        transfer_condition: agentData.transferConditions,
        model: agentData.model,
        history_limit: agentData.aiHistoryLimit,
        context_limit: agentData.aiContextLimit,
        message_await: agentData.messageAwait,
        message_limit: agentData.aiMessageLimit,
        rajaongkir_enabled: agentData.rajaongkir_enabled,
        rajaongkir_origin_district: agentData.rajaongkir_origin_district,
        rajaongkir_couriers: couriers.join(","), // Ensure string type
      });

      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving changes:", error);
      setError(error.message || "Failed to save changes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIntegration = async () => {
    if (!editIntegration || !actualAgentId) return;

    setEditLoading(true);
    setEditError(null);
    try {
      await axios.put(`/v1/ai-agents/${actualAgentId}/${editIntegration.id_integration}/integrations`, {
        trigger_condition: triggerCondition,
        is_enabled: isEnabled,
        cooldown_minutes: cooldownMinutes,
        requires_success: requireSucess,
        execution_order: executionOrder,
        depends_on_integration: dependsOnIntegration,
      });

      // Refresh activated integrations
      const res = await axios.get(`/v1/ai-agents/${actualAgentId}/integrations`);
      setActivatedIntegrations(Array.isArray(res.data) ? res.data : []);

      setEditModalOpen(false);

      // Show success message
      success("Integration Updated Successfully", "The integration settings have been updated.");
    } catch (err: any) {
      setEditError(err?.response?.data?.message || err.message || 'Failed to update integration');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!actualAgentId) return;

    setDeleteLoading(true);
    try {
      await axios.delete(`/v1/ai-agents/${actualAgentId}/${integrationId}/integrations`);

      // Refresh activated integrations
      const res = await axios.get(`/v1/ai-agents/${actualAgentId}/integrations`);
      setActivatedIntegrations(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Failed to delete integration:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isIntegrationActivated = (integrationId: string) => {
    return activatedIntegrations.some(activated => activated.id_integration === integrationId);
  };

  const getActivatedIntegration = (integrationId: string) => {
    return activatedIntegrations.find(activated => activated.id_integration === integrationId);
  };

  const handleBack = () => {
    navigate("/ai-agents");
  };

  // Loading state
  if (isLoadingData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading agent data...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !agentData) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">
              {error || "Failed to load agent data"}
            </p>
            <Button onClick={() => navigate("/ai-agents")}>
              Back to Agents
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const behaviorCharacterCount = agentData.behaviour.length;
  const welcomeCharacterCount = agentData.welcomeMessage.length;
  const transferCharacterCount = agentData.transferConditions.length;

  return (
    <MainLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarFallback className="bg-green-100 text-green-700">
                    <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                    {agentData.name}
                  </h1>
                  <p className="text-green-600 font-medium text-sm sm:text-base">
                    AI Agent
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isLoading}
              className="bg-primary text-white text-sm sm:text-base h-9 sm:h-10"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Content Area - Always Scrollable */}
        <div className="px-3 sm:px-6 py-4 sm:py-6 pb-20">
          <Tabs defaultValue="general" className="w-full">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg mb-4 sm:mb-6 shadow-sm border border-gray-200">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-transparent h-auto p-0">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none outline-none focus:outline-none text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">General</span>
                  <span className="sm:hidden">General</span>
                </TabsTrigger>
                <TabsTrigger
                  value="knowledge"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none outline-none focus:outline-none text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3"
                >
                  <Database className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Knowledge Sources</span>
                  <span className="sm:hidden">Knowledge</span>
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none outline-none focus:outline-none text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 col-span-2 sm:col-span-1"
                >
                  <Link className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Integrations</span>
                  <span className="sm:hidden">Integrations</span>
                </TabsTrigger>
                <TabsTrigger
                  value="followups"
                  className="hidden sm:flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none outline-none focus:outline-none text-sm px-4 py-3"
                >
                  <RefreshCw className="h-4 w-4" />
                  Followups
                </TabsTrigger>
                <TabsTrigger
                  value="existing"
                  className="hidden sm:flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none outline-none focus:outline-none text-sm px-4 py-3"
                >
                  <FileText className="h-4 w-4" />
                  Existing Knowledge Sources
                </TabsTrigger>
              </TabsList>

              {/* Mobile-only additional tabs */}
              <div className="sm:hidden mt-2">
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="followups"
                    className="flex items-center gap-1 data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none outline-none focus:outline-none text-xs px-2 py-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Followups
                  </TabsTrigger>
                  <TabsTrigger
                    value="existing"
                    className="flex items-center gap-1 data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none outline-none focus:outline-none text-xs px-2 py-2"
                  >
                    <FileText className="h-3 w-3" />
                    Existing
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
              {/* Left Panel - Configuration */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                  <TabsContent value="general" className="mt-0 space-y-6">
                    {/* Agent Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="agentName"
                        className="text-sm font-medium"
                      >
                        Agent Name
                      </Label>
                      <Input
                        id="agentName"
                        value={agentData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={agentData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* AI Agent Behavior */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium ">
                          AI Agent Behavior
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ini adalah AI Prompt yang akan menentukan gaya bicara
                          dan identitas AI.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <BehaviorEditor
                          value={agentData.behaviour}
                          onChange={(value) =>
                            handleInputChange("behaviour", value)
                          }
                          activatedIntegrations={activatedIntegrations}
                          maxLength={10000}
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium ">
                          Welcome Message
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          value={agentData.welcomeMessage}
                          onChange={(e) =>
                            handleInputChange("welcomeMessage", e.target.value)
                          }
                          className="min-h-[80px] resize-none"
                          maxLength={500}
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{welcomeCharacterCount}/500</span>
                        </div>
                      </div>
                    </div>

                    {/* Agent Transfer Conditions */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium ">
                          Agent Transfer Conditions
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          value={agentData.transferConditions}
                          onChange={(e) =>
                            handleInputChange(
                              "transferConditions",
                              e.target.value
                            )
                          }
                          className="min-h-[80px] resize-none"
                          maxLength={1000}
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{transferCharacterCount}/1000</span>
                        </div>
                      </div>
                    </div>

                    {/* Stop AI after Handoff */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stopAI"
                        checked={agentData.stopAIAfterHandoff}
                        onCheckedChange={(checked) =>
                          handleInputChange(
                            "stopAIAfterHandoff",
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor="stopAI" className="text-sm font-medium">
                        Stop AI after Handoff
                      </Label>
                    </div>

                    {/* RajaOngkir Enabled Toggle */}
                    {/* <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="rajaongkir_enabled"
                        checked={!!agentData.rajaongkir_enabled}
                        onCheckedChange={(checked) =>
                          handleInputChange("rajaongkir_enabled", checked as boolean)
                        }
                      />
                      <Label htmlFor="rajaongkir_enabled" className="text-sm font-medium">
                        Aktifkan RajaOngkir
                      </Label>
                    </div> */}

                    {/* Additional Settings */}
                    <Collapsible
                      open={isAdditionalSettingsOpen}
                      onOpenChange={setIsAdditionalSettingsOpen}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between p-0 h-auto"
                        >
                          <span className="text-sm font-medium ">
                            Additional Settings
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isAdditionalSettingsOpen ? "rotate-180" : ""
                              }`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-4">
                        {/* Model */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="model"
                            className="text-sm font-medium"
                          >
                            Model
                          </Label>
                          <Select
                            value={agentData.model}
                            onValueChange={(value) =>
                              handleInputChange("model", value)
                            }
                            // defaultValue="gpt-4.1"
                            defaultValue="gpt-4.1-nano"
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* <SelectItem value="gpt-4.1"> */}
                              <SelectItem value="gpt-4.1-nano">
                                Very High Intelligence
                              </SelectItem>
                              {/* <SelectItem value="gpt-4.1">
                                High Intelligence (Recommended)
                              </SelectItem>
                              <SelectItem value="gpt-4.1">
                                Medium Intelligence
                              </SelectItem>
                              <SelectItem value="gpt-4.1">
                                Low Intelligence
                              </SelectItem> */}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Kecerdasan AI yang akan digunakan
                          </p>
                        </div>

                        {/* AI History Limit */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="aiHistoryLimit"
                            className="text-sm font-medium"
                          >
                            AI History Limit
                          </Label>
                          <Input
                            id="aiHistoryLimit"
                            type="number"
                            value={agentData.aiHistoryLimit}
                            onChange={(e) =>
                              handleInputChange(
                                "aiHistoryLimit",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Berapa banyak pesan yang akan diingat AI
                          </p>
                        </div>

                        {/* AI Context Limit */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="aiContextLimit"
                            className="text-sm font-medium"
                          >
                            AI Context Limit
                          </Label>
                          <Input
                            id="aiContextLimit"
                            type="number"
                            value={agentData.aiContextLimit}
                            onChange={(e) =>
                              handleInputChange(
                                "aiContextLimit",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Level AI untuk membaca knowledge source
                          </p>
                        </div>

                        {/* Message Await */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="messageAwait"
                            className="text-sm font-medium"
                          >
                            Message Await
                          </Label>
                          <Input
                            id="messageAwait"
                            type="number"
                            value={agentData.messageAwait}
                            onChange={(e) =>
                              handleInputChange(
                                "messageAwait",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Delay Waktu AI untuk merespon pesan pengguna
                          </p>
                        </div>

                        {/* AI Message Limit */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="aiMessageLimit"
                            className="text-sm font-medium"
                          >
                            AI Message Limit
                          </Label>
                          <Input
                            id="aiMessageLimit"
                            type="number"
                            value={agentData.aiMessageLimit}
                            onChange={(e) =>
                              handleInputChange(
                                "aiMessageLimit",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Limit pesan yang bisa dikirim oleh AI ke satu
                            customer
                          </p>
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                          <Label
                            htmlFor="timezone"
                            className="text-sm font-medium"
                          >
                            Timezone
                          </Label>
                          <Select
                            value={agentData.timezone}
                            onValueChange={(value) =>
                              handleInputChange("timezone", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="(GMT+07:00) Asia/Jakarta">
                                (GMT+07:00) Asia/Jakarta
                              </SelectItem>
                              <SelectItem value="(GMT+08:00) Asia/Singapore">
                                (GMT+08:00) Asia/Singapore
                              </SelectItem>
                              <SelectItem value="(GMT+09:00) Asia/Tokyo">
                                (GMT+09:00) Asia/Tokyo
                              </SelectItem>
                              <SelectItem value="(GMT+00:00) UTC">
                                (GMT+00:00) UTC
                              </SelectItem>
                              <SelectItem value="(GMT-05:00) America/New_York">
                                (GMT-05:00) America/New_York
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TabsContent>

                  <TabsContent value="knowledge" className="mt-0">
                    <Tabs defaultValue="text" className="w-full">
                      {/* Knowledge Sources Nested Tabs */}
                      <div className="border-b border-gray-200 mb-6">
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 bg-transparent h-auto p-0">
                          <TabsTrigger
                            value="text"
                            className="data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2 sm:py-3 outline-none focus:outline-none text-xs sm:text-sm"
                          >
                            Text
                          </TabsTrigger>
                          <TabsTrigger
                            value="website"
                            className="data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2 sm:py-3 outline-none focus:outline-none text-xs sm:text-sm"
                          >
                            Website
                          </TabsTrigger>
                          <TabsTrigger
                            value="product"
                            className="data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2 sm:py-3 outline-none focus:outline-none text-xs sm:text-sm"
                          >
                            Product
                          </TabsTrigger>
                          <TabsTrigger
                            value="file"
                            className="data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2 sm:py-3 outline-none focus:outline-none text-xs sm:text-sm"
                          >
                            File
                          </TabsTrigger>
                          <TabsTrigger
                            value="qa"
                            className="data-[state=active]:bg-transparent  data-[state=active]:border-primary data-[state=active]:text-primary rounded-none py-2 sm:py-3 outline-none focus:outline-none text-xs sm:text-sm"
                          >
                            Q&A
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <KnowledgeTab agentId={actualAgentId || ""} />
                    </Tabs>
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-0">
                    <div className="flex flex-col justify-center py-8 gap-10">
                      {/* Section 1: Integrations */}
                      <div>
                        <h2 className="text-lg font-semibold mb-4">
                          Integrations
                        </h2>
                        <div className="w-full">
                          <Card>
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                              <div className="p-3 bg-yellow-100 rounded-lg">
                                <Truck className="h-6 w-6 text-yellow-600" />
                              </div>
                              <CardTitle className="text-lg">
                                Cek Ongkos Kirim
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription>
                                Mengecek ongkir dari berbagai kurir dan
                                mendapatkan status pengiriman
                              </CardDescription>
                            </CardContent>
                            <CardFooter>
                              <Button
                                onClick={() =>
                                  navigate("/integration/shipping")
                                }
                                className="w-full"
                                variant="outline"
                              >
                                Aktifkan
                              </Button>
                            </CardFooter>
                          </Card>
                        </div>
                      </div>
                      {/* Section 2: Custom Integration */}
                      <div>
                        {/* <h2 className="text-lg font-semibold mb-4">Custom Integration</h2>
                        <div className="w-full max-w-sm mb-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <Webhook className="h-6 w-6 text-blue-600" />
                              </div>
                              <CardTitle className="text-lg">API Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription>
                                Integrasi dengan API eksternal untuk memperluas kemampuan AI Agent Anda
                              </CardDescription>
                            </CardContent>
                            <CardFooter>
                              <Button onClick={() => navigate("/integration/api")}
                                className="w-full" variant="outline">Aktifkan</Button>
                            </CardFooter>
                          </Card>
                        </div> */}
                        {/* List Custom Integrations */}
                        <div className="w-full">
                          <h3 className="text-lg font-semibold mb-4">
                            List Custom Integrations
                          </h3>
                          {customIntegrationsLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground py-4">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Loading custom integrations...</span>
                            </div>
                          ) : customIntegrations.length === 0 ? (
                            <Card>
                              <CardHeader className="flex flex-row  items-center gap-3 pb-2">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                  <Webhook className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg">
                                  API Integration
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <CardDescription>
                                  Integrasi dengan API eksternal untuk
                                  memperluas kemampuan AI Agent Anda
                                </CardDescription>
                              </CardContent>
                              <CardFooter>
                                <Button
                                  onClick={() => navigate("/integration/api")}
                                  className="w-full"
                                  variant="outline"
                                >
                                  Aktifkan
                                </Button>
                              </CardFooter>
                            </Card>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {customIntegrations.map((integration: any) => {
                                const isActivated = isIntegrationActivated(integration.id);
                                const activatedIntegration = isActivated ? getActivatedIntegration(integration.id) : null;

                                return (
                                  <Card
                                    key={integration.id || integration.name}
                                    className={`relative ${isActivated
                                      ? activatedIntegration?.is_enabled
                                        ? 'border-green-500 justify-between bg-green-50'
                                        : 'border-gray-300 justify-between bg-gray-50 opacity-75'
                                      : ' justify-between hover:shadow-md transition-shadow'
                                      }`}
                                  >
                                    {isActivated && (
                                      <div className="absolute top-3 right-3">
                                        <div className={`w-2 h-2 rounded-full ${activatedIntegration?.is_enabled ? 'bg-green-500' : 'bg-gray-400'
                                          }`}></div>
                                      </div>
                                    )}
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-sm font-semibold text-gray-900">{integration.name}</CardTitle>
                                      <CardDescription className="text-xs text-gray-600 line-clamp-2">
                                        {integration.description && integration.description.length > 80
                                          ? integration.description.substring(0, 80) + '...'
                                          : integration.description}
                                      </CardDescription>
                                      {isActivated && activatedIntegration && (
                                        <div className="mt-2 space-y-1">
                                          <div className="text-xs text-gray-600">
                                            <span className="font-medium">Trigger:</span>
                                            <span className="truncate block max-w-full" title={activatedIntegration.trigger_condition || '-'}>
                                              {activatedIntegration.trigger_condition && activatedIntegration.trigger_condition.length > 50
                                                ? activatedIntegration.trigger_condition.substring(0, 50) + '...'
                                                : activatedIntegration.trigger_condition || '-'}
                                            </span>
                                          </div>
                                          <div className="text-xs">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${activatedIntegration.is_enabled
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-800'
                                              }`}>
                                              {activatedIntegration.is_enabled ? 'Active' : 'Inactive'}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </CardHeader>
                                    <CardFooter className="pt-0 flex gap-2">
                                      {isActivated ? (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                              setEditIntegration(activatedIntegration);
                                              setIsEnabled(activatedIntegration.is_enabled);
                                              setTriggerCondition(activatedIntegration.trigger_condition || '');
                                              setCooldownMinutes(activatedIntegration.cooldown_minutes || 0);
                                              setExecutionOrder(activatedIntegration.execution_order || 1);
                                              setDependsOnIntegration(activatedIntegration.depends_on_integration || null);
                                              setRequireSucess(activatedIntegration.requires_success || false);
                                              setEditModalOpen(true);
                                            }}
                                            className="flex-1 text-xs"
                                          >
                                            Update
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              setIntegrationToDelete(integration);
                                              setDeleteModalOpen(true);
                                            }}
                                            disabled={deleteLoading}
                                            className="flex-1 text-xs"
                                          >
                                            {deleteLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                            Delete
                                          </Button>
                                        </>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setActivateIntegration(integration);
                                            setIsEnabled(true);
                                            setTriggerCondition(integration.trigger_condition || '');
                                            setCooldownMinutes(0);
                                            setExecutionOrder(1);
                                            setDependsOnIntegration(null);
                                            setRequireSucess(false);
                                            setActivateModalOpen(true);
                                          }}
                                          className="w-full text-xs"
                                        >
                                          Active
                                        </Button>
                                      )}
                                    </CardFooter>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="followups" className="mt-0">
                    <div className="text-center py-12">
                      <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Followups
                      </h3>
                      <p className="text-muted-foreground">
                        Configure automated followup messages.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="existing" className="mt-0">
                    <ExistingKnowledgeList agentId={actualAgentId || ""} />
                  </TabsContent>
                </div>
              </div>

              {/* Right Panel - Chat Preview (Desktop Only) */}
              <div className="hidden lg:block w-full lg:w-96 lg:flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <AIAgentChatPreview
                    agentId={actualAgentId || ""}
                    agentName={agentData.name}
                    welcomeMessage={agentData.welcomeMessage}
                  />
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Floating Chat Button (Mobile Only) */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-white shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md p-0">
          {/* <DialogHeader className="p-4 pb-0">
            <DialogTitle>Chat Preview</DialogTitle>
          </DialogHeader> */}
          <AIAgentChatPreview
            agentId={actualAgentId || ""}
            agentName={agentData.name}
            welcomeMessage={agentData.welcomeMessage}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Aktivasi Integration */}
      <Dialog open={activateModalOpen} onOpenChange={setActivateModalOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Aktifkan Custom Integration</DialogTitle>
          </DialogHeader>
          {activateError && (
            <div className="text-red-600 text-sm mb-2 flex-shrink-0">{activateError}</div>
          )}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Checkbox
                id="is_enabled"
                checked={isEnabled}
                onCheckedChange={(v) => setIsEnabled(!!v)}
              />
              <label htmlFor="is_enabled" className="ml-2">
                Aktifkan Integration
              </label>
            </div>
            <div>
              <label htmlFor="trigger_condition" className="block mb-1 text-sm">Trigger Condition</label>
              <textarea
                id="trigger_condition"
                value={triggerCondition}
                onChange={(e) => setTriggerCondition(e.target.value)}
                placeholder="Masukkan trigger condition"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="cooldown_minutes" className="block mb-1 text-sm">Cooldown Minutes</label>
              <input
                type="number"
                id="cooldown_minutes"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(parseInt(e.target.value) || 0)}
                placeholder="Enter cooldown in minutes"
                min="0"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="execution_order" className="block mb-1 text-sm">Execution Order</label>
              <input
                type="number"
                id="execution_order"
                value={executionOrder}
                onChange={(e) => setExecutionOrder(parseInt(e.target.value) || 1)}
                placeholder="Enter execution order"
                min="1"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="depends_on_integration" className="block mb-1 text-sm">Depends on Integration</label>
              <select
                id="depends_on_integration"
                value={dependsOnIntegration || ""}
                onChange={(e) => setDependsOnIntegration(e.target.value || null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">None</option>
                {activatedIntegrations.filter(ai => ai.id_integration !== activateIntegration?.id).map((ai) => (
                  <option key={ai.id_integration} value={ai.id_integration}>
                    {ai.integration_name || ai.id_integration}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Checkbox
                id="require_success"
                checked={requireSucess}
                onCheckedChange={(v) => setRequireSucess(!!v)}
              />
              <label htmlFor="require_success" className="ml-2">
                Require Success
              </label>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              onClick={async () => {
                if (!activateIntegration) return;
                setActivateLoading(true);
                setActivateError(null);
                try {
                  await axios.post("/v1/ai-agent-integrations", {
                    id_ai_agent: actualAgentId,
                    id_integration: activateIntegration.id,
                    is_enabled: isEnabled,
                    trigger_condition: triggerCondition,
                    cooldown_minutes: cooldownMinutes,
                    requires_success: requireSucess,
                    execution_order: executionOrder,
                    depends_on_integration: dependsOnIntegration,
                    is_active: false,
                  });

                  // Refresh activated integrations
                  const res = await axios.get(`/v1/ai-agents/${actualAgentId}/integrations`);
                  setActivatedIntegrations(Array.isArray(res.data) ? res.data : []);

                  setActivateModalOpen(false);
                } catch (err: any) {
                  setActivateError(
                    err?.response?.data?.message ||
                    err.message ||
                    "Gagal mengaktifkan integration"
                  );
                } finally {
                  setActivateLoading(false);
                }
              }}
              disabled={activateLoading}
            >
              {activateLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Aktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Edit Integration */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Custom Integration</DialogTitle>
          </DialogHeader>
          {editError && <div className="text-red-600 text-sm mb-2 flex-shrink-0">{editError}</div>}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            <div>
              <Checkbox id="edit_is_enabled" checked={isEnabled} onCheckedChange={v => setIsEnabled(!!v)} />
              <label htmlFor="edit_is_enabled" className="ml-2">Aktifkan Integration</label>
            </div>
            <div>
              <label htmlFor="edit_trigger_condition" className="block mb-1 text-sm">Trigger Condition</label>
              <textarea
                id="edit_trigger_condition"
                value={triggerCondition}
                onChange={e => setTriggerCondition(e.target.value)}
                placeholder="Masukkan trigger condition"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="edit_cooldown_minutes" className="block mb-1 text-sm">Cooldown Minutes</label>
              <input
                type="number"
                id="edit_cooldown_minutes"
                value={cooldownMinutes}
                onChange={e => setCooldownMinutes(parseInt(e.target.value) || 0)}
                placeholder="Enter cooldown in minutes"
                min="0"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="edit_execution_order" className="block mb-1 text-sm">Execution Order</label>
              <input
                type="number"
                id="edit_execution_order"
                value={executionOrder}
                onChange={e => setExecutionOrder(parseInt(e.target.value) || 1)}
                placeholder="Enter execution order"
                min="1"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="edit_depends_on_integration" className="block mb-1 text-sm">Depends on Integration</label>
              <select
                id="edit_depends_on_integration"
                value={dependsOnIntegration || ""}
                onChange={e => setDependsOnIntegration(e.target.value || null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">None</option>
                {activatedIntegrations.filter(ai => ai.id_integration !== editIntegration?.id_integration).map((ai) => (
                  <option key={ai.id_integration} value={ai.id_integration}>
                    {ai.integration_name || ai.id_integration}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Checkbox
                id="edit_require_success"
                checked={requireSucess}
                onCheckedChange={(v) => setRequireSucess(!!v)}
              />
              <label htmlFor="edit_require_success" className="ml-2">
                Require Success
              </label>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              onClick={handleEditIntegration}
              disabled={editLoading}
            >
              {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Delete Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the integration <strong>{integrationToDelete?.name}</strong>?
              This action cannot be undone and will remove all associated configurations.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (integrationToDelete) {
                  await handleDeleteIntegration(integrationToDelete.id);
                  setDeleteModalOpen(false);
                  setIntegrationToDelete(null);
                }
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
