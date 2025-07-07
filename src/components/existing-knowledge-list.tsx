import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, RefreshCw, Database, Trash2, Calendar } from "lucide-react";
import { KnowledgeService, type ExistingKnowledge } from "@/services/knowledgeService";

interface ExistingKnowledgeListProps {
  agentId: string;
}

export default function ExistingKnowledgeList({ agentId }: ExistingKnowledgeListProps) {
  const [knowledgeList, setKnowledgeList] = useState<ExistingKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadKnowledgeList = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await KnowledgeService.getExistingKnowledge(agentId);
      setKnowledgeList(data);
    } catch (err: any) {
      console.error('Error loading knowledge list:', err);
      setError(err.message || 'Failed to load knowledge sources');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      loadKnowledgeList();
    }
  }, [agentId]);

  const handleRefresh = () => {
    loadKnowledgeList(true);
  };

  const handleDelete = async (knowledge: ExistingKnowledge) => {
    try {
      setDeletingId(knowledge.id);
      // Use the knowledge ID as the settings ID for deletion
      await KnowledgeService.deleteKnowledge(knowledge.id);
      
      // Remove from local state
      setKnowledgeList(prev => prev.filter(item => item.id !== knowledge.id));
    } catch (err: any) {
      console.error('Error deleting knowledge:', err);
      setError(err.message || 'Failed to delete knowledge source');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading knowledge sources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load knowledge sources</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (knowledgeList.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Knowledge Sources Found
        </h3>
        <p className="text-muted-foreground mb-4">
          Start by adding knowledge sources in the tabs above to train your AI agent.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Knowledge Sources ({knowledgeList.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your AI agent's knowledge base
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {knowledgeList.map((knowledge) => (
          <Card key={knowledge.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold text-foreground truncate">
                    {knowledge.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {knowledge.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge 
                    variant={knowledge.status ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {knowledge.status ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {formatDate(knowledge.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deletingId === knowledge.id}
                    onClick={() => handleDelete(knowledge)}
                  >
                    {deletingId === knowledge.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              {knowledge.updated_at !== knowledge.created_at && (
                <div className="text-xs text-muted-foreground mt-1">
                  Updated: {formatDate(knowledge.updated_at)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
