
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentConfig from '@/components/config/AgentConfig';
import ToolsConfig from '@/components/config/ToolsConfig';
import DatabaseConfig from '@/components/config/DatabaseConfig';
import ModelConfig from '@/components/config/ModelConfig';
import { useNavigate, useLocation } from 'react-router-dom';

interface ConfigPageProps {
  defaultTab?: 'agents' | 'tools' | 'database' | 'models';
}

const ConfigPage: React.FC<ConfigPageProps> = ({ defaultTab = 'agents' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'agents':
        navigate('/agents');
        break;
      case 'tools':
        navigate('/tools');
        break;
      case 'database':
        navigate('/database');
        break;
      case 'models':
        navigate('/settings');
        break;
    }
  };
  
  // Determine current tab based on location
  const getCurrentTab = (): string => {
    const path = location.pathname;
    if (path.includes('/agents')) return 'agents';
    if (path.includes('/tools')) return 'tools';
    if (path.includes('/database')) return 'database';
    if (path.includes('/settings')) return 'models';
    return defaultTab;
  };

  return (
    <div className="container mx-auto px-4 py-6 h-full">
      <Tabs
        defaultValue={getCurrentTab()}
        value={getCurrentTab()}
        onValueChange={handleTabChange}
        className="w-full h-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>

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
