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
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import MainLayout from "@/main-layout";
import type { Platform } from "@/types";
import { mockPlatforms } from "@/app/mock/data";

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

export default function ConnectedPlatformsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(
    mockPlatforms[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>(mockPlatforms);

  const filteredPlatforms = platforms.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === selectedPlatform.id ? selectedPlatform : p))
    );
    // Show success message
    console.log("Platform settings saved:", selectedPlatform);
  };

  const handleDelete = () => {
    setPlatforms((prev) => prev.filter((p) => p.id !== selectedPlatform.id));
    if (platforms.length > 1) {
      setSelectedPlatform(
        platforms.find((p) => p.id !== selectedPlatform.id) || platforms[0]
      );
    }
  };

  const updateSelectedPlatform = (updates: Partial<Platform>) => {
    setSelectedPlatform((prev) => ({ ...prev, ...updates }));
  };

  const removeTeam = (teamToRemove: string) => {
    updateSelectedPlatform({
      teams: selectedPlatform.teams.filter((team) => team !== teamToRemove),
    });
  };

  const PlatformIcon = platformIcons[selectedPlatform.type] || MessageSquare;

  return (
    <MainLayout>
      <div className="flex h-full bg-background">
        {/* Left Sidebar - Platforms List */}
        <div className="w-96 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Inboxes
                </h2>
                <p className="text-sm text-muted-foreground">
                  This is where you can connect all your platforms
                </p>
              </div>
              <Button size="icon" variant="outline" className="rounded-full">
                <Plus className="h-4 w-4" />
              </Button>
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
          </div>

          <div className="overflow-y-auto">
            {filteredPlatforms.map((platform) => {
              const Icon = platformIcons[platform.type];
              return (
                <div
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedPlatform.id === platform.id
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
                              : platform.type === "instagram"
                              ? "bg-pink-100 text-pink-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      {platform.isActive && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-foreground truncate">
                          {platform.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                        >
                          {platform.aiAgent.split(" ")[0]} AI
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
                          {platform.teams[0]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Content - Platform Configuration */}
        <div className="flex-1 flex flex-col">
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
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-destructive border-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>{" "}
          {/* Configuration Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full">
              <Textarea
                placeholder="Type a description here..."
                value={selectedPlatform.description || ""}
                onChange={(e) =>
                  updateSelectedPlatform({ description: e.target.value })
                }
                className="mb-6 min-h-[80px]"
              />

              <Tabs defaultValue="basic" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="flow">Flow</TabsTrigger>
                </TabsList>{" "}
                <TabsContent value="basic" className="space-y-6">
                  {/* 2x3 Grid Layout */}
                  <div className="grid grid-cols-2 gap-6">
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
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-gray-600" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DISTCCTV AI">
                            <div className="flex items-center gap-2">
                              {/* <Bot className="h-4 w-4 text-gray-600" /> */}
                              DISTCCTV AI
                            </div>
                          </SelectItem>
                          <SelectItem value="Abang Benerin AI">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-gray-600" />
                              Abang Benerin AI
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Teams */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">
                        Teams
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedPlatform.teams.map((team) => (
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
                          if (!selectedPlatform.teams.includes(value)) {
                            updateSelectedPlatform({
                              teams: [...selectedPlatform.teams, value],
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
                          <SelectItem value="Sales Team">Sales Team</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
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
                      >
                        <SelectTrigger>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SPV DISTCCTV">
                            SPV DISTCCTV
                          </SelectItem>
                          <SelectItem value="Support Agent">
                            Support Agent
                          </SelectItem>
                          <SelectItem value="Sales Agent">
                            Sales Agent
                          </SelectItem>
                          <SelectItem value="Ops Agent">Ops Agent</SelectItem>
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
                          updateSelectedPlatform({ distributionMethod: value })
                        }
                      >
                        <SelectTrigger>
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
                      Configure conversation flows and automation rules here.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
