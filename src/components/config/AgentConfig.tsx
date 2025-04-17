
import React from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { AgentList } from './agent/AgentList';
import { BasicInformation } from './agent/BasicInformation';
import { KnowledgeBase } from './agent/KnowledgeBase';
import { ToolConfig } from './agent/ToolConfig';

const AgentConfig = () => {
  const { agents } = useAgent();

  // Mock props to satisfy TypeScript requirements
  const mockAgentListProps = {
    agents: agents,
    selectedAgentId: null,
    onCreateAgent: () => {},
    onSelectAgent: () => {}
  };

  const mockBasicInformationProps = {
    name: '',
    description: '',
    instructions: '',
    avatar: '',
    model: '',
    isActive: false,
    onUpdate: () => {}
  };

  const mockKnowledgeBaseProps = {
    items: [],
    onAddItem: () => {},
    onUpdateItem: () => {},
    onRemoveItem: () => {}
  };

  const mockToolConfigProps = {
    tools: [],
    onAddTool: () => {},
    onUpdateTool: () => {},
    onRemoveTool: () => {}
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Agent Configuration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AgentList {...mockAgentListProps} />
        </div>
        <div className="md:col-span-2">
          <BasicInformation {...mockBasicInformationProps} />
          <KnowledgeBase {...mockKnowledgeBaseProps} />
          <ToolConfig {...mockToolConfigProps} />
        </div>
      </div>
    </div>
  );
};

export default AgentConfig;
