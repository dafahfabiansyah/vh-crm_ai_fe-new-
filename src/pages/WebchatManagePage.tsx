"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Globe, 
  Settings, 
  Palette,
  Save,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  MessageCircle
} from "lucide-react"
import { useNavigate } from "react-router"
import MainLayout from "@/main-layout"
import { AgentsService } from "@/services/agentsService"
import PipelineService from "@/services/pipelineService"
import type { AIAgent } from "@/types"
import type { PipelineListResponse } from "@/services/pipelineService"
import { Toast } from "@/components/ui/toast"
import { WebchatWidget } from "@/components/webchat-widget"

interface WebchatConfig {
  name: string
  description: string
  agentId: string
  pipelineId: string
  primaryColor: string
  welcomeMessage: string
  placeholderText: string
  isActive: boolean
  allowFileUpload: boolean
  showAgentAvatar: boolean
  position: 'bottom-right' | 'bottom-left'
}

export default function WebchatManagePage() {
  const navigate = useNavigate()
  const [config, setConfig] = useState<WebchatConfig>({
    name: 'Website Chat',
    description: 'Live chat widget for website visitors',
    agentId: '',
    pipelineId: '',
    primaryColor: '#3B82F6',
    welcomeMessage: 'Hello! How can I help you today?',
    placeholderText: 'Type your message...',
    isActive: true,
    allowFileUpload: false,
    showAgentAvatar: true,
    position: 'bottom-right'
  })
  
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([])
  const [pipelines, setPipelines] = useState<PipelineListResponse[]>([])
  const [agentsLoading, setAgentsLoading] = useState(false)
  const [pipelinesLoading, setPipelinesLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean
    type: "success" | "error" | "warning" | "info"
    title: string
    description: string
  } | null>(null)

  // Fetch AI agents
  useEffect(() => {
    setAgentsLoading(true)
    AgentsService.getAgents()
      .then((data) => setAiAgents(data))
      .catch((err) => {
        console.error('Failed to fetch AI agents:', err)
        setAiAgents([])
      })
      .finally(() => setAgentsLoading(false))
  }, [])

  // Fetch pipelines
  useEffect(() => {
    setPipelinesLoading(true)
    PipelineService.getPipelines()
      .then((data) => setPipelines(data))
      .catch((err) => {
        console.error('Failed to fetch pipelines:', err)
        setPipelines([])
      })
      .finally(() => setPipelinesLoading(false))
  }, [])

  const updateConfig = (updates: Partial<WebchatConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const handleSave = async () => {
    if (!config.name || !config.agentId) {
      setToast({
        show: true,
        type: "error",
        title: "Validation Error",
        description: "Please fill in all required fields."
      })
      return
    }

    setIsSaving(true)
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setToast({
        show: true,
        type: "success",
        title: "Configuration Saved",
        description: "Webchat configuration has been updated successfully."
      })
    } catch (error: any) {
      console.error('Error saving configuration:', error)
      setToast({
        show: true,
        type: "error",
        title: "Save Failed",
        description: error.message || "Failed to save webchat configuration."
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/connected-platforms")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Connected Platforms
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Webchat Configuration
              </h1>
            </div>
            <p className="text-muted-foreground">
              Configure your webchat widget settings and assign agents
            </p>
          </div>

          {/* Success Banner */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-800">Webchat Platform Active</h3>
                <p className="text-sm text-green-600 mt-1">Platform ID: webchat-{config.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/webchat/webchat-${config.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`, '_blank')}
                className="flex items-center gap-2 text-green-700 border-green-300 hover:bg-green-100"
              >
                <ExternalLink className="w-4 h-4" />
                Test Webchat
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="flow">Flow</TabsTrigger>
                  <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Basic Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Platform Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Website Chat"
                          value={config.name}
                          onChange={(e) => updateConfig({ name: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of this webchat platform"
                          value={config.description}
                          onChange={(e) => updateConfig({ description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>AI Agent *</Label>
                        <Select
                          value={config.agentId}
                          onValueChange={(value) => updateConfig({ agentId: value })}
                          disabled={agentsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={agentsLoading ? "Loading agents..." : "Select AI agent"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {aiAgents.map((agent) => (
                              <SelectItem key={agent.id_agent} value={agent.id_agent}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Active Status</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable or disable this webchat platform
                          </p>
                        </div>
                        <Switch
                          checked={config.isActive}
                          onCheckedChange={(checked) => updateConfig({ isActive: checked })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="flow" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Appearance & Flow Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={config.primaryColor}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            value={config.primaryColor}
                            onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                            placeholder="#3B82F6"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Textarea
                          id="welcomeMessage"
                          placeholder="Hello! How can I help you today?"
                          value={config.welcomeMessage}
                          onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="placeholderText">Input Placeholder</Label>
                        <Input
                          id="placeholderText"
                          placeholder="Type your message..."
                          value={config.placeholderText}
                          onChange={(e) => updateConfig({ placeholderText: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Widget Position</Label>
                        <Select
                          value={config.position}
                          onValueChange={(value: 'bottom-right' | 'bottom-left') => updateConfig({ position: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Agent Avatar</Label>
                            <p className="text-sm text-muted-foreground">
                              Display agent avatar in chat
                            </p>
                          </div>
                          <Switch
                            checked={config.showAgentAvatar}
                            onCheckedChange={(checked) => updateConfig({ showAgentAvatar: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Allow File Upload</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable file sharing in chat
                            </p>
                          </div>
                          <Switch
                            checked={config.allowFileUpload}
                            onCheckedChange={(checked) => updateConfig({ allowFileUpload: checked })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pipeline" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Pipeline Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pipeline (Optional)</Label>
                        <Select
                          value={config.pipelineId}
                          onValueChange={(value) => updateConfig({ pipelineId: value })}
                          disabled={pipelinesLoading}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={pipelinesLoading ? "Loading pipelines..." : "Select pipeline (optional)"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No pipeline</SelectItem>
                            {pipelines.map((pipeline) => (
                              <SelectItem key={pipeline.id} value={pipeline.id}>
                                {pipeline.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {config.pipelineId && config.pipelineId !== 'none' && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Pipeline Settings</h4>
                          <p className="text-sm text-blue-600">
                            Selected pipeline: {pipelines.find(p => p.id === config.pipelineId)?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            Leads from this webchat will follow the selected pipeline workflow.
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Chat Distribution Method</Label>
                        <Select defaultValue="lead-assigned">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lead-assigned">Lead Assigned</SelectItem>
                            <SelectItem value="round-robin">Round Robin</SelectItem>
                            <SelectItem value="manual">Manual Assignment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !config.name || !config.agentId}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!config.agentId}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Preview
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-6 min-h-[400px] relative">
                    <div className="text-center text-gray-500 mb-4">
                      <Globe className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Website Preview</p>
                    </div>
                    
                    {config.agentId && showPreview && (
                      <WebchatWidget
                        agentId={config.agentId}
                        isOpen={false}
                        className="absolute"
                      />
                    )}
                    
                    {!config.agentId && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">
                          Select an AI agent to see preview
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Platform Name:</span>
                    <span className="text-sm text-muted-foreground">
                      {config.name || 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AI Agent:</span>
                    <span className="text-sm text-muted-foreground">
                      {config.agentId ? aiAgents.find(a => a.id_agent === config.agentId)?.name || 'Unknown' : 'Not selected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pipeline:</span>
                    <span className="text-sm text-muted-foreground">
                      {config.pipelineId && config.pipelineId !== 'none' ? pipelines.find(p => p.id === config.pipelineId)?.name || 'Unknown' : 'No pipeline'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                      {config.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Position:</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {config.position.replace('-', ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          description={toast.description}
          onClose={() => setToast(null)}
        />
      )}
    </MainLayout>
  )
}