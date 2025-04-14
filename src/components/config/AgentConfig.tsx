
import React, { useState, useEffect } from 'react';
import { useAgents } from '@/contexts/AgentContext';
import { Agent, KnowledgeItem, Tool, ToolParameter } from '@/types';
import geminiService from '@/services/geminiService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, Upload, Save, Info } from 'lucide-react';

const AgentConfig: React.FC = () => {
  const { agents, addAgent, updateAgent, removeAgent, appConfig } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tokenCount, setTokenCount] = useState<number>(0);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [avatar, setAvatar] = useState('');
  const [model, setModel] = useState(appConfig.models[0]?.id || 'gemini-pro');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  
  // Selected agent
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  
  // Reset form when selected agent changes
  useEffect(() => {
    if (selectedAgent) {
      setName(selectedAgent.name);
      setDescription(selectedAgent.description);
      setInstructions(selectedAgent.instructions);
      setAvatar(selectedAgent.avatar);
      setModel(selectedAgent.model);
      setKnowledgeBase(selectedAgent.knowledgeBase);
      setTools(selectedAgent.tools);
      setTokenCount(selectedAgent.instructionTokenCount);
    } else if (isCreating) {
      // Default values for new agent
      setName('');
      setDescription('');
      setInstructions('');
      setAvatar(`https://ui-avatars.com/api/?name=Agent&background=random`);
      setModel(appConfig.models[0]?.id || 'gemini-pro');
      setKnowledgeBase([]);
      setTools([]);
      setTokenCount(0);
    }
  }, [selectedAgent, isCreating, appConfig.models]);
  
  // Count tokens when instructions change
  useEffect(() => {
    const countTokens = async () => {
      if (instructions) {
        try {
          const count = await geminiService.countTokens(instructions);
          setTokenCount(count);
        } catch (error) {
          console.error('Error counting tokens:', error);
        }
      } else {
        setTokenCount(0);
      }
    };
    
    countTokens();
  }, [instructions]);
  
  const handleCreateAgent = () => {
    setIsCreating(true);
    setSelectedAgentId(null);
  };
  
  const handleSelectAgent = (id: string) => {
    setIsCreating(false);
    setSelectedAgentId(id);
  };
  
  const handleSave = () => {
    if (!name || !instructions) {
      alert('Agent name and instructions are required');
      return;
    }
    
    if (isCreating) {
      const newAgent = addAgent({
        name,
        description,
        instructions,
        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        model,
        instructionTokenCount: tokenCount,
        isActive: true,
        knowledgeBase,
        tools,
      });
      
      setIsCreating(false);
      setSelectedAgentId(newAgent.id);
    } else if (selectedAgentId) {
      updateAgent(selectedAgentId, {
        name,
        description,
        instructions,
        avatar,
        model,
        instructionTokenCount: tokenCount,
        knowledgeBase,
        tools,
      });
    }
  };
  
  const handleDeleteAgent = () => {
    if (!selectedAgentId) return;
    
    if (window.confirm('Are you sure you want to delete this agent?')) {
      removeAgent(selectedAgentId);
      setSelectedAgentId(null);
    }
  };
  
  // Knowledge base functions
  const handleAddKnowledgeItem = () => {
    setKnowledgeBase([
      ...knowledgeBase,
      {
        id: `kb-${Date.now()}`,
        name: 'New Knowledge Item',
        content: '',
        type: 'text',
      },
    ]);
  };
  
  const handleUpdateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledgeBase(
      knowledgeBase.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  };
  
  const handleRemoveKnowledgeItem = (id: string) => {
    setKnowledgeBase(knowledgeBase.filter(item => item.id !== id));
  };
  
  // Tool functions
  const handleAddTool = () => {
    setTools([
      ...tools,
      {
        id: `tool-${Date.now()}`,
        name: 'New Tool',
        description: '',
        parameters: [],
        isActive: true,
      },
    ]);
  };
  
  const handleUpdateTool = (id: string, updates: Partial<Tool>) => {
    setTools(tools.map(tool => (tool.id === id ? { ...tool, ...updates } : tool)));
  };
  
  const handleRemoveTool = (id: string) => {
    setTools(tools.filter(tool => tool.id !== id));
  };
  
  // Tool parameter functions
  const handleAddParameter = (toolId: string) => {
    setTools(
      tools.map(tool => {
        if (tool.id === toolId) {
          return {
            ...tool,
            parameters: [
              ...tool.parameters,
              {
                name: `param${tool.parameters.length + 1}`,
                type: 'string',
                description: '',
                required: false,
              },
            ],
          };
        }
        return tool;
      })
    );
  };
  
  const handleUpdateParameter = (toolId: string, paramIndex: number, updates: Partial<ToolParameter>) => {
    setTools(
      tools.map(tool => {
        if (tool.id === toolId) {
          const newParams = [...tool.parameters];
          newParams[paramIndex] = { ...newParams[paramIndex], ...updates };
          return { ...tool, parameters: newParams };
        }
        return tool;
      })
    );
  };
  
  const handleRemoveParameter = (toolId: string, paramIndex: number) => {
    setTools(
      tools.map(tool => {
        if (tool.id === toolId) {
          return {
            ...tool,
            parameters: tool.parameters.filter((_, i) => i !== paramIndex),
          };
        }
        return tool;
      })
    );
  };
  
  return (
    <div className="flex h-full">
      {/* Agent list sidebar */}
      <div className="w-64 border-r p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Agents</h2>
        
        <Button onClick={handleCreateAgent} className="mb-4 w-full">
          <PlusCircle size={16} className="mr-2" />
          New Agent
        </Button>
        
        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {agents.map(agent => (
              <div
                key={agent.id}
                className={`p-2 rounded cursor-pointer flex items-center ${
                  selectedAgentId === agent.id ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSelectAgent(agent.id)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                  <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 truncate">
                  <div className="font-medium text-sm">{agent.name}</div>
                  <div className="text-xs opacity-70 truncate">{agent.model}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Agent configuration area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {(selectedAgentId || isCreating) ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isCreating ? 'Create New Agent' : 'Edit Agent'}
              </h2>
              
              <div className="flex space-x-2">
                <Button onClick={handleSave} className="flex items-center">
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
                
                {!isCreating && (
                  <Button variant="destructive" onClick={handleDeleteAgent}>
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Agent name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of this agent's role"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <div className="flex justify-between">
                      <Label htmlFor="instructions">Instructions</Label>
                      <span className="text-xs text-gray-500">
                        {tokenCount} tokens
                      </span>
                    </div>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Detailed instructions for the agent's behavior"
                      rows={8}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <select
                      id="model"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {appConfig.models.map((modelConfig) => (
                        <option key={modelConfig.id} value={modelConfig.id}>
                          {modelConfig.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2 flex items-center">
                    <div className="flex-1">
                      <Label htmlFor="isActive">Status</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Switch
                          id="isActive"
                          checked={selectedAgent?.isActive ?? true}
                          onCheckedChange={(checked) => {
                            if (selectedAgentId) {
                              updateAgent(selectedAgentId, { isActive: checked });
                            }
                          }}
                        />
                        <Label htmlFor="isActive" className="cursor-pointer">
                          {selectedAgent?.isActive ?? true ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="knowledge">
              <TabsList>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
              
              <TabsContent value="knowledge" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Knowledge Items</h3>
                  <Button onClick={handleAddKnowledgeItem}>
                    <PlusCircle size={16} className="mr-2" />
                    Add Item
                  </Button>
                </div>
                
                {knowledgeBase.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No knowledge items. Add some to help the agent respond more effectively.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {knowledgeBase.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <Input
                                value={item.name}
                                onChange={(e) =>
                                  handleUpdateKnowledgeItem(item.id, { name: e.target.value })
                                }
                                placeholder="Item name"
                                className="w-2/3"
                              />
                              
                              <select
                                value={item.type}
                                onChange={(e) =>
                                  handleUpdateKnowledgeItem(item.id, {
                                    type: e.target.value as 'text' | 'file',
                                  })
                                }
                                className="px-3 py-2 border rounded-md"
                              >
                                <option value="text">Text</option>
                                <option value="file">File</option>
                              </select>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveKnowledgeItem(item.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                            
                            {item.type === 'text' ? (
                              <Textarea
                                value={item.content}
                                onChange={(e) =>
                                  handleUpdateKnowledgeItem(item.id, { content: e.target.value })
                                }
                                placeholder="Enter knowledge content"
                                rows={5}
                              />
                            ) : (
                              <div className="border-2 border-dashed rounded-md p-4 text-center">
                                <Button variant="outline">
                                  <Upload size={16} className="mr-2" />
                                  Upload File
                                </Button>
                                <p className="text-xs text-gray-500 mt-2">
                                  {item.content
                                    ? `File: ${item.content}`
                                    : 'Supported formats: PDF, TXT, DOCX, MD'}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tools" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Tools</h3>
                  <Button onClick={handleAddTool}>
                    <PlusCircle size={16} className="mr-2" />
                    Add Tool
                  </Button>
                </div>
                
                {tools.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No tools configured. Add tools to extend the agent's capabilities.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <Card key={tool.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <Input
                                value={tool.name}
                                onChange={(e) =>
                                  handleUpdateTool(tool.id, { name: e.target.value })
                                }
                                placeholder="Tool name"
                                className="w-2/3"
                              />
                              
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`tool-${tool.id}-active`}
                                  checked={tool.isActive}
                                  onCheckedChange={(checked) =>
                                    handleUpdateTool(tool.id, { isActive: checked })
                                  }
                                />
                                <Label htmlFor={`tool-${tool.id}-active`} className="cursor-pointer">
                                  {tool.isActive ? 'Active' : 'Inactive'}
                                </Label>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTool(tool.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                            
                            <Textarea
                              value={tool.description}
                              onChange={(e) =>
                                handleUpdateTool(tool.id, { description: e.target.value })
                              }
                              placeholder="Tool description"
                              rows={2}
                            />
                            
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Parameters</h4>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAddParameter(tool.id)}
                                >
                                  <PlusCircle size={14} className="mr-1" />
                                  Add Parameter
                                </Button>
                              </div>
                              
                              {tool.parameters.length === 0 ? (
                                <div className="text-center p-4 text-gray-500 border rounded-md">
                                  No parameters defined.
                                </div>
                              ) : (
                                tool.parameters.map((param, index) => (
                                  <div key={index} className="border p-3 rounded-md mb-2">
                                    <div className="grid grid-cols-12 gap-2">
                                      <div className="col-span-3">
                                        <Label className="text-xs">Name</Label>
                                        <Input
                                          value={param.name}
                                          onChange={(e) =>
                                            handleUpdateParameter(tool.id, index, {
                                              name: e.target.value,
                                            })
                                          }
                                          size={10}
                                        />
                                      </div>
                                      
                                      <div className="col-span-3">
                                        <Label className="text-xs">Type</Label>
                                        <select
                                          value={param.type}
                                          onChange={(e) =>
                                            handleUpdateParameter(tool.id, index, {
                                              type: e.target.value as any,
                                            })
                                          }
                                          className="w-full px-3 py-2 border rounded-md"
                                        >
                                          <option value="string">String</option>
                                          <option value="number">Number</option>
                                          <option value="boolean">Boolean</option>
                                          <option value="array">Array</option>
                                          <option value="object">Object</option>
                                        </select>
                                      </div>
                                      
                                      <div className="col-span-4">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                          value={param.description}
                                          onChange={(e) =>
                                            handleUpdateParameter(tool.id, index, {
                                              description: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      
                                      <div className="col-span-1 flex items-end justify-center">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <Checkbox
                                            id={`param-${tool.id}-${index}-required`}
                                            checked={param.required}
                                            onCheckedChange={(checked) =>
                                              handleUpdateParameter(tool.id, index, {
                                                required: !!checked,
                                              })
                                            }
                                          />
                                          <Label
                                            htmlFor={`param-${tool.id}-${index}-required`}
                                            className="text-xs cursor-pointer"
                                          >
                                            Required
                                          </Label>
                                        </div>
                                      </div>
                                      
                                      <div className="col-span-1 flex items-end justify-center">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveParameter(tool.id, index)}
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">No Agent Selected</h3>
              <p className="text-gray-500 mb-4">
                Select an agent from the sidebar or create a new one
              </p>
              <Button onClick={handleCreateAgent}>
                <PlusCircle size={16} className="mr-2" />
                Create New Agent
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentConfig;
