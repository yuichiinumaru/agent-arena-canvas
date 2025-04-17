
import React from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { AgentList } from './agent/AgentList';
import { BasicInformation } from './agent/BasicInformation';
import { KnowledgeBase } from './agent/KnowledgeBase';
import { ToolConfig } from './agent/ToolConfig';

const AgentConfig = () => {
  // We're creating a mock implementation since the read-only files can't be modified
  // and they rely on properties not in the AgentContextProps
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Agent Configuration</h1>
      
      {/* These components are in read-only files, so we'll leave them as is */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AgentList />
        </div>
        <div className="md:col-span-2">
          <BasicInformation />
          <KnowledgeBase />
          <ToolConfig />
        </div>
      </div>
    </div>
  );
};

export default AgentConfig;
