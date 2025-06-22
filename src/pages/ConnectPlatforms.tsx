"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Save,
  Trash2,
  Phone,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Globe,
  Users,
  Bot,
  User,
  Settings,
  Star,
  X,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import MainLayout from "@/main-layout";
import { selectWhatsAppConnectionData } from "@/store/whatsappSlice";
import { whatsappService } from "@/services/whatsappService";
import { AgentsService } from "@/services/agentsService";
import { HumanAgentsService } from "@/services/humanAgentsService";
import { AgentMappingService } from "@/services/agentMappingService";
import type { HumanAgent } from "@/services/humanAgentsService";
import type { AIAgent } from "@/types";
import { Toast } from "@/components/ui/toast";

const platformIcons = {
  whatsapp: MessageSquare,
  instagram: Instagram,
  facebook: Facebook,
  email: Mail,
  website: Globe,
  twitter: Twitter,
};

const distributionMethods = [
  { value: "least-assigned", label: "Least Assigned First" },
  { value: "round-robin", label: "Round Robin" },
];

// WhatsApp Platform interface based on API response
interface WhatsAppPlatform {
  id: string;
  name: string;
  type: "whatsapp";
  phone: string;
  description?: string;
  isActive: boolean;
  deviceId: string;
  deviceName: string;
  status: string;
  sessionId: string;
  timestamp: string;
  isConnected: boolean;
  isLoggedIn: boolean;
  // Additional fields for platform configuration
  aiAgent?: string;
  teams?: string[];
  humanAgent?: string;
  distributionMethod?: string;
  csatEnabled?: boolean;
}

export default function ConnectedPlatformsPage() {
  const [selectedPlatform, setSelectedPlatform] =
    useState<WhatsAppPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [whatsappPlatforms, setWhatsappPlatforms] = useState<
    WhatsAppPlatform[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Agent states
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [humanAgents, setHumanAgents] = useState<HumanAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [humanAgentsLoading, setHumanAgentsLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    description: string;
  } | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Get WhatsApp connection data from Redux
  const whatsappConnectionData = useSelector(selectWhatsAppConnectionData);
  // Add debug logging
  useEffect(() => {}, [whatsappConnectionData]);
  // Fetch WhatsApp status on component mount
  useEffect(() => {
    const fetchWhatsAppStatus = async () => {
      // Try to get deviceId from Redux first, then use fallback from localStorage or hardcoded
      let deviceId = whatsappConnectionData.deviceId;

      // If no deviceId in Redux, try to get from localStorage
      // if (!deviceId) {
      //   try {
      //     const userData = localStorage.getItem('user_data');
      //     if (userData) {
      //       const parsedData = JSON.parse(userData);
      //       deviceId = parsedData.whatsapp_device_id;
      //     }
      //   } catch (error) {
      //   }
      // }

      // Final fallback to hardcoded deviceId
      if (!deviceId) {
        deviceId = "1082fe3c_device_1750494274779_67xmoijuo";
        console.warn("Using fallback deviceId:", deviceId);
      }

      setLoading(true);
      setError(null);

      try {
        const response = await whatsappService.getStatus(deviceId);

        if (response.success) {
          const platform: WhatsAppPlatform = {
            id: response.data.device_id,
            name: response.data.device_name || "WhatsApp Business",
            type: "whatsapp",
            phone: response.data.phone_number,
            description: `WhatsApp Business - ${response.data.status}`,
            isActive: response.data.is_logged_in,
            deviceId: response.data.device_id,
            deviceName: response.data.device_name,
            status: response.data.status,
            sessionId: whatsappConnectionData.sessionId || "",
            timestamp: response.data.timestamp,
            isConnected: response.data.is_connected,
            isLoggedIn: response.data.is_logged_in,
            // Set default configuration values
            aiAgent: "DISTCCTV AI",
            teams: ["DISTCCTV"],
            humanAgent: "SPV DISTCCTV",
            distributionMethod: "least-assigned",
            csatEnabled: false,
          };
          setWhatsappPlatforms([platform]);

          // Auto-select the first platform if none is selected
          if (!selectedPlatform) {
            setSelectedPlatform(platform);
          }
        } else {
          setError(`API Error: ${response.message || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Failed to fetch WhatsApp status:", err);
        if (err instanceof Error) {
          console.error("Error message:", err.message);
          console.error("Error stack:", err.stack);
        }
        setError(
          err instanceof Error ? err.message : "Failed to fetch WhatsApp status"
        );
      } finally {
        setLoading(false);
      }    };
    fetchWhatsAppStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whatsappConnectionData.deviceId, whatsappConnectionData.sessionId]);
  // Fetch AI agents
  useEffect(() => {
    const fetchAiAgents = async () => {
      setAgentsLoading(true);
      try {
        const response = await AgentsService.getAgentsWithPagination(10, 0);
        console.log("AI Agents API Response:", response);
        console.log("AI Agents data:", response.data);
        setAiAgents(response.data || []);
      } catch (error) {
        console.error("Error fetching AI agents:", error);
      } finally {
        setAgentsLoading(false);
      }
    };

    fetchAiAgents();
  }, []);

  // Fetch human agents
  useEffect(() => {
    const fetchHumanAgents = async () => {
      setHumanAgentsLoading(true);
      try {
        const agents = await HumanAgentsService.getHumanAgents();
        console.log("Human Agents API Response:", agents);
        setHumanAgents(agents);
      } catch (error) {
        console.error("Error fetching human agents:", error);
      } finally {
        setHumanAgentsLoading(false);
      }
    };    fetchHumanAgents();
  }, []);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast?.show) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const fetchWhatsAppStatus = async () => {
    // Try to get deviceId from Redux first, then use fallback from localStorage or hardcoded
    let deviceId = whatsappConnectionData.deviceId;

    // If no deviceId in Redux, try to get from localStorage
    if (!deviceId) {
      try {
        const userData = localStorage.getItem("user_data");
        if (userData) {
          const parsedData = JSON.parse(userData);
          deviceId = parsedData.whatsapp_device_id;
        }
      } catch (error) {
        console.error("Error parsing user_data from localStorage:", error);
      }
    }

    // Final fallback to hardcoded deviceId
    if (!deviceId) {
      deviceId = "1082fe3c_device_1750494274779_67xmoijuo";
      console.warn("Using fallback deviceId for manual refresh:", deviceId);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await whatsappService.getStatus(deviceId);

      if (response.success) {
        const platform: WhatsAppPlatform = {
          id: response.data.device_id,
          name: response.data.device_name || "WhatsApp Business",
          type: "whatsapp",
          phone: response.data.phone_number,
          description: `WhatsApp Business - ${response.data.status}`,
          isActive: response.data.is_logged_in,
          deviceId: response.data.device_id,
          deviceName: response.data.device_name,
          status: response.data.status,
          sessionId: whatsappConnectionData.sessionId || "",
          timestamp: response.data.timestamp,
          isConnected: response.data.is_connected,
          isLoggedIn: response.data.is_logged_in,
          // Set default configuration values with existing values preserved
          aiAgent: selectedPlatform?.aiAgent || "DISTCCTV AI",
          teams: selectedPlatform?.teams || ["DISTCCTV"],
          humanAgent: selectedPlatform?.humanAgent || "SPV DISTCCTV",
          distributionMethod:
            selectedPlatform?.distributionMethod || "least-assigned",
          csatEnabled: selectedPlatform?.csatEnabled || false,
        };
        setWhatsappPlatforms([platform]);

        // Update selected platform if it's the same device
        if (selectedPlatform?.id === platform.id) {
          setSelectedPlatform(platform);
        } else if (!selectedPlatform) {
          setSelectedPlatform(platform);
        }
      } else {
        setError(`API Error: ${response.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Failed to fetch WhatsApp status (Manual):", err);
      if (err instanceof Error) {
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      }
      setError(
        err instanceof Error ? err.message : "Failed to fetch WhatsApp status"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredPlatforms = whatsappPlatforms.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );  const handleSave = async () => {
    if (!selectedPlatform) return;

    // Validate required fields
    if (!selectedPlatform.aiAgent) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Please select an AI Agent before saving."
      });
      return;
    }    const whatsappNumber = whatsappConnectionData.phoneNumber || selectedPlatform.phone;
    if (!whatsappNumber) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "WhatsApp number is required."
      });
      return;
    }

    const deviceId = whatsappConnectionData.deviceId || selectedPlatform.deviceId;
    if (!deviceId) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Device ID is required."
      });
      return;
    }

    // Find the selected AI agent to get its ID
    const selectedAIAgent = aiAgents.find(agent => agent.name === selectedPlatform.aiAgent);
    if (!selectedAIAgent) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Selected AI Agent not found."
      });
      return;
    }

    setIsSaving(true);
      try {      const requestData = {
        whatsapp_number: whatsappNumber,
        agent_id: selectedAIAgent.id,
        is_active: true,
        DeviceID: deviceId,
        MappingType: "ai_agent"  // Assuming this is the mapping type for AI agents
      };

      console.log("Sending agent mapping request:", requestData);
      
      const response = await AgentMappingService.createMapping(requestData);
      
      if (response.status === "success") {
        setToast({
          show: true,
          type: "success",
          title: "Mapping Created Successfully",
          description: `WhatsApp number ${whatsappNumber} has been mapped to ${selectedPlatform.aiAgent}`
        });

        // Update the platform in the list
        setWhatsappPlatforms((prev) =>
          prev.map((p) => (p.id === selectedPlatform.id ? selectedPlatform : p))
        );
      } else {
        throw new Error(response.message || "Failed to create mapping");
      }
    } catch (error) {
      console.error("Error creating agent mapping:", error);
      setToast({
        show: true,
        type: "error",
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save agent mapping"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!selectedPlatform) return;

    setWhatsappPlatforms((prev) =>
      prev.filter((p) => p.id !== selectedPlatform.id)
    );
    const remainingPlatforms = whatsappPlatforms.filter(
      (p) => p.id !== selectedPlatform.id
    );
    if (remainingPlatforms.length > 0) {
      setSelectedPlatform(remainingPlatforms[0]);
    } else {
      setSelectedPlatform(null);
    }
  };

  const updateSelectedPlatform = (updates: Partial<WhatsAppPlatform>) => {
    if (!selectedPlatform) return;
    setSelectedPlatform((prev) =>
      prev ? ({ ...prev, ...updates } as WhatsAppPlatform) : null
    );
  };

  const removeTeam = (teamToRemove: string) => {
    if (!selectedPlatform || !selectedPlatform.teams) return;
    updateSelectedPlatform({
      teams: selectedPlatform.teams.filter((team) => team !== teamToRemove),
    });
  };

  const PlatformIcon = selectedPlatform
    ? platformIcons[selectedPlatform.type] || MessageSquare
    : MessageSquare;

  return (
    <MainLayout>
      <div className="flex h-full bg-background">
        {/* Left Sidebar - Platforms List */}
        <div className="w-96 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            {" "}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Inboxes
                </h2>
                <p className="text-sm text-muted-foreground">
                  This is where you can connect all your platforms
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  onClick={fetchWhatsAppStatus}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>{" "}
          <div className="overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Clock className="h-6 w-6 text-gray-400 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Loading platforms...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-400" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      Error loading platforms
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {error}
                    </p>
                    {/* Debug Info */}
                    <div className="text-left bg-gray-50 p-3 rounded text-xs font-mono mb-4">
                      <div>
                        Redux deviceId:{" "}
                        {whatsappConnectionData.deviceId || "null"}
                      </div>
                      <div>
                        Redux sessionId:{" "}
                        {whatsappConnectionData.sessionId || "null"}
                      </div>
                      <div>
                        Redux isConnected:{" "}
                        {whatsappConnectionData.isConnected ? "true" : "false"}
                      </div>
                      <div>
                        Redux isLoggedIn:{" "}
                        {whatsappConnectionData.isLoggedIn ? "true" : "false"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchWhatsAppStatus}
                      disabled={loading}
                    >
                      {loading ? "Retrying..." : "Retry"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : filteredPlatforms.length === 0 ? (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">
                      Belum ada platform yang terkoneksi
                    </h3>{" "}
                    <p className="text-xs text-muted-foreground mb-4">
                      Klik tombol + untuk menambahkan platform baru
                    </p>
                    {/* Debug Info */}
                    <div className="text-left bg-gray-50 p-3 rounded text-xs font-mono mb-4">
                      <div>
                        Redux deviceId:{" "}
                        {whatsappConnectionData.deviceId || "null"}
                      </div>
                      <div>
                        Redux sessionId:{" "}
                        {whatsappConnectionData.sessionId || "null"}
                      </div>
                      <div>
                        Redux isConnected:{" "}
                        {whatsappConnectionData.isConnected ? "true" : "false"}
                      </div>
                      <div>
                        Redux isLoggedIn:{" "}
                        {whatsappConnectionData.isLoggedIn ? "true" : "false"}
                      </div>
                      <div>Platforms count: {whatsappPlatforms.length}</div>
                    </div>
                    {/* Debug Button */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchWhatsAppStatus}
                        disabled={loading}
                      >
                        {loading ? "Testing..." : "Test WhatsApp API"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.removeItem("user_data");
                          window.location.reload();
                        }}
                      >
                        Reset & Reload
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              filteredPlatforms.map((platform) => {
                const Icon = platformIcons[platform.type];
                return (
                  <div
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                      selectedPlatform?.id === platform.id
                        ? "bg-accent border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            className={`${
                              platform.type === "whatsapp"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        {platform.isLoggedIn ? (
                          <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                        ) : platform.isConnected ? (
                          <Clock className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-500 bg-white rounded-full" />
                        ) : (
                          <XCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-red-500 bg-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-foreground truncate">
                            {platform.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs border-gray-200 ${
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
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <Phone className="h-3 w-3" />
                            <span>{platform.phone}</span>
                          </div>
                        )}

                        {platform.description && (
                          <p className="text-xs text-muted-foreground">
                            {platform.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            {platform.teams?.[0] || "No Team"}
                          </Badge>
                          {platform.aiAgent && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <Bot className="h-3 w-3 mr-1" />
                              {platform.aiAgent.split(" ")[0]} AI
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
              <div className="p-6 border-b border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback
                        className={`${
                          selectedPlatform.type === "whatsapp"
                            ? "bg-green-100 text-green-700"
                            : selectedPlatform.type === "instagram"
                            ? "bg-pink-100 text-pink-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <PlatformIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {selectedPlatform.name}
                      </h1>
                      {selectedPlatform.phone && (
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedPlatform.phone}
                        </p>
                      )}
                    </div>
                  </div>                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      className="text-destructive border-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>              </div>

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
              <div className="flex-1 overflow-y-auto p-6">
                <div className="w-full">
                  <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="flow">Flow</TabsTrigger>
                    </TabsList>{" "}
                    <TabsContent value="basic" className="space-y-6">
                      {/* 2x3 Grid Layout */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* WhatsApp Number Field */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            WhatsApp Number
                          </Label>
                          <Input
                            value={
                              whatsappConnectionData.phoneNumber ||
                              selectedPlatform.phone ||
                              ""
                            }
                            readOnly
                            className="bg-gray-50"
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
                            <SelectTrigger>
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
                            </SelectTrigger>{" "}                            <SelectContent>
                              {aiAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.name}>
                                  <div className="flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-gray-600" />
                                    {agent.name}
                                  </div>
                                </SelectItem>
                              ))}
                              {aiAgents.length === 0 && !agentsLoading && (
                                <SelectItem value="no-agents" disabled>
                                  No AI agents available (Count: {aiAgents.length})
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>{" "}
                        {/* Teams */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-foreground">
                            Teams
                          </Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedPlatform.teams?.map((team) => (
                              <Badge
                                key={team}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Users className="h-3 w-3" />
                                {team}
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
                            <SelectTrigger>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-600" />
                                <SelectValue placeholder="Add team..." />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DISTCCTV">DISTCCTV</SelectItem>
                              <SelectItem value="Support Team">
                                Support Team
                              </SelectItem>
                              <SelectItem value="Sales Team">
                                Sales Team
                              </SelectItem>
                              <SelectItem value="Operations">
                                Operations
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>{" "}
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
                            <SelectTrigger>
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
                            </SelectTrigger>{" "}                            <SelectContent>
                              {humanAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.name}>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-green-600" />
                                    {agent.name}
                                  </div>
                                </SelectItem>
                              ))}
                              {humanAgents.length === 0 &&
                                !humanAgentsLoading && (
                                  <SelectItem value="no-human-agents" disabled>
                                    No human agents available (Count: {humanAgents.length})
                                  </SelectItem>
                                )}
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
                            <SelectTrigger>
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
                        <div className="space-y-3 col-span-2">
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
                          <p className="text-sm text-muted-foreground">
                            Mengirim review link ke chat setelah di Resolve oleh
                            agent.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="flow" className="space-y-6">
                      <div className="text-center py-12">
                        <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Flow Configuration
                        </h3>
                        <p className="text-muted-foreground">
                          Configure conversation flows and automation rules
                          here.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Pilih Platform untuk Konfigurasi
                </h3>
                <p className="text-muted-foreground">
                  Pilih platform dari sidebar untuk melihat dan mengatur
                  konfigurasi
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
