
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

const ToolsConfig: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        <Button onClick={handleAddTool}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tool
        </Button>
      </div>

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
    </div>
  );
};

export default ToolsConfig;
