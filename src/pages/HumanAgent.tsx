import { useState, useEffect } from "react"
import MainLayout from "@/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"
import { HumanAgentsService, type HumanAgent } from "@/services/humanAgentsService"
import CreateHumanAgentModal from "@/components/CreateHumanAgentModal"

export default function HumanAgentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [humanAgents, setHumanAgents] = useState<HumanAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all-roles")  // Fetch human agents from API
  const fetchHumanAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      const agents = await HumanAgentsService.getHumanAgents()
      console.log('Fetched agents:', agents); // Debug log
      setHumanAgents(agents)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch human agents')
      console.error('Error fetching human agents:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchHumanAgents()
  }, [])

  const handleDeleteAgent = async (id: string) => {
    try {
      await HumanAgentsService.deleteHumanAgent(id)
      setHumanAgents(prev => prev.filter(agent => agent.id !== id))
      console.log("Agent deleted successfully")
    } catch (err: any) {
      console.error("Error deleting agent:", err)
      // You might want to show an error toast here
    }
  }
  // Filter agents based on search term and role
  const filteredAgents = humanAgents.filter(agent => {
    const agentName = String(agent.name || '').toLowerCase()
    const agentEmail = String(agent.user_email || '').toLowerCase()
    const agentRole = String(agent.role || '').toLowerCase()
    
    const matchesSearch = agentName.includes(searchTerm.toLowerCase()) ||
                         agentEmail.includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all-roles" || agentRole === roleFilter.toLowerCase()
    return matchesSearch && matchesRole
  })

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Human Agent Settings</h1>
          
          <Tabs defaultValue="human-agent" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="human-agent">Human Agent</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
            
            <TabsContent value="human-agent" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email"
                      className="pl-8 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-roles">All Roles</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={fetchHumanAgents}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Create Agent
                  </Button>
                </div>
              </div>              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading human agents...</span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center p-8 text-red-500">
                      <span>Error: {error}</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-4 font-medium text-muted-foreground">Agent Name</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Department</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAgents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                No human agents found
                              </td>
                            </tr>
                          ) : (
                            filteredAgents.map((agent) => (
                              <tr key={agent.id} className="border-b hover:bg-muted/25">                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                        {String(agent.name || 'U').charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{String(agent.name || 'Unknown')}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-muted-foreground">{String(agent.user_email || '')}</td>
                                <td className="p-4">{String(agent.role || '')}</td>
                                <td className="p-4">{String(agent.department || '')}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${agent.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm">{agent.is_active ? 'Active' : 'Inactive'}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                  )}
                </CardContent>
              </Card>
            </TabsContent>
              <TabsContent value="teams" className="mt-6">
              <p className="text-muted-foreground">Teams content will be implemented here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>      <CreateHumanAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAgentCreated={fetchHumanAgents}
      />
    </MainLayout>
  )
}
