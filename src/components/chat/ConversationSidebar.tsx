
import React from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationSidebarProps {
  className?: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({ className }) => {
  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    createNewConversation
  } = useAgent();

  const handleConversationSelect = (id: string) => {
    setCurrentConversationId(id);
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title !== 'New Conversation') {
      return conversation.title;
    }
    
    // If no custom title, get first message or default
    if (conversation.messages.length > 0) {
      const firstUserMessage = conversation.messages.find(msg => msg.sender.type === 'user');
      if (firstUserMessage) {
        const preview = firstUserMessage.content.slice(0, 30);
        return preview + (preview.length < firstUserMessage.content.length ? '...' : '');
      }
    }
    
    return 'New Conversation';
  };

  const getConversationTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className={`flex flex-col h-full bg-background border-r border-border ${className}`}>
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-2">Conversations</h2>
        <Button 
          onClick={createNewConversation} 
          className="w-full flex items-center"
          variant="outline"
        >
          <Plus size={16} className="mr-2" />
          New Conversation
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No conversations yet. Start a new one!
            </div>
          ) : (
            conversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation.id)}
                className={`p-3 rounded-md mb-2 cursor-pointer hover:bg-secondary transition-colors ${
                  currentConversationId === conversation.id ? 'bg-secondary' : ''
                }`}
              >
                <div className="flex items-start">
                  <MessageSquare size={18} className="mt-1 mr-2 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{getConversationTitle(conversation)}</div>
                    <div className="text-xs text-muted-foreground">
                      {getConversationTime(conversation.updatedAt)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {conversation.messages.length} messages
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;
