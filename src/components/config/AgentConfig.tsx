import React, { useState, useEffect } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import geminiService from '@/services/geminiService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Trash2, PlusCircle } from 'lucide-react';
import { AgentList } from './agent/AgentList';
import { BasicInformation } from './agent/BasicInformation';
import { KnowledgeBase } from './agent/KnowledgeBase';
import { ToolConfig } from './agent/ToolConfig';
import { Agent, KnowledgeItem, Tool, ToolParameter } from '@/types';

const AgentConfig: React.FC = () => {
  const { agents, addAgent, updateAgent, removeAgent, appConfig } = useAgent();
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
      <AgentList
        agents={agents}
        selectedAgentId={selectedAgentId}
        onCreateAgent={handleCreateAgent}
        onSelectAgent={handleSelectAgent}
      />
      
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
            
            <BasicInformation
              name={name}
              description={description}
              instructions={instructions}
              avatar={avatar}
              model={model}
              tokenCount={tokenCount}
              isActive={selectedAgent?.isActive}
              models={appConfig.models}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onInstructionsChange={setInstructions}
              onAvatarChange={setAvatar}
              onModelChange={setModel}
              onActiveChange={selectedAgent ? (checked) => updateAgent(selectedAgent.id, { isActive: checked }) : undefined}
            />
            
            <Tabs defaultValue="knowledge">
              <TabsList>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
              
              <TabsContent value="knowledge" className="space-y-4 mt-4">
                <KnowledgeBase
                  items={knowledgeBase}
                  onAddItem={handleAddKnowledgeItem}
                  onUpdateItem={handleUpdateKnowledgeItem}
                  onRemoveItem={handleRemoveKnowledgeItem}
                />
              </TabsContent>
              
              <TabsContent value="tools" className="space-y-4 mt-4">
                <ToolConfig
                  tools={tools}
                  onAddTool={handleAddTool}
                  onUpdateTool={handleUpdateTool}
                  onRemoveTool={handleRemoveTool}
                  onAddParameter={handleAddParameter}
                  onUpdateParameter={handleUpdateParameter}
                  onRemoveParameter={handleRemoveParameter}
                />
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
