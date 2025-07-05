"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AIAgentChatPreview from "@/components/ai-agent-chat";
import MainLayout from "@/main-layout";

interface AIAgentData {
  id: string;
  name: string;
  description: string;
  type: string;
  behavior: string;
  welcomeMessage: string;
  transferConditions: string;
  stopAIAfterHandoff: boolean;
  isActive: boolean;
  // Additional Settings
  model: string;
  aiHistoryLimit: number;
  aiContextLimit: number;
  messageAwait: number;
  aiMessageLimit: number;
  timezone: string;
  selectedLabels: string[];
}

interface AIAgentDetailPageProps {
  agentId: string;
}

export default function AIAgentDetailPage({ agentId }: AIAgentDetailPageProps) {
  const navigate = useNavigate();
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdditionalSettingsOpen, setIsAdditionalSettingsOpen] =
    useState(false);

  // Mock data - in real app, this would come from API
  const [agentData, setAgentData] = useState<AIAgentData>({
    id: agentId,
    name: "HIHI",
    description: "AI agent for customer support",
    type: "Customer Service AI",
    behavior:
      "",
    welcomeMessage:
      "",
    transferConditions:
      "",
    stopAIAfterHandoff: true,
    isActive: true,
    // Additional Settings default values
    model: "GPT-4",
    aiHistoryLimit: 20,
    aiContextLimit: 10,
    messageAwait: 1,
    aiMessageLimit: 1000,
    timezone: "(GMT+07:00) Asia/Jakarta",
    selectedLabels: [],
  });
  const handleInputChange = (
    field: keyof AIAgentData,
    value: string | boolean | number | string[]
  ) => {
    setAgentData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Saving agent data:", agentData);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/ai-agents");
  };

  const behaviorCharacterCount = agentData.behavior.length;
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
                    {agentData.type}
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
                        <Textarea
                          value={agentData.behavior}
                          onChange={(e) =>
                            handleInputChange("behavior", e.target.value)
                          }
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
                            className={`h-4 w-4 transition-transform ${
                              isAdditionalSettingsOpen ? "rotate-180" : ""
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
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GPT-4.1">Very High Intelligence</SelectItem>
                              <SelectItem value="GPT-4">High Intelligence (Recommended)</SelectItem>
                              <SelectItem value="GPT-3.5">Medium Intelligence</SelectItem>
                              <SelectItem value="GPT-3.5">Low Intelligence</SelectItem>
                            </SelectContent>
                          </Select>
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

                      {/* Nested Tab Contents */}
                      <TabsContent value="text" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              Text Knowledge Source
                            </h4>
                            <p className="text-muted-foreground mb-4">
                              Tambahkan pengetahuan berbasis teks
                              langsung ke AI Anda.
                            </p>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="textTitle"
                              className="text-sm font-medium"
                            >
                              Title
                            </Label>
                            <Input
                              id="textTitle"
                              placeholder="Enter knowledge title"
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="textContent"
                              className="text-sm font-medium"
                            >
                              Content
                            </Label>
                            <Textarea
                              id="textContent"
                              placeholder="Enter your knowledge content here..."
                              className="min-h-[200px] resize-none"
                            />
                          </div>
                          <Button className="bg-primary hover:bg-primary/90">
                            Add Text Knowledge
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="website" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              Website Knowledge Source
                            </h4>
                            <p className="text-muted-foreground mb-4">
                              Tambahkan pengetahuan dari situs web
                              eksternal untuk melatih AI Anda.
                            </p>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="websiteUrl"
                              className="text-sm font-medium"
                            >
                              Website URL
                            </Label>
                            <Input
                              id="websiteUrl"
                              placeholder="https://example.com"
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="websiteTitle"
                              className="text-sm font-medium"
                            >
                              Title (Optional)
                            </Label>
                            <Input
                              id="websiteTitle"
                              placeholder="Custom title for this source"
                              className="w-full"
                            />
                          </div>
                          {/* <div className="flex items-center space-x-2">
                            <Checkbox id="autoUpdate" />
                            <Label
                              htmlFor="autoUpdate"
                              className="text-sm font-medium"
                            >
                              Auto-update content from this URL
                            </Label>
                          </div> */}
                          <Button className="bg-primary hover:bg-primary/90">
                            Import from Website
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="product" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              Product Knowledge Source
                            </h4>
                            <p className="text-muted-foreground mb-4">
                              Add product information and specifications.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <Label
                                htmlFor="productName"
                                className="text-sm font-medium"
                              >
                                Product Name
                              </Label>
                              <Input
                                id="productName"
                                placeholder="Enter product name"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="productCategory"
                                className="text-sm font-medium"
                              >
                                Category
                              </Label>
                              <Select>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="electronics">
                                    Electronics
                                  </SelectItem>
                                  <SelectItem value="clothing">
                                    Clothing
                                  </SelectItem>
                                  <SelectItem value="home">
                                    Home & Garden
                                  </SelectItem>
                                  <SelectItem value="sports">Sports</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="productDescription"
                              className="text-sm font-medium"
                            >
                              Product Description
                            </Label>
                            <Textarea
                              id="productDescription"
                              placeholder="Detailed product description..."
                              className="min-h-[150px] resize-none"
                            />
                          </div>
                          <Button className="bg-primary hover:bg-primary/90">
                            Add Product Knowledge
                          </Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="file" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              File Knowledge Source
                            </h4>
                            <p className="text-muted-foreground mb-4">
                              Unggah file untuk melatih AI Anda sebagai
                              informasi tambahan.
                            </p>
                          </div>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h5 className="text-lg font-medium text-foreground mb-2">
                              Upload Files
                            </h5>
                            <p className="text-muted-foreground mb-4">
                              Drag and drop files here, or click to browse
                            </p>
                            {/* <p className="text-sm text-muted-foreground mb-4">
                              Supported formats: PDF, DOC, DOCX, TXT, CSV
                            </p> */}
                            <Button variant="outline">Browse Files</Button>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="fileTitle"
                              className="text-sm font-medium"
                            >
                              Custom Title (Optional)
                            </Label>
                            <Input
                              id="fileTitle"
                              placeholder="Custom title for uploaded files"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="qa" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">
                              Q&A Knowledge Source
                            </h4>
                            <p className="text-muted-foreground mb-4">
                              Buat skenario tanya jawab untuk melatih AI Anda.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <Label
                                htmlFor="question"
                                className="text-sm font-medium"
                              >
                                Question
                              </Label>
                              <Input
                                id="question"
                                placeholder="What question might customers ask?"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="answer"
                                className="text-sm font-medium"
                              >
                                Answer
                              </Label>
                              <Textarea
                                id="answer"
                                placeholder="Provide the ideal answer for this question..."
                                className="min-h-[120px] resize-none"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="keywords"
                                className="text-sm font-medium"
                              >
                                Keywords (Optional)
                              </Label>
                              <Input
                                id="keywords"
                                placeholder="Related keywords, separated by commas"
                                className="w-full"
                              />
                            </div>
                          </div>
                          <Button className="bg-primary hover:bg-primary/90">
                            Add Q&A Pair
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-0">
                    <div className="text-center py-12">
                      <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Integrations
                      </h3>
                      <p className="text-muted-foreground">
                        Connect your AI agent with external services.
                      </p>
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
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Existing Knowledge Sources
                      </h3>
                      <p className="text-muted-foreground">
                        View and manage existing knowledge sources.
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </div>

              {/* Right Panel - Chat Preview (Desktop Only) */}
              <div className="hidden lg:block w-full lg:w-96 lg:flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <AIAgentChatPreview
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
            agentName={agentData.name}
            welcomeMessage={agentData.welcomeMessage}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
