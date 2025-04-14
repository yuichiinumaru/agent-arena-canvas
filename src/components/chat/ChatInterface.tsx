
import React, { useState, useRef, useEffect } from 'react';
import { useAgents } from '@/contexts/AgentContext';
import { Agent, Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, PlusCircle, Settings } from 'lucide-react';
import MessageItem from './MessageItem';
import AgentSelector from './AgentSelector';

const ChatInterface: React.FC = () => {
  const { 
    agents, 
    conversations, 
    currentConversationId, 
    sendMessage, 
    isProcessing,
    createConversation,
  } = useAgents();
  
  const [messageText, setMessageText] = useState('');
  const [isTask, setIsTask] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [mentionedAgentIds, setMentionedAgentIds] = useState<string[]>([]);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const activeAgents = agents.filter(a => a.isActive);
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);
  
  // Focus textarea when component mounts
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Extract @mentions from message text
  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@(\w+)/g) || [];
    return mentions
      .map(mention => mention.substring(1)) // Remove @ symbol
      .map(name => {
        const agent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
        return agent ? agent.id : null;
      })
      .filter((id): id is string => id !== null);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    
    // Extract mentions from text
    const mentions = extractMentions(e.target.value);
    setMentionedAgentIds(mentions);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isProcessing) return;
    
    // If no conversation exists or no agents selected, create one
    if (!currentConversationId || !currentConversation) {
      // If no agents are selected but mentions exist, use mentioned agents
      const agentsToUse = selectedAgentIds.length > 0 
        ? selectedAgentIds 
        : mentionedAgentIds.length > 0 
          ? mentionedAgentIds 
          : activeAgents.map(a => a.id);
      
      if (agentsToUse.length === 0) {
        alert('Please select at least one agent to chat with');
        return;
      }
      
      createConversation(agentsToUse);
      return; // Wait for the next render cycle with the new conversation
    }
    
    // Combine explicitly selected agents with mentioned agents
    const mentions = [...new Set([...selectedAgentIds, ...mentionedAgentIds])];
    
    await sendMessage(messageText, mentions, isTask);
    
    // Clear the input and mentions after sending
    setMessageText('');
    setSelectedAgentIds([]);
    setMentionedAgentIds([]);
    setIsTask(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAgentSelector = () => {
    setShowAgentSelector(!showAgentSelector);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentConversation?.messages.map((message) => (
          <MessageItem key={message.id} message={message} agents={agents} />
        ))}
        {currentConversation?.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm">Select agents and send a message to begin</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Agent selection area (conditionally shown) */}
      {showAgentSelector && (
        <AgentSelector
          agents={activeAgents}
          selectedAgentIds={selectedAgentIds}
          onChange={setSelectedAgentIds}
        />
      )}
      
      {/* Input area */}
      <div className="border-t p-4 space-y-2">
        <div className="flex items-center space-x-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAgentSelector}
            className="flex items-center space-x-1"
          >
            <PlusCircle size={16} />
            <span>Agents</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTask"
              checked={isTask}
              onCheckedChange={(checked) => setIsTask(!!checked)}
            />
            <label htmlFor="isTask" className="text-sm cursor-pointer">
              Mark as task
            </label>
          </div>
          
          <div className="ml-auto">
            <Button variant="ghost" size="sm">
              <Settings size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... Use @agent to mention specific agents"
            className="flex-1 min-h-[80px] max-h-[160px]"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageText.trim() || isProcessing}
            className="self-end"
          >
            <Send size={18} />
          </Button>
        </div>
        
        {/* Show mentioned agents */}
        {mentionedAgentIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {mentionedAgentIds.map(id => {
              const agent = agents.find(a => a.id === id);
              return agent && (
                <span 
                  key={id} 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  @{agent.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
