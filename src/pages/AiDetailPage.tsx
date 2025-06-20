"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Bot,
  Settings,
  Database,
  Link,
  RefreshCw,
  FileText,
  Send,
  MoreHorizontal,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import MainLayout from "@/main-layout";

interface AIAgentData {
  id: string;
  name: string;
  description: string;
  type: string;
  behavior: string;
  welcomeMessage?: string;
  transferConditions?: string;
  isActive: boolean;
}

interface ChatPreviewProps {
  agentName: string;
  isTestingMode: boolean;
  onToggleTestingMode: () => void;
}

const ChatPreview: React.FC<ChatPreviewProps> = ({
  agentName,
  isTestingMode,
  onToggleTestingMode,
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      content:
        "AI starts fresh with no memory of previous conversations.\n\nRefresh the page to start a completely new session.",
      sender: "system",
      timestamp: new Date().toISOString(),
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        content: message,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          content:
            "Hello! I'm HIHI, your customer service assistant. How can I help you today?",
          sender: "ai",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Chat Preview</CardTitle>
        <Button
          variant={isTestingMode ? "default" : "outline"}
          size="sm"
          onClick={onToggleTestingMode}
          className={
            isTestingMode ? "bg-blue-600 hover:bg-blue-700 text-white" : ""
          }
        >
          Testing Mode
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{agentName}</p>
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                Fresh Session (No Memory)
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {msg.sender === "system" ? (
                <div className="flex justify-center">
                  <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm text-center max-w-md">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Delay Info */}
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-medium">Message Delay:</span> 1 seconds +
          natural typing speed
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface AIAgentDetailPageProps {
  agentId: string;
}

export default function AIAgentDetailPage({ agentId }: AIAgentDetailPageProps) {
  const navigate = useNavigate();
  const [isTestingMode, setIsTestingMode] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdditionalSettingsOpen, setIsAdditionalSettingsOpen] = useState(false);
  // Mock data - in real app, this would come from API
  const [agentData, setAgentData] = useState<AIAgentData>({
    id: agentId,
    name: "HIHI",
    description: "AI agent for customer support",
    type: "Customer Service AI",
    behavior:
      "You are a helpful customer service assistant. Your goal is to resolve customer queries and issues efficiently and professionally. Be empathetic, patient, and focus on customer satisfaction.",
    welcomeMessage: "Hello! I'm your customer service assistant. How can I help you today? I'm here to assist with any questions or issues you might have.",
    transferConditions: "I need to speak with a human\nTransfer to agent\nI want to talk to a real person",
    isActive: true,
  });

  const handleInputChange = (field: keyof AIAgentData, value: string) => {
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
  const characterCount = agentData.behavior.length;
  const maxCharacters = 10000;
  const welcomeMessageCount = (agentData.welcomeMessage || "").length;
  const transferConditionsCount = (agentData.transferConditions || "").length;

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center justify-between">
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
                  <h1 className="text-2xl font-bold text-foreground">
                    {agentData.name}
                  </h1>
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

        {/* Navigation Tabs */}
        <div className="px-6 bg-card border-b border-border">
          <Tabs defaultValue="general" className="w-full">
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

            <TabsContent value="general" className="mt-0">
              <div className="flex gap-6 p-6">
                {/* Left Panel - Configuration */}
                <div className="flex-1 space-y-6">
                  {/* Agent Name */}
                  <div className="space-y-2">
                    <Label htmlFor="agentName" className="text-sm font-medium">
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
                  </div>                  {/* AI Agent Behavior */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-blue-600">
                        AI Agent Behavior
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        This is the AI Prompt that will determine the speaking
                        style and identity of the AI.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        value={agentData.behavior}
                        onChange={(e) =>
                          handleInputChange("behavior", e.target.value)
                        }
                        className="min-h-[200px] resize-none"
                        maxLength={maxCharacters}
                      />
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          {characterCount}/{maxCharacters}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Welcome Message */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-blue-600">
                        Welcome Message
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        value={agentData.welcomeMessage || "Hello! I'm your customer service assistant. How can I help you today? I'm here to assist with any questions or issues you might have."}
                        onChange={(e) =>
                          handleInputChange("welcomeMessage", e.target.value)
                        }
                        className="min-h-[80px] resize-none"
                        placeholder="Enter welcome message for customers"
                      />                      <div className="text-sm text-muted-foreground">
                        <span>{welcomeMessageCount}/500</span>
                      </div>
                    </div>
                  </div>

                  {/* Agent Transfer Conditions */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-blue-600">
                        Agent Transfer Conditions
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        value={agentData.transferConditions || "I need to speak with a human\nTransfer to agent\nI want to talk to a real person"}
                        onChange={(e) =>
                          handleInputChange("transferConditions", e.target.value)
                        }
                        className="min-h-[80px] resize-none"
                        placeholder="Enter conditions that trigger agent transfer"
                      />                      <div className="text-sm text-muted-foreground">
                        <span>{transferConditionsCount}/500</span>
                      </div>
                    </div>                    <div className="flex items-center space-x-2">
                      <Checkbox id="stopAIHandoff" />
                      <Label htmlFor="stopAIHandoff" className="text-sm">
                        Stop AI after Handoff
                      </Label>
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <Collapsible 
                    open={isAdditionalSettingsOpen} 
                    onOpenChange={setIsAdditionalSettingsOpen}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-medium text-blue-600">Additional Settings</span>
                      {isAdditionalSettingsOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      <div className="text-sm text-muted-foreground">
                        Configure additional settings for your AI agent here.
                      </div>
                      {/* You can add more settings here */}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Right Panel - Chat Preview */}
                <div className="w-96">
                  <ChatPreview
                    agentName={agentData.name}
                    isTestingMode={isTestingMode}
                    onToggleTestingMode={() => setIsTestingMode(!isTestingMode)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="mt-0">
              <div className="p-6">
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Knowledge Sources
                  </h3>
                  <p className="text-muted-foreground">
                    Configure knowledge sources for your AI agent.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="mt-0">
              <div className="p-6">
                <div className="text-center py-12">
                  <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Integrations
                  </h3>
                  <p className="text-muted-foreground">
                    Connect your AI agent with external services.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="followups" className="mt-0">
              <div className="p-6">
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Followups
                  </h3>
                  <p className="text-muted-foreground">
                    Configure automated followup messages.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="existing" className="mt-0">
              <div className="p-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Existing Knowledge Sources
                  </h3>
                  <p className="text-muted-foreground">
                    View and manage existing knowledge sources.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
