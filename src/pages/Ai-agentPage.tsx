import { useState } from "react";
import MainLayout from "@/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Settings, Trash2 } from "lucide-react";
import { aiAgents } from "@/app/mock/data";
import CreateAgentModal from "@/components/CreateAgentModal";

export default function AIAgentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateAgent = (data: { name: string; template: string }) => {
    // Handle agent creation here
    console.log("Creating agent:", data);
    // You can add the logic to create the agent here
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Agents</h1>
          <p className="text-gray-600">
            Kelola agen AI Anda untuk mengotomatiskan interaksi pelanggan dan
            meningkatkan waktu respons.
          </p>
        </div>

        {/* Search and Create Button Section */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Cari agen..." className="pl-10" />
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            BUAT AGEN AI BARU
          </Button>
        </div>        {/* Agents Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {aiAgents.map((agent) => (
            <Card
              key={agent.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-0">
                {/* Header with Avatar and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-green-100">
                      <AvatarFallback className="text-green-600 font-semibold">
                        {agent.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg">{agent.name}</h3>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        Customer Service AI
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  AI agent for customer support
                </p>

                {/* Created Date */}
                <div className="text-xs text-gray-500">
                  Created: 19/06/2025
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal */}
        <CreateAgentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateAgent}
        />
      </div>
    </MainLayout>
  );
}
