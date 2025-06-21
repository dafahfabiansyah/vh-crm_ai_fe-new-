"use client"

import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, Bot, Settings, Database, Link, RefreshCw, FileText, ChevronDown } from "lucide-react"
import AIAgentChatPreview from "@/components/ai-agent-chat"
import MainLayout from "@/main-layout"

interface AIAgentData {
  id: string
  name: string
  description: string
  type: string
  behavior: string
  welcomeMessage: string
  transferConditions: string
  stopAIAfterHandoff: boolean
  isActive: boolean
  // Additional Settings
  model: string
  aiHistoryLimit: number
  aiContextLimit: number
  messageAwait: number
  aiMessageLimit: number
  timezone: string
  selectedLabels: string[]
}

interface AIAgentDetailPageProps {
  agentId: string
}

export default function AIAgentDetailPage({ agentId }: AIAgentDetailPageProps) {
  const navigate = useNavigate()
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdditionalSettingsOpen, setIsAdditionalSettingsOpen] = useState(false)
  // Mock data - in real app, this would come from API
  const [agentData, setAgentData] = useState<AIAgentData>({
    id: agentId,
    name: "HIHI",
    description: "AI agent for customer support",
    type: "Customer Service AI",
    behavior:
      "You are a helpful customer service assistant. Your goal is to resolve customer queries and issues efficiently and professionally. Be empathetic, patient, and focus on customer satisfaction.",
    welcomeMessage:
      "Hello! I'm your customer service assistant. How can I help you today? I'm here to assist with any questions or issues you might have.",
    transferConditions: "I need to speak with a human\nTransfer to agent\nI want to talk to a real person",
    stopAIAfterHandoff: true,
    isActive: true,
    // Additional Settings default values
    model: "GPT-4.1",
    aiHistoryLimit: 20,
    aiContextLimit: 10,
    messageAwait: 1,
    aiMessageLimit: 1000,
    timezone: "(GMT+07:00) Asia/Jakarta",
    selectedLabels: [],
  })
  const handleInputChange = (field: keyof AIAgentData, value: string | boolean | number | string[]) => {
    setAgentData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Saving agent data:", agentData)
      setHasChanges(false)
    } catch (error) {
      console.error("Error saving changes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    // router.push("/ai-agents")
    navigate("/ai-agents")  }
  
  const behaviorCharacterCount = agentData.behavior.length
  const welcomeCharacterCount = agentData.welcomeMessage.length
  const transferCharacterCount = agentData.transferConditions.length

  return (
    <MainLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-green-100 text-green-700">
                    <Bot className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-2xl font-bold text-foreground">{agentData.name}</h1>
                  <p className="text-green-600 font-medium">{agentData.type}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "SAVE CHANGES"
              )}
            </Button>
          </div>
        </div>

        {/* Content Area - Always Scrollable */}
        <div className="max-w-7xl mx-auto px-6 py-6 pb-20">
          <Tabs defaultValue="general" className="w-full">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg mb-6 shadow-sm border border-gray-200">
              <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
                >
                  <Settings className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="knowledge"
                  className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
                >
                  <Database className="h-4 w-4" />
                  Knowledge Sources
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
                >
                  <Link className="h-4 w-4" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger
                  value="followups"
                  className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
                >
                  <RefreshCw className="h-4 w-4" />
                  Followups
                </TabsTrigger>
                <TabsTrigger
                  value="existing"
                  className="flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none"
                >
                  <FileText className="h-4 w-4" />
                  Existing Knowledge Sources
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Main Content Layout */}
            <div className="flex gap-8">
              {/* Left Panel - Configuration */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="max-w-2xl mx-auto">
                  <TabsContent value="general" className="mt-0 space-y-6">
                    {/* Agent Name */}
                    <div className="space-y-2">
                      <Label htmlFor="agentName" className="text-sm font-medium">
                        Agent Name
                      </Label>
                      <Input
                        id="agentName"
                        value={agentData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Input
                        id="description"
                        value={agentData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* AI Agent Behavior */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-blue-600">AI Agent Behavior</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          This is the AI Prompt that will determine the speaking style and identity of the AI.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          value={agentData.behavior}
                          onChange={(e) => handleInputChange("behavior", e.target.value)}
                          className="min-h-[120px] resize-none"
                          maxLength={10000}
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{behaviorCharacterCount}/10,000</span>
                        </div>
                      </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-blue-600">Welcome Message</Label>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          value={agentData.welcomeMessage}
                          onChange={(e) => handleInputChange("welcomeMessage", e.target.value)}
                          className="min-h-[80px] resize-none"
                          maxLength={9000}
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{welcomeCharacterCount}/9000</span>
                        </div>
                      </div>
                    </div>

                    {/* Agent Transfer Conditions */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-blue-600">Agent Transfer Conditions</Label>
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          value={agentData.transferConditions}
                          onChange={(e) => handleInputChange("transferConditions", e.target.value)}
                          className="min-h-[80px] resize-none"
                          maxLength={750}
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{transferCharacterCount}/750</span>
                        </div>
                      </div>
                    </div>

                    {/* Stop AI after Handoff */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="stopAI"
                        checked={agentData.stopAIAfterHandoff}
                        onCheckedChange={(checked) => handleInputChange("stopAIAfterHandoff", checked as boolean)}
                      />
                      <Label htmlFor="stopAI" className="text-sm font-medium">
                        Stop AI after Handoff
                      </Label>
                    </div>

                    {/* Additional Settings */}
                    <Collapsible open={isAdditionalSettingsOpen} onOpenChange={setIsAdditionalSettingsOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                          <span className="text-sm font-medium text-blue-600">Additional Settings</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isAdditionalSettingsOpen ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-4">
                        {/* Model */}
                        <div className="space-y-2">
                          <Label htmlFor="model" className="text-sm font-medium">
                            Model
                          </Label>
                          <Select value={agentData.model} onValueChange={(value) => handleInputChange("model", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GPT-4.1">GPT-4.1</SelectItem>
                              <SelectItem value="GPT-4">GPT-4</SelectItem>
                              <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* AI History Limit */}
                        <div className="space-y-2">
                          <Label htmlFor="aiHistoryLimit" className="text-sm font-medium">
                            AI History Limit
                          </Label>
                          <Input
                            id="aiHistoryLimit"
                            type="number"
                            value={agentData.aiHistoryLimit}
                            onChange={(e) => handleInputChange("aiHistoryLimit", parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">Berapa banyak pesan yang akan diingat AI</p>
                        </div>

                        {/* AI Context Limit */}
                        <div className="space-y-2">
                          <Label htmlFor="aiContextLimit" className="text-sm font-medium">
                            AI Context Limit
                          </Label>
                          <Input
                            id="aiContextLimit"
                            type="number"
                            value={agentData.aiContextLimit}
                            onChange={(e) => handleInputChange("aiContextLimit", parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">Level AI untuk membaca knowledge source</p>
                        </div>

                        {/* Message Await */}
                        <div className="space-y-2">
                          <Label htmlFor="messageAwait" className="text-sm font-medium">
                            Message Await
                          </Label>
                          <Input
                            id="messageAwait"
                            type="number"
                            value={agentData.messageAwait}
                            onChange={(e) => handleInputChange("messageAwait", parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">Delay Waktu AI untuk merespon pesan pengguna</p>
                        </div>

                        {/* AI Message Limit */}
                        <div className="space-y-2">
                          <Label htmlFor="aiMessageLimit" className="text-sm font-medium">
                            AI Message Limit
                          </Label>
                          <Input
                            id="aiMessageLimit"
                            type="number"
                            value={agentData.aiMessageLimit}
                            onChange={(e) => handleInputChange("aiMessageLimit", parseInt(e.target.value) || 0)}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">Limit pesan yang bisa dikirim oleh AI ke satu customer</p>
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                          <Label htmlFor="timezone" className="text-sm font-medium">
                            Timezone
                          </Label>
                          <Select value={agentData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="(GMT+07:00) Asia/Jakarta">(GMT+07:00) Asia/Jakarta</SelectItem>
                              <SelectItem value="(GMT+08:00) Asia/Singapore">(GMT+08:00) Asia/Singapore</SelectItem>
                              <SelectItem value="(GMT+09:00) Asia/Tokyo">(GMT+09:00) Asia/Tokyo</SelectItem>
                              <SelectItem value="(GMT+00:00) UTC">(GMT+00:00) UTC</SelectItem>
                              <SelectItem value="(GMT-05:00) America/New_York">(GMT-05:00) America/New_York</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Selected Labels */}
                        <div className="space-y-2">
                          <Label htmlFor="selectedLabels" className="text-sm font-medium">
                            Selected Labels
                          </Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select labels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="sales">Sales</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="billing">Billing</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">AI dapat secara otomatis melabeli chat. Pilih label yang digunakan untuk digunakan oleh AI</p>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </TabsContent>

                  <TabsContent value="knowledge" className="mt-0">
                    <div className="text-center py-12">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Sources</h3>
                      <p className="text-muted-foreground">Configure knowledge sources for your AI agent.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-0">
                    <div className="text-center py-12">
                      <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Integrations</h3>
                      <p className="text-muted-foreground">Connect your AI agent with external services.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="followups" className="mt-0">
                    <div className="text-center py-12">
                      <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Followups</h3>
                      <p className="text-muted-foreground">Configure automated followup messages.</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="existing" className="mt-0">
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Existing Knowledge Sources</h3>
                      <p className="text-muted-foreground">View and manage existing knowledge sources.</p>
                    </div>                    </TabsContent>
                  </div>
                </div>
              </div>              {/* Right Panel - Chat Preview (Always Visible) */}
              <div className="w-96 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <AIAgentChatPreview agentName={agentData.name} welcomeMessage={agentData.welcomeMessage} />
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
