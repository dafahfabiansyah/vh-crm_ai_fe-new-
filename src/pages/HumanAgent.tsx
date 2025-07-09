import { useState } from "react";
import MainLayout from "@/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2, RefreshCw } from "lucide-react";
import CreateHumanAgentModal from "@/components/create-human-agent-modal";
import EditHumanAgentModal from "@/components/edit-human-agent-modal";
import { HumanAgentsService } from "@/services/humanAgentsService";
import React from "react";

// Hapus mock data untuk human agents
export default function HumanAgentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [humanAgents, setHumanAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all-roles");
  const [error, setError] = useState<string | null>(null);

  // Fetch agents from API
  const fetchHumanAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const agents = await HumanAgentsService.getHumanAgents();
      setHumanAgents(agents);
    } catch (err: any) {
      setError(err.message || "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  React.useEffect(() => {
    fetchHumanAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock delete function
  const handleDeleteAgent = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
      setLoading(true);
      setError(null);
      try {
        await HumanAgentsService.deleteHumanAgent(id);
        await fetchHumanAgents();
        // Optional: tampilkan notifikasi sukses
        // alert("Agent deleted successfully!");
      } catch (err: any) {
        setError(err.message || "Failed to delete agent");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };
  // Filter agents based on search term and role
  const filteredAgents = humanAgents.filter((agent) => {
    const agentName = String(agent.name || "").toLowerCase();
    const agentEmail = String(agent.user_email || "").toLowerCase();
    const agentRole = String(agent.role || "").toLowerCase();

    const matchesSearch =
      agentName.includes(searchTerm.toLowerCase()) ||
      agentEmail.includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all-roles" || agentRole === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <MainLayout>
      <div className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
            Human Agent Settings
          </h1>

          <Tabs defaultValue="human-agent" className="w-full">
            <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-2">
              <TabsTrigger value="human-agent" className="text-sm">Human Agent</TabsTrigger>
              <TabsTrigger value="teams" className="text-sm">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="human-agent" className="mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan nama atau email"
                      className="pl-8 w-full sm:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-roles">All Roles</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="human-agent">Human Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={fetchHumanAgents}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <span className="hidden sm:inline">Create Agent</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </div>
              </div>{" "}
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading human agents...</span>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                Agent Name
                              </th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                Email
                              </th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                Role
                              </th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                Department
                              </th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                Status
                              </th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAgents.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="p-8 text-center text-muted-foreground text-sm"
                                >
                                  No human agents found
                                </td>
                              </tr>
                            ) : (
                              filteredAgents.map((agent) => (
                                <tr
                                  key={agent.id}
                                  className="border-b hover:bg-muted/25"
                                >
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                          {String(agent.name || "U")
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="font-medium text-sm">
                                        {String(agent.name || "Unknown")}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 text-muted-foreground text-sm">
                                    {String(agent.user_email || "")}
                                  </td>
                                  <td className="p-4">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                        agent.role === "superadmin"
                                          ? "bg-red-100 text-red-800"
                                          : agent.role === "manager"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-green-100 text-green-800"
                                      }`}
                                    >
                                      {agent.role === "superadmin"
                                        ? "Super Admin"
                                        : agent.role === "manager"
                                        ? "Manager"
                                        : "Human Agent"}
                                    </span>
                                  </td>
                                  <td className="p-4 text-sm">
                                    {String(agent.department || "")}
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          agent.is_active
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                        }`}
                                      ></div>
                                      <span className="text-sm">
                                        {agent.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleEditAgent(agent)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        onClick={() =>
                                          handleDeleteAgent(agent.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="sm:hidden">
                        {filteredAgents.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            No human agents found
                          </div>
                        ) : (
                          <div className="divide-y">
                            {filteredAgents.map((agent) => (
                              <div key={agent.id} className="p-4 hover:bg-muted/25">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {String(agent.name || "U")
                                          .charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-sm text-foreground">
                                        {String(agent.name || "Unknown")}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {String(agent.user_email || "")}
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {String(agent.department || "")}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleEditAgent(agent)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      onClick={() =>
                                        handleDeleteAgent(agent.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      agent.role === "superadmin"
                                        ? "bg-red-100 text-red-800"
                                        : agent.role === "manager"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {agent.role === "superadmin"
                                      ? "Super Admin"
                                      : agent.role === "manager"
                                      ? "Manager"
                                      : "Human Agent"}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        agent.is_active
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    ></div>
                                    <span className="text-xs">
                                      {agent.is_active ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="teams" className="mt-4 sm:mt-6">
              <div className="text-center py-8 sm:py-12">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Teams content will be implemented here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>{" "}
      <CreateHumanAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAgentCreated={fetchHumanAgents}
      />
      <EditHumanAgentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAgent(null);
        }}
        agent={selectedAgent}
        onAgentUpdated={fetchHumanAgents}
      />
    </MainLayout>
  );
}
