"use client";

import { useState } from "react";
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
  Instagram,
  Globe,
} from "lucide-react";
import MainLayout from "@/main-layout";
import type { AIAgent, WhatsAppPlatform } from "@/types";
import { Toast } from "@/components/ui/toast";
import {
  distributionMethods,
  mockAIAgents,
  mockHumanAgents,
  mockWhatsAppPlatform,
  platformIcons,
} from "@/app/mock/data";
import { useNavigate } from "react-router";

export default function ConnectedPlatformsPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] =
    useState<WhatsAppPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [whatsappPlatforms, setWhatsappPlatforms] = useState<
    WhatsAppPlatform[]
  >([mockWhatsAppPlatform]);
  const [loading, setLoading] = useState(false);

  const [aiAgents] = useState<AIAgent[]>(mockAIAgents);
  const [humanAgents] = useState(mockHumanAgents);
  const [agentsLoading] = useState(false);
  const [humanAgentsLoading] = useState(false);

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

  const filteredPlatforms = whatsappPlatforms.filter((platform) =>
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
    if (!selectedPlatform) return;

    // Validate required fields
    if (!selectedPlatform.aiAgent) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Please select an AI Agent before saving.",
      });
      return;
    }

    if (!selectedPlatform.phone) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "WhatsApp number is required.",
      });
      return;
    }

    if (!selectedPlatform.deviceId) {
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
      (agent) => agent.name === selectedPlatform.aiAgent
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
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setToast({
        show: true,
        type: "success",
        title: "Mapping Saved Successfully",
        description: `WhatsApp platform ${selectedPlatform.name} has been configured successfully.`,
      });

      // Update the platform in the list
      setWhatsappPlatforms((prev) =>
        prev.map((p) => (p.id === selectedPlatform.id ? selectedPlatform : p))
      );
    } catch (error) {
      console.error("Error saving platform configuration:", error);
      setToast({
        show: true,
        type: "error",
        title: "Save Failed",
        description: "Failed to save platform configuration. Please try again.",
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
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsAddPlatformModalOpen(true)}
                >
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
                      <div>Platforms count: {whatsappPlatforms.length}</div>
                      <div>Selected: {selectedPlatform?.name || "None"}</div>
                      <div>Loading: {loading ? "true" : "false"}</div>
                    </div>
                    {/* Debug Button */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading}
                      >
                        {loading ? "Refreshing..." : "Refresh Platforms"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        Reload Page
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
                  </div>{" "}
                  <div className="flex gap-2">
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
                </div>{" "}
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
                            value={selectedPlatform.phone || ""}
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
                            </SelectTrigger>{" "}
                            <SelectContent>
                              {aiAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.name}>
                                  <div className="flex items-center gap-2">
                                    {/* <Bot className="h-4 w-4 text-gray-600" /> */}
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
                            </SelectTrigger>{" "}
                            <SelectContent>
                              {humanAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.name}>
                                  <div className="flex items-center gap-2">
                                    {/* <User className="h-4 w-4 text-green-600" /> */}
                                    {agent.name}
                                  </div>
                                </SelectItem>
                              ))}
                              {humanAgents.length === 0 &&
                                !humanAgentsLoading && (
                                  <SelectItem value="no-human-agents" disabled>
                                    No human agents available (Count:{" "}
                                    {humanAgents.length})
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
                  No Inbox Selected
                </h3>
                <p className="text-muted-foreground">
                  Select an inbox from the list to view and manage its settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Platform Modal */}
      {isAddPlatformModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Connect Platform</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddPlatformModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Choose a platform to connect to your inbox
            </p>

            <div className="space-y-3">
              {/* WhatsApp Option */}
              <button
                onClick={() => navigate('/connect/whatsapp')}
                className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">WhatsApp Business</h3>
                  <p className="text-sm text-muted-foreground">Connect your WhatsApp Business account</p>
                </div>
              </button>

              {/* Instagram Option */}
              <button
                onClick={() => navigate('/connect/instagram')}
                className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-pink-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Instagram</h3>
                  <p className="text-sm text-muted-foreground">Connect your Instagram business account</p>
                </div>
              </button>

              {/* Web Chat Option */}
              <button
                onClick={() => navigate('/connect/webchat')}
                className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Web Chat</h3>
                  <p className="text-sm text-muted-foreground">Add live chat widget to your website</p>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setIsAddPlatformModalOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
