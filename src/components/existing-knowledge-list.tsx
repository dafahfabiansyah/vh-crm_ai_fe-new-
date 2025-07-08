import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, RefreshCw, Database, Trash2, Calendar, FileText } from "lucide-react";
import { KnowledgeService, type ExistingKnowledge, type KnowledgeSourceContent } from "@/services/knowledgeService";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ExistingKnowledgeListProps {
  agentId: string;
}

export default function ExistingKnowledgeList({ agentId }: ExistingKnowledgeListProps) {
  const [knowledgeList, setKnowledgeList] = useState<ExistingKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<ExistingKnowledge | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [knowledgeContent, setKnowledgeContent] = useState<KnowledgeSourceContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  const loadKnowledgeList = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await KnowledgeService.getExistingKnowledge(agentId);
      setKnowledgeList(data || []); // Ensure it's always an array
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

  const handleCardClick = (knowledge: ExistingKnowledge) => {
    setSelectedKnowledge(knowledge);
    setDrawerOpen(true);
    loadKnowledgeContent(knowledge.id);
  };

  const loadKnowledgeContent = async (knowledgeId: string) => {
    try {
      setLoadingContent(true);
      setContentError(null);
      setKnowledgeContent(null);
      
      const content = await KnowledgeService.getKnowledgeSourceContent(knowledgeId);
      
      // Log content structure for debugging
      console.log('Knowledge content loaded:', content);
      
      setKnowledgeContent(content);
    } catch (err: any) {
      console.error('Error loading knowledge content:', err);
      setContentError(err.message || 'Failed to load knowledge content');
    } finally {
      setLoadingContent(false);
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

  if (!knowledgeList || knowledgeList.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Belum ada knowledge yang dibuat
        </h3>
        <p className="text-muted-foreground mb-4">
          Kembali ke tab Knowledge Source lalu tambahkan knowledge
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
            Knowledge Sources ({knowledgeList?.length || 0})
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
          <Card 
            key={knowledge.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleCardClick(knowledge)}
          >
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when delete button is clicked
                      handleDelete(knowledge);
                    }}
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

      {/* Knowledge Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-w-6xl mx-auto max-h-[90vh] flex flex-col">
          <div className="w-full flex flex-col overflow-hidden">
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Knowledge Details
              </DrawerTitle>
              <DrawerDescription>
                View complete information and content for this knowledge source
              </DrawerDescription>
            </DrawerHeader>
            
            {selectedKnowledge && (
              <div className="p-4 pb-0 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Knowledge Details */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Basic Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm text-foreground mt-1">{selectedKnowledge.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Description</label>
                          <p className="text-sm text-foreground mt-1">{selectedKnowledge.description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">
                            <Badge variant={selectedKnowledge.status ? "default" : "secondary"}>
                              {selectedKnowledge.status ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-foreground">Technical Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Knowledge ID</label>
                          <p className="text-xs text-foreground mt-1 font-mono break-all">{selectedKnowledge.id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Agent ID</label>
                          <p className="text-xs text-foreground mt-1 font-mono break-all">{selectedKnowledge.id_agent}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Created</label>
                          <p className="text-sm text-foreground mt-1">{formatDate(selectedKnowledge.created_at)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                          <p className="text-sm text-foreground mt-1">{formatDate(selectedKnowledge.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Knowledge Content */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-foreground">Knowledge Content</h3>
                    <div className="border rounded-lg p-4 min-h-[300px] max-h-[600px] bg-card overflow-y-auto">
                      {loadingContent ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Loading content...</span>
                          </div>
                        </div>
                      ) : contentError ? (
                        <div className="text-center py-12">
                          <div className="text-red-600 mb-4">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">Failed to load content</p>
                            <p className="text-sm text-muted-foreground mt-1">{contentError}</p>
                          </div>
                          <Button 
                            onClick={() => loadKnowledgeContent(selectedKnowledge.id)} 
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                          </Button>
                        </div>
                      ) : knowledgeContent ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Knowledge Content</span>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <pre className="text-sm text-foreground whitespace-pre-wrap break-words">
                              {/* Prioritize the new API structure */}
                              {knowledgeContent.contentItems && 
                               knowledgeContent.contentItems.length > 0 && 
                               knowledgeContent.contentItems[0].content?.content 
                                ? knowledgeContent.contentItems[0].content.content 
                                : (knowledgeContent.content?.text?.content || 'No content available')}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>No content loaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DrawerFooter className="flex-shrink-0">
              <div className="flex gap-2">
                {selectedKnowledge && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === selectedKnowledge.id}
                    onClick={() => {
                      handleDelete(selectedKnowledge);
                      setDrawerOpen(false);
                    }}
                  >
                    {deletingId === selectedKnowledge.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Knowledge
                      </>
                    )}
                  </Button>
                )}
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
