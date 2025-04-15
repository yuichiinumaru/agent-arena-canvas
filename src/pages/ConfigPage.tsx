
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentConfig from '@/components/config/AgentConfig';
import DatabaseConfig from '@/components/config/DatabaseConfig';
import ModelConfig from '@/components/config/ModelConfig';
import ToolsConfig from '@/components/config/ToolsConfig';
import { useLocation } from 'react-router-dom';

interface ConfigPageProps {
  defaultTab?: 'agents' | 'tools' | 'database' | 'models';
}

const ConfigPage: React.FC<ConfigPageProps> = ({ defaultTab = 'agents' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const location = useLocation();
  
  // Update active tab based on route
  useEffect(() => {
    if (location.pathname === '/agents') setActiveTab('agents');
    else if (location.pathname === '/tools') setActiveTab('tools');
    else if (location.pathname === '/database') setActiveTab('database');
    else if (location.pathname === '/settings') setActiveTab('models');
  }, [location]);
  
  return (
    <div className="h-full overflow-y-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="border-b sticky top-0 bg-white z-10">
          <div className="container py-4">
            <h1 className="text-2xl font-bold mb-4">Configuration</h1>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="agents" className="h-full">
          <AgentConfig />
        </TabsContent>
        
        <TabsContent value="tools" className="h-full">
          <ToolsConfig />
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
