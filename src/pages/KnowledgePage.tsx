import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileDropZone } from '@/components/shared/FileDropZone';
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from '@/components/ui/resizable';
import { 
  Grid, 
  List, 
  FileText, 
  File, 
  Trash2, 
  Download, 
  Search,
  X,
  Loader2
} from 'lucide-react';
import { KnowledgeItem } from '@/types';
import { useFileUpload } from '@/hooks/useFileUpload';
import { format } from 'date-fns';
import { useAgent } from '@/contexts/AgentContext';
import PdfViewer from '@/components/shared/PdfViewer';
import DocxViewer from '@/components/shared/DocxViewer';
import XlsxViewer from '@/components/shared/XlsxViewer';
import { chunkText } from '@/lib/chunkText';

interface ExtendedKnowledgeItem extends KnowledgeItem {
  createdAt: Date;
  updatedAt: Date;
  userName: string;
  agentCount: number;
  permittedAgentIds: string[];
}

const KnowledgePage: React.FC = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<ExtendedKnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<ExtendedKnowledgeItem | null>(null);
  const [textChunks, setTextChunks] = useState<string[]>([]);
  const [chunkIndex, setChunkIndex] = useState<number>(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, isUploading } = useFileUpload();
  const { agents } = useAgent();

  useEffect(() => {
    if (user) {
      loadKnowledgeItems();
    }
  }, [user]);

  useEffect(() => {
    if (selectedItem?.type === 'text') {
      const chunks = chunkText(selectedItem.content, 2000);
      setTextChunks(chunks);
      setChunkIndex(0);
    } else {
      setTextChunks([]);
      setChunkIndex(0);
    }
  }, [selectedItem]);

  const loadKnowledgeItems = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      const transformedItems: ExtendedKnowledgeItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        content: item.content || '',
        type: item.type as "text" | "file",
        size: item.file_size || 0,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        userName: 'User',
        agentCount: 0,
        permittedAgentIds: item.permitted_agent_ids || [],
      }));
      
      setKnowledgeItems(transformedItems);
    } catch (error: any) {
      toast({
        title: 'Error loading knowledge items',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files.length || !user) return;
    
    try {
      const file = files[0];
      const uploadedFile = await uploadFile(file, 'knowledge');
      
      if (uploadedFile) {
        const newItem: KnowledgeItem = {
          id: `temp-${Date.now()}`,
          name: file.name,
          content: uploadedFile.path,
          type: 'file',
          size: file.size,
        };
        
        const { data, error } = await supabase
          .from('knowledge_items')
          .insert({
            name: newItem.name,
            content: newItem.content,
            type: newItem.type,
            file_path: newItem.content,
            file_type: file.type,
            file_size: newItem.size,
            user_id: user.id
          })
          .select('*')
          .single();
          
        if (error) {
          throw error;
        }
        
        const newTransformedItem: ExtendedKnowledgeItem = {
          id: data.id,
          name: data.name,
          content: data.content || '',
          type: data.type as "text" | "file",
          size: data.file_size || 0,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          userName: user.name || 'User',
          agentCount: 0,
          permittedAgentIds: [],
        };
        
        setKnowledgeItems([newTransformedItem, ...knowledgeItems]);
        
        toast({
          title: 'File uploaded',
          description: 'The file was uploaded successfully.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        const { error } = await supabase
          .from('knowledge_items')
          .delete()
          .eq('id', id);
          
        if (error) {
          throw error;
        }
      }
      
      setKnowledgeItems(knowledgeItems.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      
      toast({
        title: 'Item deleted',
        description: 'The item was deleted successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Delete Error',
        description: error.message || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadItem = async (item: KnowledgeItem) => {
    try {
      if (item.type === 'file') {
        const { data, error } = await supabase.storage
          .from('agent-files')
          .download(item.content);
          
        if (error) {
          throw error;
        }
        
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For text items, create a text file
        const blob = new Blob([item.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.name}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error: any) {
      toast({
        title: 'Download Error',
        description: error.message || 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePermissions = async (agentIds: string[]) => {
    if (!selectedItem) return;
    try {
      const { error } = await supabase
        .from('knowledge_items')
        .update({ permitted_agent_ids: agentIds })
        .eq('id', selectedItem.id);
      if (error) throw error;
      setSelectedItem({ ...selectedItem, permittedAgentIds: agentIds });
      setKnowledgeItems(knowledgeItems.map(item => item.id === selectedItem.id ? { ...item, permittedAgentIds: agentIds } : item));
      toast({ title: 'Permissões atualizadas', description: 'Permissões alteradas com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar permissões', description: err.message, variant: 'destructive' });
    }
  };

  const filteredItems = knowledgeItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fileIcon = (item: KnowledgeItem) => {
    const extension = item.name.split('.').pop()?.toLowerCase();
    
    if (!extension) return <File />;
    
    switch (extension) {
      case 'pdf':
        return <FileText className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="text-orange-500" />;
      case 'txt':
        return <FileText className="text-gray-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <File className="text-purple-500" />;
      default:
        return <File />;
    }
  };

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search knowledge items..."
              className="pl-10 w-64"
            />
            {searchTerm && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          <div className="border border-border rounded-md overflow-hidden flex">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className="rounded-none border-0"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={selectedItem ? 65 : 100} minSize={30}>
          <div className="h-full p-4 flex flex-col">
            <FileDropZone
              onDrop={handleFileUpload}
              className="h-32 mb-4 flex items-center justify-center bg-card border-2 border-dashed border-border rounded-lg"
            >
              {isUploading ? (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-medium mb-1">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Upload documents to your knowledge base</p>
                </div>
              )}
            </FileDropZone>
            
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">No knowledge items found</p>
              </div>
            ) : viewMode === 'list' ? (
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-3 flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {fileIcon(item)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.name}</p>
                          <div className="flex text-xs text-muted-foreground">
                            <span className="mr-4">{formatSize(item.size)}</span>
                            <span className="mr-4">Updated: {format(item.updatedAt, 'MMM d, yyyy')}</span>
                            <span>Used by {item.agentCount} agents</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2 flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadItem(item);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item.id);
                            }}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map(item => (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer h-40 flex flex-col transition-colors ${selectedItem?.id === item.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-3 flex flex-col h-full">
                        <div className="flex items-center mb-2">
                          <div className="flex-shrink-0 mr-2">
                            {fileIcon(item)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                          </div>
                        </div>
                        <div className="flex-1"></div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                          <span>{formatSize(item.size)}</span>
                          <div className="flex">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadItem(item);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Download size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                              className="h-6 w-6 p-0 text-destructive"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </ResizablePanel>
        
        {selectedItem && (
          <>
            <ResizableHandle withHandle className="bg-border hover:bg-primary transition-colors" />
            <ResizablePanel defaultSize={35} minSize={25}>
              <div className="h-full p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedItem(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                <div className="mb-4 bg-card p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p>{selectedItem.type === 'file' ? 'File' : 'Text'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p>{formatSize(selectedItem.size)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{format(selectedItem.createdAt, 'MMM d, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Updated</p>
                      <p>{format(selectedItem.updatedAt, 'MMM d, yyyy HH:mm')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created by</p>
                      <p>{selectedItem.userName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Used by</p>
                      <p>{selectedItem.agentCount} agents</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4 bg-card p-3 rounded-md">
                  <p className="text-sm font-semibold">Permissões de Agentes</p>
                  <div className="space-y-1">
                    {agents.map(agent => (
                      <label key={agent.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedItem.permittedAgentIds.includes(agent.id)}
                          onChange={() => {
                            const newPermitted = selectedItem.permittedAgentIds.includes(agent.id)
                              ? selectedItem.permittedAgentIds.filter(id => id !== agent.id)
                              : [...selectedItem.permittedAgentIds, agent.id];
                            handleUpdatePermissions(newPermitted);
                          }}
                        />
                        <span>{agent.name}</span>
                      </label>
                    ))}
                    <Button size="sm" onClick={() => handleUpdatePermissions(selectedItem.permittedAgentIds)}>
                      Salvar Permissões
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 bg-card p-3 rounded-md overflow-hidden">
                  <Tabs defaultValue="preview" className="h-full flex flex-col">
                    <TabsList className="mb-2">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="text">Text Content</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preview" className="flex-1 overflow-hidden">
                      {selectedItem.type === 'file' && selectedItem.content ? (() => {
                        const ext = selectedItem.name.split('.').pop()?.toLowerCase();
                        const url = supabase.storage.from('agent-files').getPublicUrl(selectedItem.content).data.publicUrl;
                        if (ext === 'pdf') {
                          return <PdfViewer url={url} />;
                        }
                        if (ext === 'docx') {
                          return <DocxViewer url={url} />;
                        }
                        if (['xlsx','xls'].includes(ext!)) {
                          return <XlsxViewer url={url} />;
                        }
                        if (['png','jpg','jpeg','gif','bmp','svg'].includes(ext!)) {
                          return <img src={url} alt={selectedItem.name} className="w-full h-full object-contain" />;
                        }
                        if (['mp4','mov','webm','ogg'].includes(ext!)) {
                          return <video controls src={url} className="w-full h-full object-contain" />;
                        }
                        if (['pptx','ppt'].includes(ext!)) {
                          return (
                            <iframe
                              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                              title={selectedItem.name}
                              className="w-full h-full"
                            />
                          );
                        }
                        return (
                          <div className="h-full flex items-center justify-center bg-background/50 rounded">
                            <p className="text-muted-foreground">File preview not available for this file type</p>
                          </div>
                        );
                      })() : (
                        <ScrollArea className="h-full">
                          <div className="p-2 whitespace-pre-wrap">
                            {selectedItem.content || 'No content available'}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="text" className="flex-1 flex flex-col">
                      <ScrollArea className="flex-1">
                        <div className="p-2 font-mono text-sm whitespace-pre-wrap">
                          {textChunks[chunkIndex] || 'No text content available'}
                        </div>
                      </ScrollArea>
                      {textChunks.length > 1 && (
                        <div className="flex justify-between items-center p-2">
                          <Button size="sm" disabled={chunkIndex === 0} onClick={() => setChunkIndex(ci => ci - 1)}>
                            Prev
                          </Button>
                          <span className="text-sm">Page {chunkIndex + 1} / {textChunks.length}</span>
                          <Button size="sm" disabled={chunkIndex === textChunks.length - 1} onClick={() => setChunkIndex(ci => ci + 1)}>
                            Next
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadItem(selectedItem)}
                    className="flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="flex items-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default KnowledgePage;
