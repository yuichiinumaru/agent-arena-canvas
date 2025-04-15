
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Agent } from '@/types';

interface AgentListProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onCreateAgent: () => void;
  onSelectAgent: (id: string) => void;
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  selectedAgentId,
  onCreateAgent,
  onSelectAgent,
}) => {
  return (
    <div className="w-64 border-r border-border p-4 flex flex-col bg-sidebar">
      <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">Agents</h2>
      
      <Button onClick={onCreateAgent} className="mb-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
        <PlusCircle size={16} className="mr-2" />
        New Agent
      </Button>
      
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {agents.filter(agent => agent.isActive).map(agent => (
            <div
              key={agent.id}
              className={`p-2 rounded cursor-pointer flex items-center ${
                selectedAgentId === agent.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-sidebar-foreground hover:bg-secondary hover:text-sidebar-accent-foreground'
              }`}
              onClick={() => onSelectAgent(agent.id)}
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
  );
};
