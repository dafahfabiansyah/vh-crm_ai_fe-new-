import  React,  { useState } from "react";
import MainLayout from "@/main-layout";
import CreateHumanAgentModal from "@/components/create-human-agent-modal";
import EditHumanAgentModal from "@/components/edit-human-agent-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, RefreshCw } from "lucide-react";
import { HumanAgentsService } from "@/services/humanAgentsService";
import { DepartmentService } from "@/services/departmentService";
import CreateDepartmentModal from "@/components/create-department-modal";
import EditDepartmentModal from "@/components/edit-department-modal";

// Hapus mock data untuk human agents
export default function HumanAgentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [humanAgents, setHumanAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all-roles");
  const [, setError] = useState<string | null>(null);

  // Departments state
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [searchDepartment, setSearchDepartment] = useState("");

  // Department modal state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isEditDeptModalOpen, setIsEditDeptModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"agent"|"department"|null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Add state to track active tab
  const [activeTab, setActiveTab] = useState("human-agent");

  // Fetch agents from API
  const fetchHumanAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const agents = await HumanAgentsService.getHumanAgents();
      console.log('Fetched agents:', agents); // DEBUG: cek struktur data
      setHumanAgents(agents);
    } catch (err: any) {
      setError(err.message || "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments from API
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const data = await DepartmentService.getDepartments();
      setDepartments(data);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch agents for department head display
  const [agents, setAgents] = useState<any[]>([]);

  // Fetch on mount - panggil human agents dan departments untuk kolom department
  React.useEffect(() => {
    fetchHumanAgents();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add useEffect to handle tab changes - departments sudah di-load di mount
  React.useEffect(() => {
    // Departments sudah di-fetch saat mount, tidak perlu lazy loading lagi
  }, [activeTab, departments.length]);

  const handleDeleteAgent = (id: string) => {
    setDeleteType("agent");
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };
  const handleEditAgent = (agent: any) => {
    setSelectedAgent(agent);
    setIsEditModalOpen(true);
  };
  // Filter agents based on search term and role 
  const filteredAgents = humanAgents.filter((agent) => {
    const agentName = String(agent.name || "");
    const agentEmail = String(agent.user_email || "");
    const agentRole = String(agent.role || "Manager");

    const matchesSearch =
      agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      roleFilter === "all-roles" || agentRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered departments
  const filteredDepartments = departments.filter((dept) => {
    const name = String(dept.name || "");
    return (
      name.toLowerCase().includes(searchDepartment.toLowerCase()) 
    );
  });

  // Department CRUD handlers
  const handleEditDepartment = (dept: any) => {
    setSelectedDepartment(dept);
    setIsEditDeptModalOpen(true);
  };
  const handleDeleteDepartment = (id: string) => {
    setDeleteType("department");
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTargetId || !deleteType) return;
    if (deleteType === "agent") {
      setLoading(true);
      setError(null);
      try {
        await HumanAgentsService.deleteHumanAgent(deleteTargetId);
        await fetchHumanAgents();
      } catch (err: any) {
        setError(err.message || "Failed to delete agent");
      } finally {
        setLoading(false);
      }
    } else if (deleteType === "department") {
      setLoadingDepartments(true);
      try {
        await DepartmentService.deleteDepartment(deleteTargetId);
        await fetchDepartments();
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoadingDepartments(false);
      }
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteType(null);
  };

  return (
    <MainLayout>
      <div className="p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
            Human Agent Settings
          </h1>

          <Tabs defaultValue="human-agent" className="w-full" onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-2">
              <TabsTrigger value="human-agent" className="text-sm">
                Human Agent
              </TabsTrigger>
              <TabsTrigger value="department" className="text-sm">
                Department
              </TabsTrigger>
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
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Agent">Agent</SelectItem>
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
                                    <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full whitespace-nowrap">
                                      {agent.role || "Manager"}
                                    </span>
                                  </td>
                                  <td className="p-4 text-sm">
                                  {departments.find((d) => d.id === agent.department)?.name || ""}
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
                                        {agent.is_active
                                          ? "Active"
                                          : "Inactive"}
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
                                        onClick={() => handleDeleteAgent(agent.id)}
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
                              <div
                                key={agent.id}
                                className="p-4 hover:bg-muted/25"
                              >
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
                                      onClick={() => handleDeleteAgent(agent.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                  <span
                              className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                agent.role === "Manager"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {agent.role || "Manager"}
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
            <TabsContent value="department" className="mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari berdasarkan nama"
                      className="pl-8 w-full sm:w-64"
                      value={searchDepartment}
                      onChange={(e) => setSearchDepartment(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={fetchDepartments}
                    disabled={loadingDepartments}
                    className="flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingDepartments ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                    onClick={() => setIsDeptModalOpen(true)}
                  >
                    <span className="hidden sm:inline">Create Department</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                  {loadingDepartments ? (
                    <div className="flex items-center justify-center p-8">
                      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading departments...</span>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Department Name</th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Description</th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Head of Department</th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Active</th>
                              <th className="text-left p-4 font-medium text-muted-foreground text-sm">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDepartments.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                                  No departments found
                                </td>
                              </tr>
                            ) : (
                              filteredDepartments.map((dept) => {
                                const headNames = dept.head_ids 
                                  ? dept.head_ids.map((headId: string) => 
                                      agents.find((a) => a.id === headId)?.user?.name || ""
                                    ).filter(Boolean).join(", ")
                                  : "";
                                return (
                                  <tr key={dept.id} className="border-b hover:bg-muted/25">
                                    <td className="p-4 font-medium text-sm">{dept.name}</td>
                                    <td className="p-4 text-muted-foreground text-sm">{dept.description}</td>
                                    <td className="p-4 text-muted-foreground text-sm">{headNames}</td>
                                    <td className="p-4">
                                      <span className={`px-2 py-1 text-xs rounded-full ${dept.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {dept.is_active ? "Active" : "Inactive"}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleEditDepartment(dept)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteDepartment(dept.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      {/* Mobile Card View */}
                      <div className="sm:hidden">
                        {filteredDepartments.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            No departments found
                          </div>
                        ) : (
                          <div className="divide-y">
                            {filteredDepartments.map((dept) => {
                              const headNames = dept.head_ids 
                                ? dept.head_ids.map((headId: string) => 
                                    agents.find((a) => a.id === headId)?.user?.name || ""
                                  ).filter(Boolean).join(", ")
                                : "";
                              return (
                                <div key={dept.id} className="p-4 hover:bg-muted/25">
                                  <div className="font-medium text-sm text-foreground">{dept.name}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{dept.description}</div>
                                  <div className="text-xs text-muted-foreground mt-1">{headNames}</div>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${dept.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                      {dept.is_active ? "Active" : "Inactive"}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleEditDepartment(dept)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteDepartment(dept.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              <CreateDepartmentModal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                onDepartmentCreated={fetchDepartments}
              />
              <EditDepartmentModal
                isOpen={isEditDeptModalOpen}
                onClose={() => {
                  setIsEditDeptModalOpen(false);
                  setSelectedDepartment(null);
                }}
                department={selectedDepartment}
                onDepartmentUpdated={fetchDepartments}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm">
            {/* Are you sure you want to delete this {deleteType === "agent" ? "agent" : "department"}?
            This action cannot be undone. */}
            Apa kamu yakin mau hapus {deleteType === "agent" ? "agent" : "department"}?
           Aksi ini tidak bisa dibatalkan.
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
