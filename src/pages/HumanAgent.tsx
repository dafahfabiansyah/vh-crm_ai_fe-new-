import { useState } from "react"
import MainLayout from "@/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Edit, Trash2 } from "lucide-react"
import { humanAgents } from "@/app/mock/data"
import CreateHumanAgentModal from "@/components/CreateHumanAgentModal"

export default function HumanAgentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateAgent = (agentData: any) => {
    // Handle the agent creation logic here
    console.log("Creating agent:", agentData)
    // You can add logic to update the humanAgents list or make an API call
  }

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
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email"
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select defaultValue="all-roles">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-roles">All Roles</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setIsModalOpen(true)}
                >
                  Create Agent
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
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
                        {humanAgents.map((agent) => (
                          <tr key={agent.id} className="border-b hover:bg-muted/25">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                    K
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{agent.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">{agent.email}</td>
                            <td className="p-4">{agent.role}</td>
                            <td className="p-4">{agent.department}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm">{agent.status}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
              <TabsContent value="teams" className="mt-6">
              <p className="text-muted-foreground">Teams content will be implemented here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateHumanAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateAgent={handleCreateAgent}
      />
    </MainLayout>
  )
}
