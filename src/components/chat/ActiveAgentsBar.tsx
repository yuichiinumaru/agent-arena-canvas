
import React, { useState } from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AgentSelector from './AgentSelector';
import { Agent } from '@/types';

interface ActiveAgentsBarProps {
  className?: string;
}

const ActiveAgentsBar: React.FC<ActiveAgentsBarProps> = ({ className }) => {
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  const { 
    agents, 
    conversations, 
    currentConversationId,
    addMessageToConversation
  } = useAgent();
  
  // Find current conversation
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  
  // Get active agent IDs from the current conversation
  const activeAgentIds = currentConversation?.participants.agentIds || [];
  
  // Filter agents to get only active ones
  const activeAgents = agents.filter(agent => activeAgentIds.includes(agent.id));

  // Toggle agent selector
  const handleAgentSelectorToggle = () => {
    setIsAgentSelectorOpen(!isAgentSelectorOpen);
  };

  // Handle agent selection changes
  const handleAgentSelectionChange = (selectedIds: string[]) => {
    if (!currentConversationId) return;
    
    // Update conversation participants
    const updatedConversation = {
      ...currentConversation!,
      participants: {
        ...currentConversation!.participants,
        agentIds: selectedIds
      }
    };
    
    // Save the updated conversation
    if (currentConversation) {
      const updatedConversations = conversations.map(c => 
        c.id === currentConversationId ? updatedConversation : c
      );
      
      // Here we would ideally call a method to update the conversation directly
      // For now, let's add a system message to note the change
      if (currentConversationId) {
        const agentsAdded = selectedIds.filter(id => !activeAgentIds.includes(id));
        const agentsRemoved = activeAgentIds.filter(id => !selectedIds.includes(id));
        
        if (agentsAdded.length > 0 || agentsRemoved.length > 0) {
          const addedNames = agentsAdded.map(id => agents.find(a => a.id === id)?.name).filter(Boolean);
          const removedNames = agentsRemoved.map(id => agents.find(a => a.id === id)?.name).filter(Boolean);
          
          let message = '';
          if (addedNames.length > 0) {
            message += `Added agents: ${addedNames.join(', ')}. `;
          }
          if (removedNames.length > 0) {
            message += `Removed agents: ${removedNames.join(', ')}.`;
          }
          
          if (message) {
            addMessageToConversation(currentConversationId, {
              id: Date.now().toString(),
              conversationId: currentConversationId,
              content: message,
              sender: {
                id: 'system',
                name: 'System',
                type: 'system',
                avatar: ''
              },
              mentions: [],
              assignedTo: [],
              timestamp: Date.now(),
              isTask: false
            });
          }
        }
      }
    }
  };

  return (
    <div className={`p-2 border-b border-border bg-background ${className}`}>
      <div className="flex items-center">
        <div className="font-medium text-sm mr-3">Active Agents:</div>
        <div className="flex items-center flex-1 gap-2">
          {activeAgents.length === 0 ? (
            <span className="text-sm text-muted-foreground">No agents selected</span>
          ) : (
            activeAgents.map(agent => (
              <div key={agent.id} className="flex items-center bg-secondary rounded-full px-2 py-1">
                <Avatar className="h-6 w-6 mr-1">
                  <AvatarImage src={agent.avatar} alt={agent.name} />
                  <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{agent.name}</span>
              </div>
            ))
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto"
          onClick={handleAgentSelectorToggle}
        >
          <Plus size={16} />
          <span className="ml-1">Agents</span>
        </Button>
      </div>
      
      {isAgentSelectorOpen && (
        <AgentSelector
          agents={agents}
          selectedAgentIds={activeAgentIds}
          onChange={handleAgentSelectionChange}
        />
      )}
    </div>
  );
};

export default ActiveAgentsBar;
