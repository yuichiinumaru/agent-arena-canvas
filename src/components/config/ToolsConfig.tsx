
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tool, ToolParameter } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropZone } from '@/components/shared/FileDropZone';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FastApiMcpConverter from './FastApiMcpConverter';

const ToolsConfig: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tools'); // 'tools' or 'fastapi'
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Tool interface
      const transformedTools: Tool[] = (data || []).map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description || '',
        parameters: Array.isArray(tool.parameters) 
          ? tool.parameters.map((p: any) => ({
              name: p.name || '',
              type: p.type as 'string' | 'number' | 'boolean' | 'array' | 'object' || 'string',
              description: p.description || '',
              required: !!p.required,
              default: p.default
            }))
          : [],
        isActive: tool.is_active,
        script: tool.script,
      }));
      
      setTools(transformedTools);
    } catch (error: any) {
      toast({
        title: 'Error loading tools',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTool = () => {
    const newTool: Tool = {
      id: `temp-${Date.now()}`,
      name: 'New Tool',
      description: '',
      parameters: [],
      isActive: true,
    };
    setTools([...tools, newTool]);
  };

  const handleUpdateTool = async (id: string, updates: Partial<Tool>) => {
    const isTemp = id.startsWith('temp-');
    const updatedTools = tools.map(tool => 
      tool.id === id ? { ...tool, ...updates } : tool
    );
    setTools(updatedTools);

    if (!isTemp && user) {
      try {
        // Transform the updates to match the database schema
        const dbUpdates: any = {
          name: updates.name,
          description: updates.description,
          is_active: updates.isActive,
          script: updates.script,
        };
        
        // Only include parameters if they were updated
        if (updates.parameters) {
          // Convert ToolParameter[] to a format Supabase can handle (JSON)
          const parametersJson = updates.parameters.map(p => ({
            name: p.name,
            type: p.type,
            description: p.description,
            required: p.required,
            default: p.default
          }));
          
          dbUpdates.parameters = parametersJson;
        }

        const { error } = await supabase
          .from('tools')
          .update(dbUpdates)
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: 'Tool updated',
          description: 'The tool has been updated successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Error updating tool',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleSaveTool = async (tool: Tool) => {
    if (!user) return;

    try {
      // Convert ToolParameter[] to a format Supabase can handle (JSON)
      const parametersJson = tool.parameters.map(p => ({
        name: p.name,
        type: p.type,
        description: p.description,
        required: p.required,
        default: p.default
      }));
      
      // Transform the tool to match the database schema
      const dbTool = {
        name: tool.name,
        description: tool.description,
        parameters: parametersJson,
        is_active: tool.isActive,
        script: tool.script,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('tools')
        .insert([dbTool])
        .select()
        .single();

      if (error) throw error;

      // Transform the response back to match our Tool interface
      const savedTool: Tool = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        parameters: Array.isArray(data.parameters) 
          ? data.parameters.map((p: any) => ({
              name: p.name || '',
              type: (p.type as 'string' | 'number' | 'boolean' | 'array' | 'object') || 'string',
              description: p.description || '',
              required: !!p.required,
              default: p.default
            }))
          : [],
        isActive: data.is_active,
        script: data.script,
      };

      setTools(tools.map(t => t.id === tool.id ? savedTool : t));

      toast({
        title: 'Tool saved',
        description: 'The tool has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving tool',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;

    const isTemp = id.startsWith('temp-');
    setTools(tools.filter(tool => tool.id !== id));

    if (!isTemp) {
      try {
        const { error } = await supabase
          .from('tools')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Tool deleted',
          description: 'The tool has been deleted successfully.',
        });
      } catch (error: any) {
        toast({
          title: 'Error deleting tool',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleScriptUpload = async (files: File[], toolId: string) => {
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      handleUpdateTool(toolId, { script: content });
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tools</h2>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full max-w-md ml-auto"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="tools">Manual Configuration</TabsTrigger>
            <TabsTrigger value="fastapi">FastAPI Converter</TabsTrigger>
          </TabsList>
        </Tabs>
        {activeTab === 'tools' && (
          <Button onClick={handleAddTool} className="ml-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Tool
          </Button>
        )}
      </div>

      <TabsContent value="tools" className={activeTab === 'tools' ? 'block' : 'hidden'}>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 pr-4">
            {tools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={tool.name}
                      onChange={(e) => handleUpdateTool(tool.id, { name: e.target.value })}
                      placeholder="Tool name"
                      className="text-lg font-bold"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={tool.description}
                        onChange={(e) => handleUpdateTool(tool.id, { description: e.target.value })}
                        placeholder="Tool description"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Parameters</Label>
                      <div className="border rounded-md p-4 space-y-2">
                        {tool.parameters.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No parameters defined. Add parameters to define the tool's inputs.</p>
                        ) : (
                          tool.parameters.map((param, index) => (
                            <div key={index} className="border p-3 rounded-md grid grid-cols-12 gap-2">
                              <div className="col-span-3">
                                <Label className="text-xs">Name</Label>
                                <Input
                                  value={param.name}
                                  onChange={(e) => {
                                    const updatedParams = [...tool.parameters];
                                    updatedParams[index] = { ...param, name: e.target.value };
                                    handleUpdateTool(tool.id, { parameters: updatedParams });
                                  }}
                                  size={10}
                                />
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs">Type</Label>
                                <select
                                  value={param.type}
                                  onChange={(e) => {
                                    const updatedParams = [...tool.parameters];
                                    updatedParams[index] = { ...param, type: e.target.value as any };
                                    handleUpdateTool(tool.id, { parameters: updatedParams });
                                  }}
                                  className="w-full px-3 py-2 border rounded-md"
                                >
                                  <option value="string">String</option>
                                  <option value="number">Number</option>
                                  <option value="boolean">Boolean</option>
                                  <option value="array">Array</option>
                                  <option value="object">Object</option>
                                </select>
                              </div>
                              <div className="col-span-5">
                                <Label className="text-xs">Description</Label>
                                <Input
                                  value={param.description}
                                  onChange={(e) => {
                                    const updatedParams = [...tool.parameters];
                                    updatedParams[index] = { ...param, description: e.target.value };
                                    handleUpdateTool(tool.id, { parameters: updatedParams });
                                  }}
                                />
                              </div>
                              <div className="col-span-1 flex items-end">
                                <div className="flex items-center space-x-1">
                                  <Switch
                                    id={`param-${tool.id}-${index}-required`}
                                    checked={param.required}
                                    onCheckedChange={(checked) => {
                                      const updatedParams = [...tool.parameters];
                                      updatedParams[index] = { ...param, required: checked };
                                      handleUpdateTool(tool.id, { parameters: updatedParams });
                                    }}
                                  />
                                  <Label htmlFor={`param-${tool.id}-${index}-required`} className="text-xs">Req</Label>
                                </div>
                              </div>
                              <div className="col-span-1 flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updatedParams = tool.parameters.filter((_, i) => i !== index);
                                    handleUpdateTool(tool.id, { parameters: updatedParams });
                                  }}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newParam: ToolParameter = {
                              name: `param${tool.parameters.length + 1}`,
                              type: 'string',
                              description: '',
                              required: false,
                            };
                            handleUpdateTool(tool.id, { parameters: [...tool.parameters, newParam] });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Parameter
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Script</Label>
                      <FileDropZone
                        onDrop={(files) => handleScriptUpload(files, tool.id)}
                        accept={{
                          'text/javascript': ['.js'],
                          'text/typescript': ['.ts'],
                          'text/plain': ['.txt'],
                        }}
                      >
                        {tool.script ? (
                          <div className="text-sm">
                            <p className="font-medium">Script uploaded</p>
                            <p className="text-gray-500">Drop a new file to replace</p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            <p>Drop your script file here</p>
                            <p>or click to browse</p>
                          </div>
                        )}
                      </FileDropZone>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={tool.isActive}
                          onCheckedChange={(checked) => handleUpdateTool(tool.id, { isActive: checked })}
                        />
                        <Label>Active</Label>
                      </div>

                      <div className="flex-1" />

                      <Button
                        variant="outline"
                        onClick={() => handleDeleteTool(tool.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>

                      {tool.id.startsWith('temp-') && (
                        <Button onClick={() => handleSaveTool(tool)}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="fastapi" className={activeTab === 'fastapi' ? 'block' : 'hidden'}>
        <FastApiMcpConverter />
      </TabsContent>
    </div>
  );
};

export default ToolsConfig;
