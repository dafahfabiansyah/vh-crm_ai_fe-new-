import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, RefreshCw, Database, Trash2, Calendar, FileText, Edit } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

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

  // Website Knowledge State
  const [websiteKnowledge, setWebsiteKnowledge] = useState<any[]>([]);
  const [websiteLoading, setWebsiteLoading] = useState(false);
  const [websiteError, setWebsiteError] = useState<string | null>(null);
  const [websiteDeleteId, setWebsiteDeleteId] = useState<string | null>(null);
  const [websiteDeleteLoading, setWebsiteDeleteLoading] = useState(false);
  const [websiteDeleteError, setWebsiteDeleteError] = useState<string | null>(null);

  // Q&A Knowledge State
  const [qaList, setQaList] = useState<any[]>([]);
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);
  const [qaDeleteId, setQaDeleteId] = useState<string | null>(null);
  const [qaDeleteLoading, setQaDeleteLoading] = useState(false);
  const [qaDeleteError, setQaDeleteError] = useState<string | null>(null);
  // Edit Q&A State
  const [qaEditItem, setQaEditItem] = useState<any | null>(null);
  const [qaEditQuestion, setQaEditQuestion] = useState("");
  const [qaEditAnswer, setQaEditAnswer] = useState("");
  const [qaEditLoading, setQaEditLoading] = useState(false);
  const [qaEditError, setQaEditError] = useState<string | null>(null);

  // Edit Text Knowledge State
  const [editTextOpen, setEditTextOpen] = useState(false);
  const [editTextValue, setEditTextValue] = useState("");
  const [editTextLoading, setEditTextLoading] = useState(false);
  const [editTextError, setEditTextError] = useState<string | null>(null);

  // Edit per content item
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editItemValue, setEditItemValue] = useState("");
  const [editItemLoading, setEditItemLoading] = useState(false);
  const [editItemError, setEditItemError] = useState<string | null>(null);

  // Edit Knowledge Base State
  const [editBaseOpen, setEditBaseOpen] = useState(false);
  const [editBaseName, setEditBaseName] = useState("");
  const [editBaseDescription, setEditBaseDescription] = useState("");
  const [editBaseStatus, setEditBaseStatus] = useState(true);
  const [editBaseLoading, setEditBaseLoading] = useState(false);
  const [editBaseError, setEditBaseError] = useState<string | null>(null);

  // Knowledge Text State
  // const [allTextKnowledge, setAllTextKnowledge] = useState<any[]>([]);
  // const [allTextLoading, setAllTextLoading] = useState(false);
  // const [allTextError, setAllTextError] = useState<string | null>(null);

  const handleEditQAKnowledge = (item: any) => {
    setQaEditItem(item);
    setQaEditQuestion(item.question);
    setQaEditAnswer(item.answer);
    setQaEditError(null);
  };

  const handleUpdateQAKnowledge = async () => {
    if (!qaEditItem) return;
    setQaEditLoading(true);
    setQaEditError(null);
    try {
      await KnowledgeService.updateQAKnowledge(qaEditItem.id, qaEditQuestion, qaEditAnswer);
      setQaList(prev => prev.map(q => q.id === qaEditItem.id ? { ...q, question: qaEditQuestion, answer: qaEditAnswer, updated_at: new Date().toISOString() } : q));
      setQaEditItem(null);
    } catch (err: any) {
      setQaEditError(err.message || 'Failed to update Q&A knowledge');
    } finally {
      setQaEditLoading(false);
    }
  };

  const handleEditTextKnowledge = async () => {
    const textId = knowledgeContent?.contentItems?.[0]?.id;
    if (!textId) return;
    setEditTextLoading(true);
    setEditTextError(null);
    try {
      await KnowledgeService.editTextKnowledge(textId, editTextValue);
      // Reload content after update
      await loadKnowledgeContent(selectedKnowledge!.id);
      setEditTextOpen(false);
    } catch (err: any) {
      setEditTextError(err.message || 'Failed to update knowledge content');
    } finally {
      setEditTextLoading(false);
    }
  };

  const handleOpenEditItem = async (itemId: string) => {
    setEditItemId(itemId);
    setEditItemError(null);
    setEditItemLoading(true);
    try {
      const data = await KnowledgeService.getTextKnowledgeById(itemId);
      setEditItemValue(data.content || "");
      setEditItemOpen(true);
    } catch (err: any) {
      setEditItemError(err.message || 'Failed to fetch content');
      setEditItemOpen(true);
    } finally {
      setEditItemLoading(false);
    }
  };

  const handleEditItemKnowledge = async () => {
    if (!editItemId) return;
    setEditItemLoading(true);
    setEditItemError(null);
    try {
      await KnowledgeService.updateTextKnowledge(editItemId, editItemValue);
      // Reload content after update
      if (selectedKnowledge) await loadKnowledgeContent(selectedKnowledge.id);
      setEditItemOpen(false);
    } catch (err: any) {
      setEditItemError(err.message || 'Failed to update knowledge content');
    } finally {
      setEditItemLoading(false);
    }
  };

  const handleOpenEditBase = () => {
    if (selectedKnowledge) {
      setEditBaseName(selectedKnowledge.name);
      setEditBaseDescription(selectedKnowledge.description);
      setEditBaseStatus(selectedKnowledge.status);
      setEditBaseError(null);
      setEditBaseOpen(true);
    }
  };

  const handleEditBaseKnowledge = async () => {
    if (!selectedKnowledge) return;
    setEditBaseLoading(true);
    setEditBaseError(null);
    try {
      await KnowledgeService.updateKnowledgeBase(selectedKnowledge.id, {
        name: editBaseName,
        description: editBaseDescription,
        status: editBaseStatus,
      });
      // Update state selectedKnowledge secara lokal
      setSelectedKnowledge(prev => prev ? {
        ...prev,
        name: editBaseName,
        description: editBaseDescription,
        status: editBaseStatus,
        updated_at: new Date().toISOString(),
      } : prev);
      // Update knowledgeList secara lokal
      setKnowledgeList(prev =>
        prev.map(item =>
          item.id === selectedKnowledge.id
            ? { ...item, name: editBaseName, description: editBaseDescription, status: editBaseStatus, updated_at: new Date().toISOString() }
            : item
        )
      );
      setEditBaseOpen(false);
    } catch (err: any) {
      setEditBaseError(err.message || 'Failed to update knowledge base');
    } finally {
      setEditBaseLoading(false);
    }
  };

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

  const loadWebsiteKnowledge = async () => {
    try {
      setWebsiteLoading(true);
      setWebsiteError(null);
      const data = await KnowledgeService.getWebsiteKnowledge(agentId);
      setWebsiteKnowledge(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setWebsiteError(err.message || 'Failed to load website knowledge');
    } finally {
      setWebsiteLoading(false);
    }
  };

  const loadQAKnowledge = async () => {
    try {
      setQaLoading(true);
      setQaError(null);
      const data = await KnowledgeService.getAllQAKnowledge();
      setQaList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setQaError(err.message || 'Failed to load Q&A knowledge');
    } finally {
      setQaLoading(false);
    }
  };

  const handleDeleteQAKnowledge = async () => {
    if (!qaDeleteId) return;
    setQaDeleteLoading(true);
    setQaDeleteError(null);
    try {
      await KnowledgeService.deleteQAKnowledge(qaDeleteId);
      setQaList(prev => prev.filter(item => item.id !== qaDeleteId));
      setQaDeleteId(null);
    } catch (err: any) {
      setQaDeleteError(err.message || 'Failed to delete Q&A knowledge');
    } finally {
      setQaDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (agentId) {
      loadKnowledgeList();
      loadWebsiteKnowledge();
      loadQAKnowledge();
    }
  }, [agentId]);

  // useEffect(() => {
  //   setAllTextLoading(true);
  //   setAllTextError(null);
  //   KnowledgeService.getAllTextKnowledge()
  //     .then((data: any[]) => setAllTextKnowledge(Array.isArray(data) ? data : []))
  //     .catch((err: any) => setAllTextError(err.message || 'Failed to fetch all knowledge text'))
  //     .finally(() => setAllTextLoading(false));
  // }, []);

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

  const handleDeleteWebsiteKnowledge = async () => {
    if (!websiteDeleteId) return;
    setWebsiteDeleteLoading(true);
    setWebsiteDeleteError(null);
    try {
      await KnowledgeService.deleteWebsiteKnowledge(websiteDeleteId);
      setWebsiteKnowledge(prev => prev.filter(item => item.id !== websiteDeleteId));
      setWebsiteDeleteId(null);
    } catch (err: any) {
      setWebsiteDeleteError(err.message || 'Failed to delete website knowledge');
    } finally {
      setWebsiteDeleteLoading(false);
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

  if (
    (!knowledgeList || knowledgeList.length === 0) &&
    (!websiteKnowledge || websiteKnowledge.length === 0) &&
    (!qaList || qaList.length === 0)
  ) {
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

      {/* Website Knowledge Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">Website Knowledge</h3>
        {websiteLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading website knowledge...</span>
          </div>
        ) : websiteError ? (
          <div className="text-red-600 mb-4">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Failed to load website knowledge</p>
            <p className="text-sm text-muted-foreground mt-1">{websiteError}</p>
            <Button onClick={loadWebsiteKnowledge} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : websiteKnowledge.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">No website knowledge found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {websiteKnowledge.map((item) => (
              <Card key={item.id} className="overflow-x-auto relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {item.title || 'No Title'}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {item.url}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={e => {
                        e.stopPropagation();
                        setWebsiteDeleteId(item.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-medium">URL:</span> {item.url}
                    </div>
                    <div>
                      <span className="font-medium">Title:</span> {item.title || 'No Title'}
                    </div>
                    <div>
                      <span className="font-medium">HTML Characters:</span> {item.html ? item.html.length : 0}
                    </div>
                    <div>
                      <span className="font-medium">Scraping Status:</span> {item.scraping_status || '-'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Konfirmasi Hapus Website Knowledge */}
        <Dialog open={!!websiteDeleteId} onOpenChange={open => !open && setWebsiteDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Website Knowledge?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus website knowledge ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            {websiteDeleteError && (
              <div className="text-red-600 text-sm mb-2">{websiteDeleteError}</div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setWebsiteDeleteId(null)} disabled={websiteDeleteLoading}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteWebsiteKnowledge} disabled={websiteDeleteLoading}>
                {websiteDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Q&A Knowledge Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">Q&amp;A Knowledge</h3>
        {qaLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading Q&amp;A knowledge...</span>
          </div>
        ) : qaError ? (
          <div className="text-red-600 mb-4">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Failed to load Q&amp;A knowledge</p>
            <p className="text-sm text-muted-foreground mt-1">{qaError}</p>
            <Button onClick={loadQAKnowledge} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : qaList.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">No Q&amp;A knowledge found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {qaList.map((item) => (
              <Card key={item.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {item.question}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {item.answer}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={e => {
                          e.stopPropagation();
                          handleEditQAKnowledge(item);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={e => {
                          e.stopPropagation();
                          setQaDeleteId(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(item.created_at)}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {formatDate(item.updated_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Modal Konfirmasi Hapus Q&A Knowledge */}
        <Dialog open={!!qaDeleteId} onOpenChange={open => !open && setQaDeleteId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Q&amp;A Knowledge?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus Q&amp;A knowledge ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>
            {qaDeleteError && (
              <div className="text-red-600 text-sm mb-2">{qaDeleteError}</div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setQaDeleteId(null)} disabled={qaDeleteLoading}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDeleteQAKnowledge} disabled={qaDeleteLoading}>
                {qaDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Q&A Modal */}
      <Dialog open={!!qaEditItem} onOpenChange={open => !open && setQaEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Q&amp;A Knowledge</DialogTitle>
            <DialogDescription>
              Ubah pertanyaan dan jawaban Q&amp;A knowledge.
            </DialogDescription>
          </DialogHeader>
          {qaEditError && (
            <div className="text-red-600 text-sm mb-2">{qaEditError}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <textarea
                className="w-full border rounded p-2 min-h-[60px]"
                value={qaEditQuestion}
                onChange={e => setQaEditQuestion(e.target.value)}
                disabled={qaEditLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <textarea
                className="w-full border rounded p-2 min-h-[80px]"
                value={qaEditAnswer}
                onChange={e => setQaEditAnswer(e.target.value)}
                disabled={qaEditLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQaEditItem(null)} disabled={qaEditLoading}>
              Batal
            </Button>
            <Button variant="default" onClick={handleUpdateQAKnowledge} disabled={qaEditLoading || !qaEditQuestion.trim() || !qaEditAnswer.trim()}>
              {qaEditLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                            {/* Render semua contentItems jika ada */}
                            {knowledgeContent.contentItems && knowledgeContent.contentItems.length > 0 ? (
                              knowledgeContent.contentItems.map((item, idx) => (
                                <div key={item.id} className="mb-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">Content #{idx + 1}</span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 px-2 py-0 text-xs"
                                      onClick={() => {
                                        const content = item.content as { id?: string };
                                        if (content && typeof content.id === 'string' && content.id) {
                                          handleOpenEditItem(content.id);
                                        }
                                      }}
                                      disabled={!(item.content && typeof (item.content as { id?: string }).id === 'string' && (item.content as { id?: string }).id)}
                                    >
                                      <Edit className="h-3 w-3 mr-1" />Edit
                                    </Button>
                                  </div>
                                  <pre className="text-sm text-foreground whitespace-pre-wrap break-words bg-white rounded p-2 border">
                                    {item.content?.content || '-'}
                                  </pre>
                                </div>
                              ))
                            ) : (
                              <pre className="text-sm text-foreground whitespace-pre-wrap break-words">
                                {knowledgeContent.content?.text?.content || 'No content available'}
                              </pre>
                            )}
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
                  <>
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
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleOpenEditBase}
                      disabled={loadingContent}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Knowledge
                    </Button>
                  </>
                )}
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Edit Text Knowledge Modal */}
      <Dialog open={editTextOpen} onOpenChange={setEditTextOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Knowledge </DialogTitle>
            <DialogDescription>
              Ubah Name, Description, dan Status, lalu klik Simpan untuk memperbarui.
            </DialogDescription>
          </DialogHeader>
          {editTextError && (
            <div className="text-red-600 text-sm mb-2">{editTextError}</div>
          )}
          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={editTextValue}
            onChange={e => setEditTextValue(e.target.value)}
            disabled={editTextLoading}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTextOpen(false)} disabled={editTextLoading}>
              Batal
            </Button>
            <Button variant="default" onClick={handleEditTextKnowledge} disabled={editTextLoading || !editTextValue.trim()}>
              {editTextLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit per Content Item Modal */}
      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Knowledge Content Item</DialogTitle>
            <DialogDescription>
              Ubah isi knowledge text di bawah ini, lalu klik Simpan untuk memperbarui.
            </DialogDescription>
          </DialogHeader>
          {editItemError && (
            <div className="text-red-600 text-sm mb-2">{editItemError}</div>
          )}
          <textarea
            className="w-full border rounded p-2 min-h-[120px]"
            value={editItemValue}
            onChange={e => setEditItemValue(e.target.value)}
            disabled={editItemLoading}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemOpen(false)} disabled={editItemLoading}>
              Batal
            </Button>
            <Button variant="default" onClick={handleEditItemKnowledge} disabled={editItemLoading || !editItemValue.trim()}>
              {editItemLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Base Modal */}
      <Dialog open={editBaseOpen} onOpenChange={setEditBaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Knowledge</DialogTitle>
            <DialogDescription>
              Ubah Name, Description, dan Status, lalu klik Simpan untuk memperbarui.
            </DialogDescription>
          </DialogHeader>
          {editBaseError && (
            <div className="text-red-600 text-sm mb-2">{editBaseError}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full border rounded p-2"
                value={editBaseName}
                onChange={e => setEditBaseName(e.target.value)}
                disabled={editBaseLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded p-2 min-h-[60px]"
                value={editBaseDescription}
                onChange={e => setEditBaseDescription(e.target.value)}
                disabled={editBaseLoading}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium">Status</label>
              <input
                type="checkbox"
                checked={editBaseStatus}
                onChange={e => setEditBaseStatus(e.target.checked)}
                disabled={editBaseLoading}
              />
              <span className="text-sm">{editBaseStatus ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBaseOpen(false)} disabled={editBaseLoading}>
              Batal
            </Button>
            <Button variant="default" onClick={handleEditBaseKnowledge} disabled={editBaseLoading || !editBaseName.trim()}>
              {editBaseLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Knowledge Text Section */}
      {/* <div className="mt-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Text</h3>
        {allTextLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading knowledge text...</span>
          </div>
        ) : allTextError ? (
          <div className="text-red-600 mb-4">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Failed to load knowledge text</p>
            <p className="text-sm text-muted-foreground mt-1">{allTextError}</p>
            <Button onClick={() => {
              setAllTextLoading(true);
              setAllTextError(null);
              KnowledgeService.getAllTextKnowledge()
                .then((data: any[]) => setAllTextKnowledge(Array.isArray(data) ? data : []))
                .catch((err: any) => setAllTextError(err.message || 'Failed to fetch all knowledge text'))
                .finally(() => setAllTextLoading(false));
            }} variant="outline" className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : allTextKnowledge.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">No knowledge text found.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {allTextKnowledge.map((item: any) => (
              <Card key={item.id} className="overflow-x-auto relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {item.name || 'No Name'}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {item.content}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-medium">ID:</span> {item.id}
                    </div>
                    <div>
                      <span className="font-medium">Knowledge Base ID:</span> {item.id_knowledge}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}
