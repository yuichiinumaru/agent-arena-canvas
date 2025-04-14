
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentConfig from '@/components/config/AgentConfig';
import DatabaseConfig from '@/components/config/DatabaseConfig';
import ModelConfig from '@/components/config/ModelConfig';

const ConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('agents');
  
  return (
    <div className="h-full overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="border-b sticky top-0 bg-white z-10">
          <div className="container py-4">
            <h1 className="text-2xl font-bold mb-4">Configuration</h1>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="agents" className="h-full">
          <AgentConfig />
        </TabsContent>
        
        <TabsContent value="database" className="h-full">
          <DatabaseConfig />
        </TabsContent>
        
        <TabsContent value="models" className="h-full">
          <ModelConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigPage;
