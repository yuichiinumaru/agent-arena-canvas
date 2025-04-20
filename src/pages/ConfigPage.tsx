import React from 'react';
import AgentConfig from '@/components/config/AgentConfig';
import ToolsConfig from '@/components/config/ToolsConfig';
import DatabaseConfig from '@/components/config/DatabaseConfig';
import ModelConfig from '@/components/config/ModelConfig';
import { useLocation } from 'react-router-dom';

const ConfigPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  switch (path) {
    case '/agents':
      return <AgentConfig />;
    case '/tools':
      return <ToolsConfig />;
    case '/database':
      return <DatabaseConfig />;
    case '/settings':
      return <ModelConfig />;
    default:
      return <AgentConfig />;
  }
};

export default ConfigPage;
