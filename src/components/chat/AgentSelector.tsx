
import React from 'react';
import { Agent } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentIds: string[];
  onChange: (selectedIds: string[]) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  agents, 
  selectedAgentIds, 
  onChange 
}) => {
  const handleSelectAll = (checked: boolean) => {
    onChange(checked ? agents.map(a => a.id) : []);
  };

  const handleAgentToggle = (agentId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedAgentIds, agentId]);
    } else {
      onChange(selectedAgentIds.filter(id => id !== agentId));
    }
  };

  const allSelected = agents.length > 0 && selectedAgentIds.length === agents.length;
  const someSelected = selectedAgentIds.length > 0 && selectedAgentIds.length < agents.length;

  return (
    <div className="border mt-2 p-4 bg-background rounded-md">
      <div className="mb-2 flex items-center">
        <h3 className="text-sm font-medium flex-1">Select Agents</h3>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all" 
            checked={allSelected} 
            data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
          />
          <label htmlFor="select-all" className="text-xs">Select All</label>
        </div>
      </div>

      <ScrollArea className="h-[150px] overflow-y-auto">
        <div className="space-y-2">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center space-x-3 p-2 rounded hover:bg-secondary">
              <Checkbox 
                id={`agent-${agent.id}`}
                checked={selectedAgentIds.includes(agent.id)}
                onCheckedChange={(checked) => handleAgentToggle(agent.id, !!checked)}
              />
              
              <label 
                htmlFor={`agent-${agent.id}`} 
                className="flex items-center space-x-2 cursor-pointer flex-1"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-medium text-sm">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">{agent.model}</div>
                </div>
              </label>
            </div>
          ))}
          
          {agents.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No agents available. Create agents in the configuration page.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AgentSelector;
