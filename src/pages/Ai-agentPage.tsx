import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Search, Plus, Trash2, AlertCircle, Loader2 } from "lucide-react";

import MainLayout from "@/main-layout";
import { mockAIAgents } from "@/mock/data";
import type { AIAgent } from "@/types";
import CreateAgentModal from "@/components/create-agent-modal";

export default function AIAgentsPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agents, setAgents] = useState<AIAgent[]>(mockAIAgents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulate loading on initial render
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Keep existing agents and merge with mock data if needed
      setAgents(prevAgents => {
        // If no previous agents, use mock data
        if (prevAgents.length === 0) {
          return mockAIAgents;
        }
        // Otherwise keep existing agents (which includes newly created ones)
        return prevAgents;
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Error fetching agents:", err);
      setError(error.message || "Failed to load AI agents");
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentCreated = (newAgent?: any) => {
    if (newAgent) {
      // Add the new agent to the existing agents
      setAgents(prev => [...prev, newAgent]);
    } else {
      // Fallback: refresh the agents list
      fetchAgents();
    }
  };
  const handleDeleteAgent = async (agent: AIAgent) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update agent to set is_active: false (soft delete) in local state
      setAgents(prev => 
        prev.map(a => 
          a.id === agent.id 
            ? { ...a, is_active: false } 
            : a
        )
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Error deleting agent:", err);
      setError(error.message || "Failed to delete agent");
    } finally {
      setLoading(false);
    }
  };

  const handleAgentClick = (agentId: string) => {
    navigate(`/ai-agents/${agentId}`);
  };

  const filteredAgents = Array.isArray(agents)
    ? agents.filter((agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getAgentInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
            <Input
              placeholder="Cari agen..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            BUAT AGEN AI BARU
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Memuat agen AI...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Gagal memuat agen AI
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchAgents} variant="outline">
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery
                ? "Tidak ada agen yang ditemukan"
                : "Belum ada agen AI"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? "Coba kata kunci pencarian yang berbeda"
                : "Mulai dengan membuat agen AI pertama Anda untuk mengotomatiskan layanan pelanggan"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Agen AI Pertama
              </Button>
            )}
          </div>
        )}

        {/* Agents Grid */}
        {!loading && !error && filteredAgents.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {" "}
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleAgentClick(agent.id)}
              >
                <CardContent className="p-0">
                  {/* Header with Avatar and Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 bg-green-100">
                        <AvatarFallback className="text-green-600 font-semibold">
                          {getAgentInitials(agent.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg">{agent.name}</h3>
                        <Badge
                          variant={agent.is_active ? "default" : "secondary"}
                          className={`text-xs ${
                            agent.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {agent.role?.name || "Unknown Role"}
                        </Badge>
                      </div>
                    </div>{" "}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAgent(agent);
                        }}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    {agent.role?.description || "AI agent for automated tasks"}
                  </p>

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(agent.created_at)}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        agent.is_active ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {agent.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <CreateAgentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAgentCreated}
        />
      </div>
    </MainLayout>
  );
}
